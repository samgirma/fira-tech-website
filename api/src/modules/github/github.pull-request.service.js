import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizePullRequest } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch pull requests from a GitHub repository.
 * @param {string} repoFullName - Repository full name
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} Normalized pull requests
 */
export async function getPullRequestsFromGitHub(repoFullName, options = {}) {
  const client = createGitHubClient()
  const allPRs = []
  let page = 1

  while (true) {
    const { data, pagination } = await client.get(`/repos/${repoFullName}/pulls`, {
      page,
      perPage: 100,
      state: options.state || 'all',
      sort: 'updated',
      direction: 'desc',
    })

    allPRs.push(...data)

    if (!pagination.next || data.length === 0) break
    page = pagination.next

    if (allPRs.length >= 500) break
  }

  return allPRs.map(normalizePullRequest)
}

/**
 * Get pull requests from the local database.
 * @param {Object} filters - Filter options
 * @returns {Promise<Object[]>}
 */
export async function getLocalPullRequests(filters = {}) {
  let query = `
    SELECT pr.*, r.name as repository_name, r.full_name as repository_full_name
    FROM github_pull_requests pr
    LEFT JOIN github_repositories r ON pr.repository_id = r.id
    WHERE 1=1
  `
  const params = []
  let paramIndex = 1

  if (filters.repositoryId) {
    query += ` AND pr.repository_id = $${paramIndex}`
    params.push(filters.repositoryId)
    paramIndex++
  }

  if (filters.state) {
    query += ` AND pr.state = $${paramIndex}`
    params.push(filters.state)
    paramIndex++
  }

  if (filters.author) {
    query += ` AND pr.author_login = $${paramIndex}`
    params.push(filters.author)
    paramIndex++
  }

  if (filters.merged !== undefined) {
    query += ` AND pr.merged = $${paramIndex}`
    params.push(filters.merged)
    paramIndex++
  }

  query += ' ORDER BY pr.updated_at_github DESC'

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`
    params.push(filters.limit)
    paramIndex++
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`
    params.push(filters.offset)
    paramIndex++
  }

  const result = await db.query(query, params)
  return result.rows
}

/**
 * Sync pull requests for a specific repository.
 * @param {string} repositoryId - Local repository UUID
 * @param {string} repoFullName - Repository full name
 * @returns {Promise<Object>} Sync result
 */
export async function syncPullRequests(repositoryId, repoFullName) {
  const startedAt = new Date()
  let created = 0
  let updated = 0
  const errors = []

  try {
    const githubPRs = await getPullRequestsFromGitHub(repoFullName, { state: 'all' })

    const existingResult = await db.query(
      'SELECT github_id FROM github_pull_requests WHERE repository_id = $1',
      [repositoryId]
    )
    const existingGithubIds = new Set(existingResult.rows.map(pr => pr.github_id))

    for (const pr of githubPRs) {
      try {
        const result = await db.query(
          `INSERT INTO github_pull_requests (
            github_id, number, title, body, state, merged, merged_at,
            html_url, repository_id, author_login, head_branch, base_branch,
            additions, deletions, changed_files, mergeable, review_comments,
            created_at_github, updated_at_github, closed_at_github, last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
          ON CONFLICT (github_id) DO UPDATE SET
            number = EXCLUDED.number,
            title = EXCLUDED.title,
            body = EXCLUDED.body,
            state = EXCLUDED.state,
            merged = EXCLUDED.merged,
            merged_at = EXCLUDED.merged_at,
            html_url = EXCLUDED.html_url,
            author_login = EXCLUDED.author_login,
            head_branch = EXCLUDED.head_branch,
            base_branch = EXCLUDED.base_branch,
            additions = EXCLUDED.additions,
            deletions = EXCLUDED.deletions,
            changed_files = EXCLUDED.changed_files,
            mergeable = EXCLUDED.mergeable,
            review_comments = EXCLUDED.review_comments,
            updated_at_github = EXCLUDED.updated_at_github,
            closed_at_github = EXCLUDED.closed_at_github,
            last_synced_at = NOW()
          RETURNING (xmax = 0) as inserted`,
          [
            pr.githubId, pr.number, pr.title, pr.body, pr.state, pr.merged, pr.mergedAt,
            pr.htmlUrl, repositoryId, pr.authorLogin, pr.headBranch, pr.baseBranch,
            pr.additions, pr.deletions, pr.changedFiles, pr.mergeable, pr.reviewComments,
            pr.createdAtGithub, pr.updatedAtGithub, pr.closedAtGithub,
          ]
        )

        if (result.rows[0].inserted) {
          created++
        } else {
          updated++
        }

        existingGithubIds.delete(pr.githubId)
      } catch (err) {
        errors.push(`PR #${pr.number}: ${err.message}`)
      }
    }

    safeLog('info', 'PR sync completed', { repoFullName, created, updated })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      pullRequests: { created, updated, unchanged: existingGithubIds.size },
      errors,
    }
  } catch (error) {
    safeLog('error', 'PR sync failed', { repoFullName, error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      pullRequests: { created, updated, unchanged: 0 },
      errors: [...errors, error.message],
    }
  }
}
