import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizeIssue } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch issues from a GitHub repository.
 * @param {string} repoFullName - Repository full name (e.g., 'owner/repo')
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} Normalized issues
 */
export async function getIssuesFromGitHub(repoFullName, options = {}) {
  const client = createGitHubClient()
  const allIssues = []
  let page = 1

  while (true) {
    const { data, pagination } = await client.get(`/repos/${repoFullName}/issues`, {
      page,
      perPage: 100,
      state: options.state || 'all',
      sort: 'updated',
      direction: 'desc',
    })

    // Filter out pull requests (GitHub issues API includes PRs)
    const issues = data.filter(item => !item.pull_request)
    allIssues.push(...issues)

    if (!pagination.next || data.length === 0) break
    page = pagination.next

    // Safety limit
    if (allIssues.length >= 500) break
  }

  return allIssues.map(normalizeIssue)
}

/**
 * Get issues from the local database.
 * @param {Object} filters - Filter options
 * @returns {Promise<Object[]>}
 */
export async function getLocalIssues(filters = {}) {
  let query = `
    SELECT i.*, r.name as repository_name, r.full_name as repository_full_name
    FROM github_issues i
    LEFT JOIN github_repositories r ON i.repository_id = r.id
    WHERE 1=1
  `
  const params = []
  let paramIndex = 1

  if (filters.repositoryId) {
    query += ` AND i.repository_id = $${paramIndex}`
    params.push(filters.repositoryId)
    paramIndex++
  }

  if (filters.state) {
    query += ` AND i.state = $${paramIndex}`
    params.push(filters.state)
    paramIndex++
  }

  if (filters.assignee) {
    query += ` AND i.assignee_login = $${paramIndex}`
    params.push(filters.assignee)
    paramIndex++
  }

  if (filters.search) {
    query += ` AND (i.title ILIKE $${paramIndex} OR i.body ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  query += ' ORDER BY i.updated_at_github DESC'

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
 * Sync issues for a specific repository.
 * @param {string} repositoryId - Local repository UUID
 * @param {string} repoFullName - Repository full name
 * @returns {Promise<Object>} Sync result
 */
export async function syncIssues(repositoryId, repoFullName) {
  const startedAt = new Date()
  let created = 0
  let updated = 0
  const errors = []

  try {
    const githubIssues = await getIssuesFromGitHub(repoFullName, { state: 'all' })

    const existingResult = await db.query(
      'SELECT github_id FROM github_issues WHERE repository_id = $1',
      [repositoryId]
    )
    const existingGithubIds = new Set(existingResult.rows.map(i => i.github_id))

    for (const issue of githubIssues) {
      try {
        const result = await db.query(
          `INSERT INTO github_issues (
            github_id, number, title, body, state, state_reason,
            html_url, repository_id, author_login, assignee_login,
            labels, milestone, comments_count, locked,
            created_at_github, updated_at_github, closed_at_github, last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
          ON CONFLICT (github_id) DO UPDATE SET
            number = EXCLUDED.number,
            title = EXCLUDED.title,
            body = EXCLUDED.body,
            state = EXCLUDED.state,
            state_reason = EXCLUDED.state_reason,
            html_url = EXCLUDED.html_url,
            author_login = EXCLUDED.author_login,
            assignee_login = EXCLUDED.assignee_login,
            labels = EXCLUDED.labels,
            milestone = EXCLUDED.milestone,
            comments_count = EXCLUDED.comments_count,
            locked = EXCLUDED.locked,
            updated_at_github = EXCLUDED.updated_at_github,
            closed_at_github = EXCLUDED.closed_at_github,
            last_synced_at = NOW()
          RETURNING (xmax = 0) as inserted`,
          [
            issue.githubId, issue.number, issue.title, issue.body, issue.state,
            issue.stateReason, issue.htmlUrl, repositoryId, issue.authorLogin,
            issue.assigneeLogin, issue.labels, issue.milestone, issue.comments,
            issue.locked, issue.createdAtGithub, issue.updatedAtGithub, issue.closedAtGithub,
          ]
        )

        if (result.rows[0].inserted) {
          created++
        } else {
          updated++
        }

        existingGithubIds.delete(issue.githubId)
      } catch (err) {
        errors.push(`Issue #${issue.number}: ${err.message}`)
      }
    }

    safeLog('info', 'Issue sync completed', { repoFullName, created, updated })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      issues: { created, updated, unchanged: existingGithubIds.size },
      errors,
    }
  } catch (error) {
    safeLog('error', 'Issue sync failed', { repoFullName, error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      issues: { created, updated, unchanged: 0 },
      errors: [...errors, error.message],
    }
  }
}
