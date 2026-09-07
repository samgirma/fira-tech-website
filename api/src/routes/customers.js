import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/customers - Admin: list customers
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM projects p WHERE p.customer_id = c.id) as project_count,
              (SELECT COUNT(*) FROM leads l WHERE l.email = c.email) as lead_count
       FROM customers c
       ORDER BY c.created_at DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching customers:', error.message)
    return res.status(500).json({ error: 'Failed to fetch customers' })
  }
})

// GET /api/customers/:id - Admin: get single customer with relations
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const customer = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id])

    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    const projects = await db.query(
      'SELECT * FROM projects WHERE customer_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    )

    return res.status(200).json({
      ...customer.rows[0],
      projects: projects.rows,
    })
  } catch (error) {
    console.error('fetching customer:', error.message)
    return res.status(500).json({ error: 'Failed to fetch customer' })
  }
})

// POST /api/customers - Admin: create customer
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, company, address, notes } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }

    const result = await db.query(
      `INSERT INTO customers (name, email, phone, company, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, phone, company, address, notes]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating customer:', error.message)
    return res.status(500).json({ error: 'Failed to create customer' })
  }
})

// PUT /api/customers/:id - Admin: update customer
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, company, address, notes } = req.body

    const result = await db.query(
      `UPDATE customers 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           company = COALESCE($4, company),
           address = COALESCE($5, address),
           notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name, email, phone, company, address, notes, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating customer:', error.message)
    return res.status(500).json({ error: 'Failed to update customer' })
  }
})

// DELETE /api/customers/:id - Admin: delete customer
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    return res.status(200).json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('deleting customer:', error.message)
    return res.status(500).json({ error: 'Failed to delete customer' })
  }
})

export default router
