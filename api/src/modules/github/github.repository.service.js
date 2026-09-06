import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizeRepository } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch all repositories from the GitHub organization.
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} Normalized repositories
 */
export async function getRepositoriesFromGitHub(options = {}) {
  const client = createGitHubClient()
  const allRepos = []
  let page = 1

  while (true) {
    const { data, pagination } = await client.get(`/orgs/${process.env.GITHUB_ORG_NAME}/repos`, {
      page,
      perPage: 100,
      sort: 'updated',
      direction: 'desc',
      ...options,
    })

    allRepos.push(...data)

    if (!pagination.next || data.length === 0) break
    page = pagination.next
  }

  return allRepos.map(normalizeRepository)
}

/**
 * Get repositories from the local database.
 * @param {Object} filters - Filter options
 * @returns {Promise<Object[]>}
 */
export async function getLocalRepositories(filters = {}) {
  let query = `
    SELECT r.*, o.login as org_login
    FROM github_repositories r
    LEFT JOIN github_organizations o ON r.organization_id = o.id
    WHERE 1=1
  `
  const params = []
  let paramIndex = 1

  if (filters.archived !== undefined) {
    query += ` AND r.archived = $${paramIndex}`
    params.push(filters.archived)
    paramIndex++
  }

  if (filters.private !== undefined) {
    query += ` AND r.private = $${paramIndex}`
    params.push(filters.private)
    paramIndex++
  }

  if (filters.search) {
    query += ` AND (r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters.language) {
    query += ` AND r.language = $${paramIndex}`
    params.push(filters.language)
    paramIndex++
  }

  const sort = filters.sort || 'pushed_at_github'
  const direction = filters.direction || 'DESC'
  const validSorts = ['name', 'pushed_at_github', 'updated_at_github', 'created_at_github', 'open_issues_count']
  const sortColumn = validSorts.includes(sort) ? sort : 'pushed_at_github'
  query += ` ORDER BY r.${sortColumn} ${direction === 'ASC' ? 'ASC' : 'DESC'}`

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
 * Get a single repository by ID from the local database.
 * @param {string} id - Repository UUID
 * @returns {Promise<Object|null>}
 */
export async function getLocalRepository(id) {
  const result = await db.query('SELECT * FROM github_repositories WHERE id = $1', [id])
  return result.rows[0] || null
}

/**
 * Get a single repository by GitHub ID from the local database.
 * @param {string} githubId - GitHub repository ID
 * @returns {Promise<Object|null>}
 */
export async function getLocalRepositoryByGithubId(githubId) {
  const result = await db.query('SELECT * FROM github_repositories WHERE github_id = $1', [githubId])
  return result.rows[0] || null
}

/**
 * Sync all repositories from GitHub to the local database.
 * @returns {Promise<Object>} Sync result
 */
export async function syncRepositories() {
  const startedAt = new Date()
  let created = 0
  let updated = 0
  let unchanged = 0
  const errors = []

  try {
    // Get or create organization
    const orgResult = await db.query(
      'SELECT id FROM github_organizations ORDER BY created_at DESC LIMIT 1'
    )
    const orgId = orgResult.rows[0]?.id

    if (!orgId) {
      throw new Error('Organization not synced. Sync organization first.')
    }

    // Fetch from GitHub
    const githubRepos = await getRepositoriesFromGitHub()

    // Get existing repos
    const existingResult = await db.query(
      'SELECT github_id FROM github_repositories WHERE organization_id = $1',
      [orgId]
    )
    const existingGithubIds = new Set(existingResult.rows.map(r => r.github_id))

    for (const repo of githubRepos) {
      try {
        const result = await db.query(
          `INSERT INTO github_repositories (
            github_id, organization_id, name, full_name, description,
            private, archived, default_branch, html_url, language,
            stargazers_count, forks_count, open_issues_count,
            created_at_github, updated_at_github, pushed_at_github, last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
          ON CONFLICT (github_id) DO UPDATE SET
            name = EXCLUDED.name,
            full_name = EXCLUDED.full_name,
            description = EXCLUDED.description,
            private = EXCLUDED.private,
            archived = EXCLUDED.archived,
            default_branch = EXCLUDED.default_branch,
            html_url = EXCLUDED.html_url,
            language = EXCLUDED.language,
            stargazers_count = EXCLUDED.stargazers_count,
            forks_count = EXCLUDED.forks_count,
            open_issues_count = EXCLUDED.open_issues_count,
            updated_at_github = EXCLUDED.updated_at_github,
            pushed_at_github = EXCLUDED.pushed_at_github,
            last_synced_at = NOW()
          RETURNING (xmax = 0) as inserted`,
          [
            repo.githubId, orgId, repo.name, repo.fullName, repo.description,
            repo.private, repo.archived, repo.defaultBranch, repo.htmlUrl, repo.language,
            repo.stargazersCount, repo.forksCount, repo.openIssuesCount,
            repo.createdAtGithub, repo.updatedAtGithub, repo.pushedAtGithub,
          ]
        )

        if (result.rows[0].inserted) {
          created++
        } else {
          updated++
        }

        existingGithubIds.delete(repo.githubId)
      } catch (err) {
        errors.push(`Repo ${repo.name}: ${err.message}`)
      }
    }

    safeLog('info', 'Repository sync completed', { created, updated, unchanged: existingGithubIds.size, errors: errors.length })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      repositories: { created, updated, unchanged: existingGithubIds.size },
      errors,
    }
  } catch (error) {
    safeLog('error', 'Repository sync failed', { error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      repositories: { created, updated, unchanged },
      errors: [...errors, error.message],
    }
  }
}
