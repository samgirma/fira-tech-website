import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/finance/overview - Admin: get financial overview
router.get('/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const revenue = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM revenue WHERE payment_status = 'paid'`
    )

    const expenses = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
    )

    const outstanding = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM invoices WHERE status IN ('sent', 'overdue')`
    )

    const overdue = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM invoices WHERE status = 'overdue'`
    )

    return res.status(200).json({
      revenue: parseFloat(revenue.rows[0].total),
      expenses: parseFloat(expenses.rows[0].total),
      net: parseFloat(revenue.rows[0].total) - parseFloat(expenses.rows[0].total),
      outstanding: parseFloat(outstanding.rows[0].total),
      overdue: parseFloat(overdue.rows[0].total),
    })
  } catch (error) {
    console.error('Error fetching finance overview:', error)
    return res.status(500).json({ error: 'Failed to fetch overview' })
  }
})

// GET /api/finance/revenue - Admin: list revenue
router.get('/revenue', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, c.name as customer_name, p.name as project_name
       FROM revenue r
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN projects p ON r.project_id = p.id
       ORDER BY r.date DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching revenue:', error)
    return res.status(500).json({ error: 'Failed to fetch revenue' })
  }
})

// POST /api/finance/revenue - Admin: create revenue entry
router.post('/revenue', authenticate, requireAdmin, async (req, res) => {
  try {
    const { customerId, projectId, amount, category, description, date, paymentStatus } = req.body

    const result = await db.query(
      `INSERT INTO revenue (customer_id, project_id, amount, category, description, date, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customerId, projectId, amount, category, description, date, paymentStatus || 'pending']
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating revenue:', error)
    return res.status(500).json({ error: 'Failed to create revenue entry' })
  }
})

// GET /api/finance/expenses - Admin: list expenses
router.get('/expenses', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, p.name as project_name
       FROM expenses e
       LEFT JOIN projects p ON e.project_id = p.id
       ORDER BY e.date DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return res.status(500).json({ error: 'Failed to fetch expenses' })
  }
})

// POST /api/finance/expenses - Admin: create expense
router.post('/expenses', authenticate, requireAdmin, async (req, res) => {
  try {
    const { category, amount, vendor, description, projectId, date } = req.body

    const result = await db.query(
      `INSERT INTO expenses (category, amount, vendor, description, project_id, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [category, amount, vendor, description, projectId, date]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating expense:', error)
    return res.status(500).json({ error: 'Failed to create expense' })
  }
})

// GET /api/finance/invoices - Admin: list invoices
router.get('/invoices', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, c.name as customer_name, p.name as project_name
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       LEFT JOIN projects p ON i.project_id = p.id
       ORDER BY i.issue_date DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

// POST /api/finance/invoices - Admin: create invoice
router.post('/invoices', authenticate, requireAdmin, async (req, res) => {
  try {
    const { customerId, projectId, amount, issueDate, dueDate, notes } = req.body

    // Generate invoice number
    const count = await db.query('SELECT COUNT(*) FROM invoices')
    const invoiceNumber = `INV-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`

    const result = await db.query(
      `INSERT INTO invoices (invoice_number, customer_id, project_id, amount, issue_date, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [invoiceNumber, customerId, projectId, amount, issueDate, dueDate, notes]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating invoice:', error)
    return res.status(500).json({ error: 'Failed to create invoice' })
  }
})

// PUT /api/finance/invoices/:id - Admin: update invoice
router.put('/invoices/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body

    const result = await db.query(
      `UPDATE invoices 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, notes, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating invoice:', error)
    return res.status(500).json({ error: 'Failed to update invoice' })
  }
})

export default router
