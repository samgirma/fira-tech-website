import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, leadSchema } from '../middleware/validate.js'

const router = Router()

// GET /api/leads - Admin: list all leads
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query
    
    let query = `
      SELECT l.*, u.name as owner_name
      FROM leads l
      LEFT JOIN users u ON l.owner_id = u.id
    `
    const params = []
    const conditions = []

    if (status) {
      conditions.push(`l.status = $${params.length + 1}`)
      params.push(status)
    }

    if (search) {
      conditions.push(`(l.name ILIKE $${params.length + 1} OR l.company ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY l.created_at DESC'

    const result = await db.query(query, params)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching leads:', error.message)
    return res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

// GET /api/leads/stats - Admin: get lead pipeline stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         status,
         COUNT(*) as count,
         COALESCE(SUM(estimated_value), 0) as total_value
       FROM leads
       GROUP BY status`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching lead stats:', error.message)
    return res.status(500).json({ error: 'Failed to fetch lead stats' })
  }
})

// GET /api/leads/:id - Admin: get single lead
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, u.name as owner_name
       FROM leads l
       LEFT JOIN users u ON l.owner_id = u.id
       WHERE l.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('fetching lead:', error.message)
    return res.status(500).json({ error: 'Failed to fetch lead' })
  }
})

// POST /api/leads - Admin: create lead
router.post('/', authenticate, requireAdmin, validate(leadSchema), async (req, res) => {
  try {
    const { name, company, email, phone, serviceInterested, source, estimatedValue, status } = req.body

    const result = await db.query(
      `INSERT INTO leads (name, company, email, phone, service_interested, source, estimated_value, status, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, company, email, phone, serviceInterested, source, estimatedValue, status || 'new', req.user.id]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating lead:', error.message)
    return res.status(500).json({ error: 'Failed to create lead' })
  }
})

// PUT /api/leads/:id - Admin: update lead
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, company, email, phone, serviceInterested, source, estimatedValue, probability, status, notes, nextAction } = req.body

    const result = await db.query(
      `UPDATE leads 
       SET name = COALESCE($1, name),
           company = COALESCE($2, company),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           service_interested = COALESCE($5, service_interested),
           source = COALESCE($6, source),
           estimated_value = COALESCE($7, estimated_value),
           probability = COALESCE($8, probability),
           status = COALESCE($9, status),
           notes = COALESCE($10, notes),
           next_action = COALESCE($11, next_action),
           updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [name, company, email, phone, serviceInterested, source, estimatedValue, probability, status, notes, nextAction, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating lead:', error.message)
    return res.status(500).json({ error: 'Failed to update lead' })
  }
})

// DELETE /api/leads/:id - Admin: delete lead
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM leads WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' })
    }

    return res.status(200).json({ message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('deleting lead:', error.message)
    return res.status(500).json({ error: 'Failed to delete lead' })
  }
})

export default router
