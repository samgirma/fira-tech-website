import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/projects - List active projects with client and GitHub info
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, 
              COALESCE(cl.name, c.name) as client_name,
              COALESCE(cl.company, c.company) as client_company,
              gr.name as github_repo_name,
              gr.full_name as github_repo_full_name,
              gr.open_issues_count as github_open_issues_count
       FROM projects p
       LEFT JOIN clients cl ON p.client_id = cl.id
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN project_github_repositories pgr ON p.id = pgr.project_id AND pgr.is_primary = true
       LEFT JOIN github_repositories gr ON pgr.repository_id = gr.id
       WHERE p.status NOT IN ('cancelled')
       ORDER BY p.created_at DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/projects/stats - Project statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         status,
         COUNT(*) as count,
         COALESCE(SUM(budget), 0) as total_budget,
         COALESCE(SUM(revenue), 0) as total_revenue
       FROM projects
       GROUP BY status`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return res.status(500).json({ error: 'Failed to fetch project stats' })
  }
})

// GET /api/projects/:id - Single project detail with scoped tasks & live GitHub info
router.get('/:id', async (req, res) => {
  try {
    const projectResult = await db.query(
      `SELECT p.*, 
              COALESCE(cl.name, c.name) as client_name,
              COALESCE(cl.company, c.company) as client_company,
              COALESCE(cl.email, c.email) as client_email
       FROM projects p
       LEFT JOIN clients cl ON p.client_id = cl.id
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    )

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const project = projectResult.rows[0]

    // 1. Scoped tasks for this project
    const tasksResult = await db.query(
      `SELECT * FROM tasks WHERE project_id = $1 ORDER BY 
       CASE WHEN status = 'done' THEN 1 ELSE 0 END, 
       due_date ASC NULLS LAST, 
       created_at DESC`,
      [req.params.id]
    )

    // 2. Linked GitHub repo(s)
    const reposResult = await db.query(
      `SELECT gr.*, pgr.is_primary, pgr.id as link_id
       FROM project_github_repositories pgr
       JOIN github_repositories gr ON pgr.repository_id = gr.id
       WHERE pgr.project_id = $1
       ORDER BY pgr.is_primary DESC, pgr.created_at ASC`,
      [req.params.id]
    )

    const primaryRepo = reposResult.rows[0] || null
    let githubIssues = []
    let githubPullRequests = []
    let githubWorkflows = []

    if (primaryRepo) {
      const [issuesRes, prsRes, runsRes] = await Promise.all([
        db.query(
          `SELECT * FROM github_issues WHERE repository_id = $1 AND state = 'open' ORDER BY number DESC LIMIT 10`,
          [primaryRepo.id]
        ),
        db.query(
          `SELECT * FROM github_pull_requests WHERE repository_id = $1 ORDER BY number DESC LIMIT 5`,
          [primaryRepo.id]
        ),
        db.query(
          `SELECT * FROM github_workflow_runs WHERE repository_id = $1 ORDER BY run_started_at DESC NULLS LAST LIMIT 5`,
          [primaryRepo.id]
        ),
      ])

      githubIssues = issuesRes.rows
      githubPullRequests = prsRes.rows
      githubWorkflows = runsRes.rows
    }

    return res.status(200).json({
      ...project,
      tasks: tasksResult.rows,
      github: {
        linkedRepos: reposResult.rows,
        primaryRepo,
        issues: githubIssues,
        pullRequests: githubPullRequests,
        workflows: githubWorkflows,
      },
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/projects - Admin: create project
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      clientId,
      customerId,
      description,
      category,
      status = 'planning',
      progress = 0,
      startDate,
      deadline,
      budget,
      technologies,
      priority = 'medium',
    } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' })
    }

    const cId = clientId || customerId || null

    const result = await db.query(
      `INSERT INTO projects (
        name, client_id, customer_id, description, category, status, progress, start_date, deadline, budget, technologies, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        name,
        cId,
        cId,
        description || null,
        category || null,
        status,
        progress,
        startDate || null,
        deadline || null,
        budget ? parseFloat(budget) : null,
        technologies || [],
        priority,
      ]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating project:', error)
    return res.status(500).json({ error: 'Failed to create project' })
  }
})

// PUT /api/projects/:id - Admin: update project
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      clientId,
      customerId,
      description,
      category,
      status,
      progress,
      startDate,
      deadline,
      budget,
      actualCost,
      revenue,
      technologies,
      priority,
    } = req.body

    const existing = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const cId = clientId || customerId

    const result = await db.query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        client_id = COALESCE($2, client_id),
        customer_id = COALESCE($3, customer_id),
        description = COALESCE($4, description),
        category = COALESCE($5, category),
        status = COALESCE($6, status),
        progress = COALESCE($7, progress),
        start_date = COALESCE($8, start_date),
        deadline = COALESCE($9, deadline),
        budget = COALESCE($10, budget),
        actual_cost = COALESCE($11, actual_cost),
        revenue = COALESCE($12, revenue),
        technologies = COALESCE($13, technologies),
        priority = COALESCE($14, priority),
        updated_at = NOW()
      WHERE id = $15
      RETURNING *`,
      [
        name,
        cId,
        cId,
        description,
        category,
        status,
        progress,
        startDate,
        deadline,
        budget !== undefined ? (budget ? parseFloat(budget) : null) : undefined,
        actualCost !== undefined ? (actualCost ? parseFloat(actualCost) : null) : undefined,
        revenue !== undefined ? (revenue ? parseFloat(revenue) : null) : undefined,
        technologies,
        priority,
        req.params.id,
      ]
    )

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating project:', error)
    return res.status(500).json({ error: 'Failed to update project' })
  }
})

