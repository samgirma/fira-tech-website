import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, contactSchema } from '../middleware/validate.js'

const router = Router()

// POST /api/contact - Public: submit contact message
router.post('/', validate(contactSchema), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    const result = await db.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, subject, message]
    )

    return res.status(201).json({ success: true, id: result.rows[0].id })
  } catch (error) {
    console.error('Error submitting contact:', error)
    return res.status(500).json({ error: 'Failed to submit message' })
  }
})

// GET /api/admin/contact - Admin: list contact messages
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

// PUT /api/admin/contact/:id - Admin: mark as read/unread
router.put('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_read } = req.body

    const result = await db.query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *',
      [is_read, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating contact:', error)
    return res.status(500).json({ error: 'Failed to update message' })
  }
})

// DELETE /api/admin/contact/:id - Admin: delete contact message
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' })
    }

    return res.status(200).json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return res.status(500).json({ error: 'Failed to delete message' })
  }
})

export default router
