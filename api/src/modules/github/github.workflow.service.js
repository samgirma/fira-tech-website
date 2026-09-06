import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizeWorkflowRun } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch workflow runs from a GitHub repository.
 * @param {string} repoFullName - Repository full name
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} Normalized workflow runs
 */
export async function getWorkflowRunsFromGitHub(repoFullName, options = {}) {
  const client = createGitHubClient()
  const allRuns = []
  let page = 1

  while (true) {
    const { data, pagination } = await client.get(`/repos/${repoFullName}/actions/runs`, {
      page,
      perPage: 100,
      ...(options.branch && { branch: options.branch }),
    })

    allRuns.push(...(data.workflow_runs || []))

    if (!pagination.next || data.length === 0) break
    page = pagination.next

    if (allRuns.length >= 200) break
  }

  return allRuns.map(normalizeWorkflowRun)
}

/**
 * Get workflow runs from the local database.
 * @param {Object} filters - Filter options
 * @returns {Promise<Object[]>}
 */
export async function getLocalWorkflowRuns(filters = {}) {
  let query = `
    SELECT w.*, r.name as repository_name, r.full_name as repository_full_name
    FROM github_workflow_runs w
    LEFT JOIN github_repositories r ON w.repository_id = r.id
    WHERE 1=1
  `
  const params = []
  let paramIndex = 1

  if (filters.repositoryId) {
    query += ` AND w.repository_id = $${paramIndex}`
    params.push(filters.repositoryId)
    paramIndex++
  }

  if (filters.status) {
    query += ` AND w.status = $${paramIndex}`
    params.push(filters.status)
    paramIndex++
  }

  if (filters.conclusion) {
    query += ` AND w.conclusion = $${paramIndex}`
    params.push(filters.conclusion)
    paramIndex++
  }

  query += ' ORDER BY w.created_at_github DESC'

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`
    params.push(filters.limit)
    paramIndex++
  }

  const result = await db.query(query, params)
  return result.rows
}

/**
 * Sync workflow runs for a specific repository.
 * @param {string} repositoryId - Local repository UUID
 * @param {string} repoFullName - Repository full name
 * @returns {Promise<Object>} Sync result
 */
export async function syncWorkflowRuns(repositoryId, repoFullName) {
  const startedAt = new Date()
  let created = 0
  let updated = 0
  const errors = []

  try {
    const githubRuns = await getWorkflowRunsFromGitHub(repoFullName)

    const existingResult = await db.query(
      'SELECT github_id FROM github_workflow_runs WHERE repository_id = $1',
      [repositoryId]
    )
    const existingGithubIds = new Set(existingResult.rows.map(r => r.github_id))

    for (const run of githubRuns) {
      try {
        const result = await db.query(
          `INSERT INTO github_workflow_runs (
            github_id, name, run_number, branch, status, conclusion, event,
            html_url, repository_id, run_attempt,
            created_at_github, updated_at_github, started_at_github, completed_at_github,
            last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
          ON CONFLICT (github_id) DO UPDATE SET
            name = EXCLUDED.name,
            run_number = EXCLUDED.run_number,
            branch = EXCLUDED.branch,
            status = EXCLUDED.status,
            conclusion = EXCLUDED.conclusion,
            event = EXCLUDED.event,
            html_url = EXCLUDED.html_url,
            run_attempt = EXCLUDED.run_attempt,
            updated_at_github = EXCLUDED.updated_at_github,
            started_at_github = EXCLUDED.started_at_github,
            completed_at_github = EXCLUDED.completed_at_github,
            last_synced_at = NOW()
          RETURNING (xmax = 0) as inserted`,
          [
            run.githubId, run.name, run.runNumber, run.branch, run.status,
            run.conclusion, run.event, run.htmlUrl, repositoryId, run.runAttempt,
            run.createdAtGithub, run.updatedAtGithub, run.startedAtGithub, run.completedAtGithub,
          ]
        )

        if (result.rows[0].inserted) {
          created++
        } else {
          updated++
        }

        existingGithubIds.delete(run.githubId)
      } catch (err) {
        errors.push(`Workflow run ${run.name}: ${err.message}`)
      }
    }

    safeLog('info', 'Workflow sync completed', { repoFullName, created, updated })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      workflowRuns: { created, updated, unchanged: existingGithubIds.size },
      errors,
    }
  } catch (error) {
    safeLog('error', 'Workflow sync failed', { repoFullName, error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      workflowRuns: { created, updated, unchanged: 0 },
      errors: [...errors, error.message],
    }
  }
}