// DELETE /api/projects/:id - Admin: delete project
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE project_id = $1', [req.params.id])
    await db.query('DELETE FROM project_github_repositories WHERE project_id = $1', [req.params.id])
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    return res.status(200).json({ message: 'Project deleted successfully' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete project' })
  }
})

// --- Scoped Project Tasks ---

// POST /api/projects/:id/tasks - Create task for project
router.post('/:id/tasks', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, priority = 'medium', dueDate, notes } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    const result = await db.query(
      `INSERT INTO tasks (title, project_id, status, priority, due_date, notes)
       VALUES ($1, $2, 'todo', $3, $4, $5)
       RETURNING *`,
      [title, req.params.id, priority, dueDate || null, notes || null]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating project task:', error)
    return res.status(500).json({ error: 'Failed to create task' })
  }
})

// PUT /api/projects/:id/tasks/:taskId - Update task
router.put('/:id/tasks/:taskId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, status, priority, dueDate, notes } = req.body

    const result = await db.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        status = COALESCE($2, status),
        priority = COALESCE($3, priority),
        due_date = COALESCE($4, due_date),
        notes = COALESCE($5, notes),
        updated_at = NOW()
      WHERE id = $6 AND project_id = $7
      RETURNING *`,
      [title, status, priority, dueDate, notes, req.params.taskId, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task' })
  }
})

// DELETE /api/projects/:id/tasks/:taskId - Delete task
router.delete('/:id/tasks/:taskId', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING id',
      [req.params.taskId, req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }
    return res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete task' })
  }
})

// --- Project GitHub Linking ---

// POST /api/projects/:id/github - Link repository to project
router.post('/:id/github', authenticate, requireAdmin, async (req, res) => {
  try {
    const { repositoryId, isPrimary = true } = req.body
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID is required' })
    }

    if (isPrimary) {
      await db.query(
        'UPDATE project_github_repositories SET is_primary = false WHERE project_id = $1',
        [req.params.id]
      )
    }

    const result = await db.query(
      `INSERT INTO project_github_repositories (project_id, repository_id, is_primary)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, repository_id) DO UPDATE SET is_primary = $3
       RETURNING *`,
      [req.params.id, repositoryId, isPrimary]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error linking repo:', error)
    return res.status(500).json({ error: 'Failed to link repository' })
  }
})

// DELETE /api/projects/:id/github/:repoId - Unlink repository
router.delete('/:id/github/:repoId', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM project_github_repositories WHERE project_id = $1 AND repository_id = $2',
      [req.params.id, req.params.repoId]
    )
    return res.status(200).json({ message: 'Repository unlinked successfully' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to unlink repository' })
  }
})

export default router
