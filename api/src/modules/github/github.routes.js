import { Router } from 'express'
import { authenticate, requireAdmin } from '../../middleware/auth.js'
import { getConnectionStatus, getOrganization, syncOrganization } from './github.organization.service.js'
import { getLocalRepositories, getLocalRepository, syncRepositories } from './github.repository.service.js'
import { getLocalMembers, syncMembers } from './github.member.service.js'
import { getLocalIssues, syncIssues } from './github.issue.service.js'
import { getLocalPullRequests, syncPullRequests } from './github.pull-request.service.js'
import { getLocalReleases, syncReleases } from './github.release.service.js'
import { getLocalWorkflowRuns, syncWorkflowRuns } from './github.workflow.service.js'
import { getEngineeringHealth, getRecentActivity, getRepositoryActivity } from './github.activity.service.js'
import { fullSync } from './github.sync.service.js'
import { verifyWebhookSignature, processWebhookEvent, isDuplicateDelivery } from './github.webhook.service.js'
import { normalizeGitHubError } from './github.client.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

const router = Router()

// ============================================
// PUBLIC / DIAGNOSTIC
// ============================================

// GET /api/v1/integrations/github/status - Connection status
router.get('/status', async (req, res) => {
  try {
    const status = await getConnectionStatus()
    return res.json(status)
  } catch (error) {
    const normalized = normalizeGitHubError(error)
    return res.status(normalized.status).json({ error: normalized.message })
  }
})

// ============================================
// WEBHOOK (PUBLIC - no auth, but signature verified)
// ============================================

