import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, projectSchema } from '../middleware/validate.js'

const router = Router()

// GET /api/projects - Public: list active projects
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as customer_name
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.status NOT IN ('cancelled')
       ORDER BY p.created_at DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/projects/stats - Admin: get project stats
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

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.name as customer_name, c.email as customer_email
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Get tasks for this project
    const tasks = await db.query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    )

    return res.status(200).json({
      ...result.rows[0],
      tasks: tasks.rows,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/projects - Admin: create project
router.post('/', authenticate, requireAdmin, validate(projectSchema), async (req, res) => {
  try {
    const { name, customerId, description, category, status, progress, startDate, deadline, budget, technologies, priority } = req.body

    const result = await db.query(
      `INSERT INTO projects (name, customer_id, description, category, status, progress, start_date, deadline, budget, technologies, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, customerId, description, category, status || 'planning', progress || 0, startDate, deadline, budget, technologies, priority || 'medium']
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
    const { name, customerId, description, category, status, progress, startDate, deadline, budget, actualCost, revenue, technologies, priority } = req.body

    const result = await db.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           customer_id = COALESCE($2, customer_id),
           description = COALESCE($3, description),
           category = COALESCE($4, category),
           status = COALESCE($5, status),
           progress = COALESCE($6, progress),
           start_date = COALESCE($7, start_date),
           deadline = COALESCE($8, deadline),
           budget = COALESCE($9, budget),
           actual_cost = COALESCE($10, actual_cost),
           revenue = COALESCE($11, revenue),
           technologies = COALESCE($12, technologies),
           priority = COALESCE($13, priority),
           updated_at = NOW()
       WHERE id = $14 RETURNING *`,
      [name, customerId, description, category, status, progress, startDate, deadline, budget, actualCost, revenue, technologies, priority, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating project:', error)
    return res.status(500).json({ error: 'Failed to update project' })
  }
})

// DELETE /api/projects/:id - Admin: delete project
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    return res.status(200).json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
