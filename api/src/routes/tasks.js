import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, taskSchema } from '../middleware/validate.js'

const router = Router()

// GET /api/tasks - Admin: list tasks
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, projectId } = req.query
    
    let query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
    `
    const params = []
    const conditions = []

    if (status) {
      conditions.push(`t.status = $${params.length + 1}`)
      params.push(status)
    }

    if (projectId) {
      conditions.push(`t.project_id = $${params.length + 1}`)
      params.push(projectId)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY t.created_at DESC'

    const result = await db.query(query, params)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching tasks:', error.message)
    return res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// GET /api/tasks/today - Admin: get today's tasks
router.get('/today', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, p.name as project_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = $1 AND t.status != 'done'
       ORDER BY 
         CASE t.priority 
           WHEN 'critical' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'medium' THEN 3 
           WHEN 'low' THEN 4 
         END,
         t.due_date ASC`,
      [req.user.id]
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching today tasks:', error.message)
    return res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// GET /api/tasks/:id - Get single task
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, p.name as project_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('fetching task:', error.message)
    return res.status(500).json({ error: 'Failed to fetch task' })
  }
})

// POST /api/tasks - Admin: create task
router.post('/', authenticate, requireAdmin, validate(taskSchema), async (req, res) => {
  try {
    const { title, projectId, status, priority, dueDate, estimatedHours, notes } = req.body

    const result = await db.query(
      `INSERT INTO tasks (title, project_id, assigned_to, status, priority, due_date, estimated_hours, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, projectId, req.user.id, status || 'todo', priority || 'medium', dueDate, estimatedHours, notes]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating task:', error.message)
    return res.status(500).json({ error: 'Failed to create task' })
  }
})

// PUT /api/tasks/:id - Admin: update task
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, projectId, status, priority, dueDate, estimatedHours, actualHours, notes } = req.body

    const result = await db.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           project_id = COALESCE($2, project_id),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           estimated_hours = COALESCE($6, estimated_hours),
           actual_hours = COALESCE($7, actual_hours),
           notes = COALESCE($8, notes),
           updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [title, projectId, status, priority, dueDate, estimatedHours, actualHours, notes, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating task:', error.message)
    return res.status(500).json({ error: 'Failed to update task' })
  }
})

// PATCH /api/tasks/:id/status - Admin: quick status update
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body

    const result = await db.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating task status:', error.message)
    return res.status(500).json({ error: 'Failed to update task status' })
  }
})

// DELETE /api/tasks/:id - Admin: delete task
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    return res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('deleting task:', error.message)
    return res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router
