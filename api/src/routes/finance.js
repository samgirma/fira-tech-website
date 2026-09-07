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

    const totalRev = parseFloat(revenue.rows[0].total)
    const totalExp = parseFloat(expenses.rows[0].total)

    return res.status(200).json({
      revenue: totalRev,
      expenses: totalExp,
      net: totalRev - totalExp,
      outstanding: parseFloat(outstanding.rows[0].total),
      overdue: parseFloat(overdue.rows[0].total),
    })
  } catch (error) {
    console.error('Error fetching finance overview:', error)
    return res.status(500).json({ error: 'Failed to fetch overview' })
  }
})

// GET /api/finance/reports - Basic P&L report
router.get('/reports', authenticate, requireAdmin, async (req, res) => {
  try {
    // 1. Monthly revenue over the last 12 months
    const monthlyRevenue = await db.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        COALESCE(SUM(amount), 0) as revenue
      FROM revenue
      WHERE payment_status = 'paid'
        AND date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `)

    // 2. Monthly expenses over the last 12 months
    const monthlyExpenses = await db.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        COALESCE(SUM(amount), 0) as expenses
      FROM expenses
      WHERE date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `)

    // Combine monthly data
    const monthMap = {}
    monthlyRevenue.rows.forEach(r => {
      monthMap[r.month] = { month: r.month, revenue: parseFloat(r.revenue), expenses: 0 }
    })
    monthlyExpenses.rows.forEach(e => {
      if (!monthMap[e.month]) {
        monthMap[e.month] = { month: e.month, revenue: 0, expenses: parseFloat(e.expenses) }
      } else {
        monthMap[e.month].expenses = parseFloat(e.expenses)
      }
    })

    const monthlyTrends = Object.values(monthMap)
      .map((item) => ({
        ...item,
        net: item.revenue - item.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // 3. Category breakdown
    const expenseCategories = await db.query(`
      SELECT category, COALESCE(SUM(amount), 0) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `)

    const revenueCategories = await db.query(`
      SELECT COALESCE(category, 'Consulting & Development') as category, COALESCE(SUM(amount), 0) as total
      FROM revenue
      WHERE payment_status = 'paid'
      GROUP BY category
      ORDER BY total DESC
    `)

    const totalRevenue = monthlyTrends.reduce((sum, m) => sum + m.revenue, 0)
    const totalExpenses = monthlyTrends.reduce((sum, m) => sum + m.expenses, 0)

    return res.status(200).json({
      summary: {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        margin: totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0,
      },
      monthlyTrends,
      expenseCategories: expenseCategories.rows.map(r => ({ category: r.category, total: parseFloat(r.total) })),
      revenueCategories: revenueCategories.rows.map(r => ({ category: r.category, total: parseFloat(r.total) })),
    })
  } catch (error) {
    console.error('Error fetching finance reports:', error)
    return res.status(500).json({ error: 'Failed to fetch financial reports' })
  }
})

// GET /api/finance/revenue - Admin: list revenue
router.get('/revenue', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              cl.name as client_name,
              p.name as project_name
       FROM revenue r
       LEFT JOIN clients cl ON r.client_id = cl.id
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
    const { clientId, projectId, amount, category, description, date, paymentStatus } = req.body

    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' })
    }

    const result = await db.query(
      `INSERT INTO revenue (client_id, project_id, amount, category, description, date, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [clientId || null, projectId || null, parseFloat(amount), category || 'Development', description || null, date, paymentStatus || 'paid']
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating revenue:', error)
    return res.status(500).json({ error: 'Failed to create revenue entry' })
  }
})

// DELETE /api/finance/revenue/:id - Admin: delete revenue entry
router.delete('/revenue/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM revenue WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Entry not found' })
    return res.status(200).json({ message: 'Revenue entry deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete revenue entry' })
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

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' })
    }

    const result = await db.query(
      `INSERT INTO expenses (category, amount, vendor, description, project_id, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [category, parseFloat(amount), vendor || null, description || null, projectId || null, date]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating expense:', error)
    return res.status(500).json({ error: 'Failed to create expense' })
  }
})

// DELETE /api/finance/expenses/:id - Admin: delete expense
router.delete('/expenses/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' })
    return res.status(200).json({ message: 'Expense deleted' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete expense' })
  }
})

// GET /api/finance/invoices - Admin: list invoices
router.get('/invoices', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, 
              cl.name as client_name,
              cl.email as client_email,
              p.name as project_name
       FROM invoices i
       LEFT JOIN clients cl ON i.client_id = cl.id
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
    const { clientId, projectId, amount, issueDate, dueDate, notes, status = 'draft' } = req.body

    if (!amount || !issueDate || !dueDate) {
      return res.status(400).json({ error: 'Amount, issueDate, and dueDate are required' })
    }

    // Generate invoice number
    const count = await db.query('SELECT COUNT(*) FROM invoices')
    const invoiceNumber = `INV-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`

    const result = await db.query(
      `INSERT INTO invoices (invoice_number, client_id, project_id, amount, issue_date, due_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [invoiceNumber, clientId || null, projectId || null, parseFloat(amount), issueDate, dueDate, status, notes || null]
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
    const { status, notes, amount, dueDate, paymentReceivedDate } = req.body

    const existing = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' })
    }

    const invoice = existing.rows[0]

    const result = await db.query(
      `UPDATE invoices 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           amount = COALESCE($3, amount),
           due_date = COALESCE($4, due_date),
           updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [status, notes, amount ? parseFloat(amount) : undefined, dueDate, req.params.id]
    )

    // If marked paid and was previously unpaid, automatically create revenue entry
    if (status === 'paid' && invoice.status !== 'paid') {
      await db.query(
        `INSERT INTO revenue (client_id, project_id, amount, category, description, date, payment_status)
         VALUES ($1, $2, $3, 'Invoiced Work', $4, $5, 'paid')`,
        [
          invoice.client_id,
          invoice.project_id,
          invoice.amount,
          `Payment for Invoice ${invoice.invoice_number}`,
          paymentReceivedDate || new Date().toISOString().split('T')[0],
        ]
      )
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating invoice:', error)
    return res.status(500).json({ error: 'Failed to update invoice' })
  }
})

// DELETE /api/finance/invoices/:id - Admin: delete invoice
router.delete('/invoices/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' })
    return res.status(200).json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete invoice' })
  }
})

export default router
