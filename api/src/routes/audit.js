import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.use(authenticate, requireAdmin)

// GET /api/audit - List audit log entries
router.get('/', async (req, res, next) => {
  try {
    const { entity_type, limit = '100', offset = '0' } = req.query
    let query = `
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.details, a.ip_address, a.created_at,
             u.name as user_name, u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
    `
    const params = []
    const conditions = []

    if (entity_type) {
      params.push(entity_type)
      conditions.push(`a.entity_type = $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY a.created_at DESC'

    params.push(parseInt(limit))
    query += ` LIMIT $${params.length}`
    params.push(parseInt(offset))
    query += ` OFFSET $${params.length}`

    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// POST /api/audit - Record an audit event (internal use)
router.post('/', async (req, res, next) => {
  try {
    const { action, entity_type, entity_id, details } = req.body
    const ip = req.ip || req.connection?.remoteAddress
    const result = await db.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.id, action, entity_type, entity_id, details ? JSON.stringify(details) : null, ip]
    )
    res.status(201).json({ id: result.rows[0].id })
  } catch (error) {
    next(error)
  }
})

export default router