// POST /api/v1/integrations/github/webhook
router.post('/webhook', async (req, res) => {
  const deliveryId = req.headers['x-github-delivery']
  const eventType = req.headers['x-github-event']
  const signature = req.headers['x-hub-signature-256']

  // Verify signature
  if (!verifyWebhookSignature(req.body, signature)) {
    safeLog('warn', 'Invalid webhook signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  // Check idempotency
  if (await isDuplicateDelivery(deliveryId)) {
    return res.status(200).json({ status: 'already_processed' })
  }

  // Process event
  let payload
  try {
    // req.body is a Buffer from express.raw()
    const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body
    payload = JSON.parse(bodyStr)
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const result = await processWebhookEvent({
    deliveryId,
    eventType,
    payload,
  })

  return res.status(200).json({ status: result.success ? 'ok' : 'error' })
})

// ============================================
// ADMIN - PROTECTED
// ============================================

// All routes below require admin authentication
router.use(authenticate, requireAdmin)

// GET /api/v1/integrations/github/organization
router.get('/organization', async (req, res) => {
  try {
    const org = await getOrganization()
    return res.json(org)
  } catch (error) {
    const normalized = normalizeGitHubError(error)
    return res.status(normalized.status).json({ error: normalized.message })
  }
})

// GET /api/v1/integrations/github/repositories
router.get('/repositories', async (req, res) => {
  try {
    const { archived, private: isPrivate, search, language, sort, direction, limit, offset } = req.query
    const repos = await getLocalRepositories({
      archived: archived !== undefined ? archived === 'true' : undefined,
      private: isPrivate !== undefined ? isPrivate === 'true' : undefined,
      search,
      language,
      sort,
      direction,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })
    return res.json(repos)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

// GET /api/v1/integrations/github/repositories/:id
router.get('/repositories/:id', async (req, res) => {
  try {
    const repo = await getLocalRepository(req.params.id)
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    // Get related data
    const [issues, pullRequests, releases, workflows, activity] = await Promise.all([
      getLocalIssues({ repositoryId: repo.id, limit: 20 }),
      getLocalPullRequests({ repositoryId: repo.id, limit: 20 }),
      getLocalReleases({ repositoryId: repo.id, limit: 10 }),
      getLocalWorkflowRuns({ repositoryId: repo.id, limit: 20 }),
      getRepositoryActivity(repo.id, { limit: 20 }),
    ])

    return res.json({
      ...repo,
      issues,
      pullRequests,
      releases,
      workflows,
      activity,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch repository' })
  }
})

// GET /api/v1/integrations/github/members
router.get('/members', async (req, res) => {
  try {
    const members = await getLocalMembers()
    return res.json(members)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch members' })
  }
})

// GET /api/v1/integrations/github/issues
router.get('/issues', async (req, res) => {
  try {
    const { repositoryId, state, assignee, search, limit, offset } = req.query
    const issues = await getLocalIssues({
      repositoryId,
      state,
      assignee,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })
    return res.json(issues)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch issues' })
  }
})

// GET /api/v1/integrations/github/pull-requests
router.get('/pull-requests', async (req, res) => {
  try {
    const { repositoryId, state, author, merged, limit, offset } = req.query
    const prs = await getLocalPullRequests({
      repositoryId,
      state,
      author,
      merged: merged !== undefined ? merged === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })
    return res.json(prs)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pull requests' })
  }
})

// GET /api/v1/integrations/github/releases
router.get('/releases', async (req, res) => {
  try {
    const { repositoryId, limit } = req.query
    const releases = await getLocalReleases({
      repositoryId,
      limit: limit ? parseInt(limit) : undefined,
    })
    return res.json(releases)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch releases' })
  }
})

// GET /api/v1/integrations/github/workflows
router.get('/workflows', async (req, res) => {
  try {
    const { repositoryId, status, conclusion, limit } = req.query
    const runs = await getLocalWorkflowRuns({
      repositoryId,
      status,
      conclusion,
      limit: limit ? parseInt(limit) : undefined,
    })
    return res.json(runs)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch workflow runs' })
  }
})

// GET /api/v1/integrations/github/health
router.get('/health', async (req, res) => {
  try {
    const health = await getEngineeringHealth()
    return res.json(health)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch engineering health' })
  }
})

// GET /api/v1/integrations/github/activity
router.get('/activity', async (req, res) => {
  try {
    const { limit } = req.query
    const activity = await getRecentActivity({ limit: limit ? parseInt(limit) : 30 })
    return res.json(activity)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

// POST /api/v1/integrations/github/sync
router.post('/sync', async (req, res) => {
  try {
    const { organization, repositories, members, issues, pullRequests, releases, workflows } = req.body
    const result = await fullSync({
      organization,
      repositories,
      members,
      issues,
      pullRequests,
      releases,
      workflows,
    })
    return res.json(result)
  } catch (error) {
    return res.status(500).json({ error: 'Sync failed' })
  }
})

// ============================================
// PROJECT ↔ REPOSITORY LINKING
// ============================================

// GET /api/v1/integrations/github/projects/:projectId/repositories
router.get('/projects/:projectId/repositories', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, pr.is_primary, pr.role as link_role
       FROM github_repositories r
       JOIN project_github_repositories pr ON r.id = pr.repository_id
       WHERE pr.project_id = $1
       ORDER BY pr.is_primary DESC, r.name ASC`,
      [req.params.projectId]
    )
    return res.json(result.rows)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch project repositories' })
  }
})

// POST /api/v1/integrations/github/projects/:projectId/repositories
router.post('/projects/:projectId/repositories', async (req, res) => {
  try {
    const { repositoryId, isPrimary, role } = req.body

    const result = await db.query(
      `INSERT INTO project_github_repositories (project_id, repository_id, is_primary, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, repository_id) DO UPDATE SET
         is_primary = COALESCE(EXCLUDED.is_primary, project_github_repositories.is_primary),
         role = COALESCE(EXCLUDED.role, project_github_repositories.role)
       RETURNING *`,
      [req.params.projectId, repositoryId, isPrimary || false, role]
    )

    // If setting as primary, unset other primaries
    if (isPrimary) {
      await db.query(
        `UPDATE project_github_repositories
         SET is_primary = false
         WHERE project_id = $1 AND repository_id != $2 AND is_primary = true`,
        [req.params.projectId, repositoryId]
      )
    }

    return res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Repository already linked to this project' })
    }
    return res.status(500).json({ error: 'Failed to link repository' })
  }
})

// DELETE /api/v1/integrations/github/projects/:projectId/repositories/:repositoryId
router.delete('/projects/:projectId/repositories/:repositoryId', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM project_github_repositories WHERE project_id = $1 AND repository_id = $2 RETURNING *',
      [req.params.projectId, req.params.repositoryId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' })
    }

    return res.json({ message: 'Repository unlinked from project' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to unlink repository' })
  }
})

// PUT /api/v1/integrations/github/projects/:projectId/repositories/:repositoryId/primary
router.put('/projects/:projectId/repositories/:repositoryId/primary', async (req, res) => {
  try {
    // Unset all primaries for this project
    await db.query(
      'UPDATE project_github_repositories SET is_primary = false WHERE project_id = $1',
      [req.params.projectId]
    )

    // Set the specified one as primary
    const result = await db.query(
      `UPDATE project_github_repositories
       SET is_primary = true
       WHERE project_id = $1 AND repository_id = $2
       RETURNING *`,
      [req.params.projectId, req.params.repositoryId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' })
    }

    return res.json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error: 'Failed to set primary repository' })
  }
})

// ============================================
// TASK ↔ ISSUE LINKING
// ============================================

// GET /api/v1/integrations/github/tasks/:taskId/issues
router.get('/tasks/:taskId/issues', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, r.name as repository_name
       FROM github_issues i
       JOIN github_repositories r ON i.repository_id = r.id
       JOIN task_github_issues ti ON i.id = ti.issue_id
       WHERE ti.task_id = $1`,
      [req.params.taskId]
    )
    return res.json(result.rows)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch task issues' })
  }
})

// POST /api/v1/integrations/github/tasks/:taskId/issues
router.post('/tasks/:taskId/issues', async (req, res) => {
  try {
    const { issueId } = req.body
    await db.query(
      'INSERT INTO task_github_issues (task_id, issue_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.taskId, issueId]
    )
    return res.status(201).json({ message: 'Issue linked to task' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to link issue' })
  }
})

// DELETE /api/v1/integrations/github/tasks/:taskId/issues/:issueId
router.delete('/tasks/:taskId/issues/:issueId', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM task_github_issues WHERE task_id = $1 AND issue_id = $2',
      [req.params.taskId, req.params.issueId]
    )
    return res.json({ message: 'Issue unlinked from task' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to unlink issue' })
  }
})

export default router
