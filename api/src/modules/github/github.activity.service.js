import { db } from '../../config/database.js'

/**
 * Get engineering health metrics for the organization.
 * @returns {Promise<Object>} Engineering health data
 */
export async function getEngineeringHealth() {
  const [reposCount, openPRs, openIssues, workflowStats, recentReleases] = await Promise.all([
    db.query('SELECT COUNT(*) as count FROM github_repositories WHERE archived = false'),
    db.query('SELECT COUNT(*) as count FROM github_pull_requests WHERE state = \'open\''),
    db.query('SELECT COUNT(*) as count FROM github_issues WHERE state = \'open\''),
    db.query(`
      SELECT
        COUNT(*) FILTER (WHERE conclusion = 'success') as successful,
        COUNT(*) FILTER (WHERE conclusion = 'failure') as failed,
        COUNT(*) FILTER (WHERE status = 'in_progress') as running,
        COUNT(*) FILTER (WHERE conclusion = 'cancelled') as cancelled
      FROM github_workflow_runs
      WHERE created_at_github > NOW() - INTERVAL '30 days'
    `),
    db.query(`
      SELECT r.name as repository_name, rel.tag_name, rel.name as release_name, rel.published_at_github, rel.html_url
      FROM github_releases rel
      JOIN github_repositories r ON rel.repository_id = r.id
      WHERE rel.draft = false
      ORDER BY rel.published_at_github DESC
      LIMIT 5
    `),
  ])

  const totalWorkflows = parseInt(workflowStats.rows[0].successful) +
                          parseInt(workflowStats.rows[0].failed) +
                          parseInt(workflowStats.rows[0].running) +
                          parseInt(workflowStats.rows[0].cancelled)

  const ciSuccessRate = totalWorkflows > 0
    ? Math.round((parseInt(workflowStats.rows[0].successful) / totalWorkflows) * 100)
    : 100

  return {
    repositories: parseInt(reposCount.rows[0].count),
    openPullRequests: parseInt(openPRs.rows[0].count),
    openIssues: parseInt(openIssues.rows[0].count),
    workflowRuns: {
      successful: parseInt(workflowStats.rows[0].successful),
      failed: parseInt(workflowStats.rows[0].failed),
      running: parseInt(workflowStats.rows[0].running),
      cancelled: parseInt(workflowStats.rows[0].cancelled),
    },
    ciSuccessRate,
    recentReleases: recentReleases.rows,
  }
}

/**
 * Get recent engineering activity across the organization.
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} Activity timeline
 */
export async function getRecentActivity(options = {}) {
  const limit = options.limit || 30

  const [recentPRs, recentIssues, recentReleases, recentWorkflows] = await Promise.all([
    db.query(`
      SELECT
        'pull_request' as type,
        pr.title,
        pr.number,
        pr.state,
        pr.merged,
        pr.author_login,
        pr.html_url,
        pr.updated_at_github as timestamp,
        r.name as repository_name
      FROM github_pull_requests pr
      JOIN github_repositories r ON pr.repository_id = r.id
      ORDER BY pr.updated_at_github DESC
      LIMIT $1
    `, [limit]),
    db.query(`
      SELECT
        'issue' as type,
        i.title,
        i.number,
        i.state,
        i.author_login,
        i.html_url,
        i.updated_at_github as timestamp,
        r.name as repository_name
      FROM github_issues i
      JOIN github_repositories r ON i.repository_id = r.id
      ORDER BY i.updated_at_github DESC
      LIMIT $1
    `, [limit]),
    db.query(`
      SELECT
        'release' as type,
        rel.name as title,
        rel.tag_name as number,
        'published' as state,
        rel.author_login,
        rel.html_url,
        rel.published_at_github as timestamp,
        r.name as repository_name
      FROM github_releases rel
      JOIN github_repositories r ON rel.repository_id = r.id
      WHERE rel.draft = false
      ORDER BY rel.published_at_github DESC
      LIMIT $1
    `, [limit]),
    db.query(`
      SELECT
        'workflow' as type,
        w.name as title,
        w.run_number as number,
        w.conclusion as state,
        NULL as author_login,
        w.html_url,
        w.updated_at_github as timestamp,
        r.name as repository_name
      FROM github_workflow_runs w
      JOIN github_repositories r ON w.repository_id = r.id
      WHERE w.conclusion IS NOT NULL
      ORDER BY w.updated_at_github DESC
      LIMIT $1
    `, [limit]),
  ])

  // Merge and sort all activity
  const allActivity = [
    ...recentPRs.rows,
    ...recentIssues.rows,
    ...recentReleases.rows,
    ...recentWorkflows.rows,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
   .slice(0, limit)

  return allActivity
}

/**
 * Get activity for a specific repository.
 * @param {string} repositoryId - Repository UUID
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} Repository activity
 */
export async function getRepositoryActivity(repositoryId, options = {}) {
  const limit = options.limit || 20

  const [recentPRs, recentIssues, recentReleases, recentWorkflows] = await Promise.all([
    db.query(`
      SELECT
        'pull_request' as type,
        pr.title,
        pr.number,
        pr.state,
        pr.merged,
        pr.author_login,
        pr.html_url,
        pr.updated_at_github as timestamp
      FROM github_pull_requests pr
      WHERE pr.repository_id = $1
      ORDER BY pr.updated_at_github DESC
      LIMIT $2
    `, [repositoryId, limit]),
    db.query(`
      SELECT
        'issue' as type,
        i.title,
        i.number,
        i.state,
        i.author_login,
        i.html_url,
        i.updated_at_github as timestamp
      FROM github_issues i
      WHERE i.repository_id = $1
      ORDER BY i.updated_at_github DESC
      LIMIT $2
    `, [repositoryId, limit]),
    db.query(`
      SELECT
        'release' as type,
        rel.name as title,
        rel.tag_name as number,
        'published' as state,
        rel.author_login,
        rel.html_url,
        rel.published_at_github as timestamp
      FROM github_releases rel
      WHERE rel.repository_id = $1 AND rel.draft = false
      ORDER BY rel.published_at_github DESC
      LIMIT $2
    `, [repositoryId, limit]),
    db.query(`
      SELECT
        'workflow' as type,
        w.name as title,
        w.run_number as number,
        w.conclusion as state,
        NULL as author_login,
        w.html_url,
        w.updated_at_github as timestamp
      FROM github_workflow_runs w
      WHERE w.repository_id = $1 AND w.conclusion IS NOT NULL
      ORDER BY w.updated_at_github DESC
      LIMIT $2
    `, [repositoryId, limit]),
  ])

  return [
    ...recentPRs.rows,
    ...recentIssues.rows,
    ...recentReleases.rows,
    ...recentWorkflows.rows,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
   .slice(0, limit)
}
