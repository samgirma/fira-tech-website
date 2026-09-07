import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/testimonials - List all testimonials
router.get('/', async (req, res) => {
  try {
    const { all } = req.query
    let query = 'SELECT * FROM testimonials'
    if (all !== 'true') {
      query += ' WHERE published = true'
    }
    query += ' ORDER BY featured DESC, created_at DESC'
    const result = await db.query(query)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching testimonials:', error.message)
    return res.status(500).json({ error: 'Failed to fetch testimonials' })
  }
})

// POST /api/testimonials - Admin create testimonial
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { customerName, position, company, content, photoUrl, rating = 5, featured = false, published = true } = req.body

    if (!customerName || !content) {
      return res.status(400).json({ error: 'Customer name and content are required' })
    }

    const result = await db.query(
      `INSERT INTO testimonials (customer_name, position, company, content, photo_url, rating, featured, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [customerName, position || null, company || null, content, photoUrl || null, rating, featured, published]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating testimonial:', error.message)
    return res.status(500).json({ error: 'Failed to create testimonial' })
  }
})

// PUT /api/testimonials/:id - Admin update testimonial
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { customerName, position, company, content, photoUrl, rating, featured, published } = req.body

    const existing = await db.query('SELECT * FROM testimonials WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' })
    }

    const result = await db.query(
      `UPDATE testimonials SET
        customer_name = COALESCE($1, customer_name),
        position = COALESCE($2, position),
        company = COALESCE($3, company),
        content = COALESCE($4, content),
        photo_url = COALESCE($5, photo_url),
        rating = COALESCE($6, rating),
        featured = COALESCE($7, featured),
        published = COALESCE($8, published)
      WHERE id = $9
      RETURNING *`,
      [customerName, position, company, content, photoUrl, rating, featured, published, req.params.id]
    )

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating testimonial:', error.message)
    return res.status(500).json({ error: 'Failed to update testimonial' })
  }
})

// DELETE /api/testimonials/:id - Admin delete testimonial
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' })
    }
    return res.status(200).json({ message: 'Testimonial deleted successfully' })
  } catch (error) {
    console.error('deleting testimonial:', error.message)
    return res.status(500).json({ error: 'Failed to delete testimonial' })
  }
})

export default router
