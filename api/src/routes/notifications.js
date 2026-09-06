import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// All notification routes require admin auth
router.use(authenticate, requireAdmin)

// GET /api/notifications - List user notifications
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, type, title, message, read, action_url, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false`,
      [req.user.id]
    )
    res.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    next(error)
  }
})

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    next(error)
  }
})

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [req.user.id]
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [id, req.user.id])
    res.json({ message: 'Notification deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
