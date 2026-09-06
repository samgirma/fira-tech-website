import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// POST /api/satisfaction - Public: submit satisfaction response
router.post('/', async (req, res) => {
  try {
    const { partner_name, rating, feedback } = req.body

    if (!partner_name || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Partner name and rating (1-5) are required' })
    }

    const result = await db.query(
      'INSERT INTO satisfaction_responses (partner_name, rating, feedback) VALUES ($1, $2, $3) RETURNING id',
      [partner_name, rating, feedback]
    )

    return res.status(201).json({ success: true, id: result.rows[0].id })
  } catch (error) {
    console.error('Error submitting satisfaction:', error)
    return res.status(500).json({ error: 'Failed to submit response' })
  }
})

// GET /api/satisfaction - Public: get satisfaction stats
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
         COUNT(*) as total,
         COALESCE(AVG(rating), 0) as average,
         ROUND((AVG(rating) / 5.0 * 100)) as percentage
       FROM satisfaction_responses`
    )

    return res.status(200).json({
      total: parseInt(result.rows[0].total),
      average: parseFloat(parseFloat(result.rows[0].average).toFixed(1)),
      percentage: parseInt(result.rows[0].percentage),
    })
  } catch (error) {
    console.error('Error fetching satisfaction stats:', error)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/admin/satisfaction - Admin: get all responses
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM satisfaction_responses ORDER BY created_at DESC'
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching satisfaction responses:', error)
    return res.status(500).json({ error: 'Failed to fetch responses' })
  }
})

// DELETE /api/admin/satisfaction/:id - Admin: delete response
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM satisfaction_responses WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Response not found' })
    }

    return res.status(200).json({ message: 'Response deleted successfully' })
  } catch (error) {
    console.error('Error deleting satisfaction response:', error)
    return res.status(500).json({ error: 'Failed to delete response' })
  }
})

export default router
