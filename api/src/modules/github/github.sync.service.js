import { syncOrganization } from './github.organization.service.js'
import { syncRepositories } from './github.repository.service.js'
import { syncMembers } from './github.member.service.js'
import { syncIssues } from './github.issue.service.js'
import { syncPullRequests } from './github.pull-request.service.js'
import { syncReleases } from './github.release.service.js'
import { syncWorkflowRuns } from './github.workflow.service.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Full synchronization of all GitHub data.
 * @param {Object} options - Sync options
 * @param {boolean} options.organization - Sync organization
 * @param {boolean} options.repositories - Sync repositories
 * @param {boolean} options.members - Sync members
 * @param {boolean} options.issues - Sync issues for all repos
 * @param {boolean} options.pullRequests - Sync PRs for all repos
 * @param {boolean} options.releases - Sync releases for all repos
 * @param {boolean} options.workflows - Sync workflows for all repos
 * @returns {Promise<Object>} Full sync result
 */
export async function fullSync(options = {}) {
  const startedAt = new Date()
  const results = {}
  const errors = []

  const syncAll = !options.organization && !options.repositories && !options.members &&
                  !options.issues && !options.pullRequests && !options.releases && !options.workflows

  try {
    // 1. Sync organization
    if (syncAll || options.organization) {
      try {
        results.organization = await syncOrganization()
      } catch (err) {
        errors.push(`Organization sync: ${err.message}`)
      }
    }

    // 2. Sync repositories
    if (syncAll || options.repositories) {
      try {
        results.repositories = await syncRepositories()
      } catch (err) {
        errors.push(`Repository sync: ${err.message}`)
      }
    }

    // 3. Sync members
    if (syncAll || options.members) {
      try {
        results.members = await syncMembers()
      } catch (err) {
        errors.push(`Member sync: ${err.message}`)
      }
    }

    // Get all synced repositories for issue/PR/release/workflow sync
    const repos = await db.query(
      'SELECT id, full_name FROM github_repositories WHERE archived = false ORDER BY pushed_at_github DESC LIMIT 50'
    )

    // 4. Sync issues
    if (syncAll || options.issues) {
      results.issues = { created: 0, updated: 0, unchanged: 0, errors: [] }
      for (const repo of repos.rows) {
        try {
          const issueResult = await syncIssues(repo.id, repo.full_name)
          results.issues.created += issueResult.issues?.created || 0
          results.issues.updated += issueResult.issues?.updated || 0
          results.issues.unchanged += issueResult.issues?.unchanged || 0
        } catch (err) {
          results.issues.errors.push(`${repo.full_name}: ${err.message}`)
        }
      }
    }

    // 5. Sync pull requests
    if (syncAll || options.pullRequests) {
      results.pullRequests = { created: 0, updated: 0, unchanged: 0, errors: [] }
      for (const repo of repos.rows) {
        try {
          const prResult = await syncPullRequests(repo.id, repo.full_name)
          results.pullRequests.created += prResult.pullRequests?.created || 0
          results.pullRequests.updated += prResult.pullRequests?.updated || 0
          results.pullRequests.unchanged += prResult.pullRequests?.unchanged || 0
        } catch (err) {
          results.pullRequests.errors.push(`${repo.full_name}: ${err.message}`)
        }
      }
    }

    // 6. Sync releases
    if (syncAll || options.releases) {
      results.releases = { created: 0, updated: 0, unchanged: 0, errors: [] }
      for (const repo of repos.rows) {
        try {
          const relResult = await syncReleases(repo.id, repo.full_name)
          results.releases.created += relResult.releases?.created || 0
          results.releases.updated += relResult.releases?.updated || 0
          results.releases.unchanged += relResult.releases?.unchanged || 0
        } catch (err) {
          results.releases.errors.push(`${repo.full_name}: ${err.message}`)
        }
      }
    }

    // 7. Sync workflows
    if (syncAll || options.workflows) {
      results.workflows = { created: 0, updated: 0, unchanged: 0, errors: [] }
      for (const repo of repos.rows) {
        try {
          const wfResult = await syncWorkflowRuns(repo.id, repo.full_name)
          results.workflows.created += wfResult.workflowRuns?.created || 0
          results.workflows.updated += wfResult.workflowRuns?.updated || 0
          results.workflows.unchanged += wfResult.workflowRuns?.unchanged || 0
        } catch (err) {
          results.workflows.errors.push(`${repo.full_name}: ${err.message}`)
        }
      }
    }

    const completedAt = new Date()
    safeLog('info', 'Full sync completed', { duration: completedAt - startedAt })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      results,
      errors,
    }
  } catch (error) {
    safeLog('error', 'Full sync failed', { error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      results,
      errors: [...errors, error.message],
    }
  }
}
