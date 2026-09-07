import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

const STAGES = ['new', 'contacted', 'proposal_sent', 'won', 'active', 'archived']

// GET /api/clients/pipeline - Summary grouped by stage for Kanban
router.get('/pipeline', authenticate, requireAdmin, async (req, res) => {
  try {
    const clientsResult = await db.query(
      `SELECT * FROM clients ORDER BY created_at DESC`
    )

    const grouped = {}
    STAGES.forEach((s) => {
      grouped[s] = []
    })

    clientsResult.rows.forEach((c) => {
      if (grouped[c.stage]) {
        grouped[c.stage].push(c)
      } else {
        grouped['new'].push(c)
      }
    })

    const stageStats = STAGES.map((stage) => {
      const items = grouped[stage]
      const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.estimated_value) || 0), 0)
      return {
        stage,
        count: items.length,
        totalValue,
      }
    })

    return res.status(200).json({
      stages: grouped,
      stats: stageStats,
      totalCount: clientsResult.rows.length,
    })
  } catch (error) {
    console.error('Error fetching pipeline:', error)
    return res.status(500).json({ error: 'Failed to fetch pipeline' })
  }
})

// GET /api/clients - List all clients with filters
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { stage, search } = req.query
    let query = `
      SELECT c.*,
             (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) as projects_count,
             (SELECT COUNT(*) FROM invoices i WHERE i.client_id = c.id) as invoices_count
      FROM clients c
      WHERE 1=1
    `
    const params = []
    let paramIndex = 1

    if (stage && STAGES.includes(stage)) {
      query += ` AND c.stage = $${paramIndex++}`
      params.push(stage)
    }

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.company ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY c.created_at DESC`

    const result = await db.query(query, params)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return res.status(500).json({ error: 'Failed to fetch clients' })
  }
})

// GET /api/clients/:id - Single client detail with linked projects & invoices
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const clientResult = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id])

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const client = clientResult.rows[0]

    const [projectsResult, invoicesResult] = await Promise.all([
      db.query('SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC', [client.id]),
      db.query('SELECT * FROM invoices WHERE client_id = $1 ORDER BY issue_date DESC', [client.id]),
    ])

    return res.status(200).json({
      ...client,
      projects: projectsResult.rows,
      invoices: invoicesResult.rows,
    })
  } catch (error) {
    console.error('Error fetching client detail:', error)
    return res.status(500).json({ error: 'Failed to fetch client' })
  }
})

// POST /api/clients - Create new client
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      source = 'admin',
      service_interested,
      estimated_value,
      stage = 'new',
      notes,
    } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Client name is required' })
    }

    const validStage = STAGES.includes(stage) ? stage : 'new'

    const result = await db.query(
      `INSERT INTO clients (
        name, company, email, phone, source, service_interested, estimated_value, stage, owner_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        company || null,
        email || null,
        phone || null,
        source,
        service_interested || null,
        estimated_value ? parseFloat(estimated_value) : null,
        validStage,
        req.user?.id || null,
        notes || null,
      ]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating client:', error)
    return res.status(500).json({ error: 'Failed to create client' })
  }
})

// PUT /api/clients/:id - Update client (stage, info, notes)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      source,
      service_interested,
      estimated_value,
      stage,
      notes,
    } = req.body

    const existing = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const validStage = stage && STAGES.includes(stage) ? stage : existing.rows[0].stage

    const result = await db.query(
      `UPDATE clients SET
        name = COALESCE($1, name),
        company = COALESCE($2, company),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        source = COALESCE($5, source),
        service_interested = COALESCE($6, service_interested),
        estimated_value = COALESCE($7, estimated_value),
        stage = $8,
        notes = COALESCE($9, notes),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [
        name,
        company,
        email,
        phone,
        source,
        service_interested,
        estimated_value !== undefined ? (estimated_value ? parseFloat(estimated_value) : null) : undefined,
        validStage,
        notes,
        req.params.id,
      ]
    )

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating client:', error)
    return res.status(500).json({ error: 'Failed to update client' })
  }
})

// DELETE /api/clients/:id - Delete client
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Unlink referencing records before deleting
    await db.query('UPDATE projects SET customer_id = NULL WHERE customer_id = $1', [req.params.id])
    await db.query('UPDATE revenue SET client_id = NULL WHERE client_id = $1', [req.params.id])
    await db.query('UPDATE invoices SET customer_id = NULL WHERE customer_id = $1', [req.params.id])
    const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' })
    }
    return res.status(200).json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return res.status(500).json({ error: 'Failed to delete client' })
  }
})

export default router
