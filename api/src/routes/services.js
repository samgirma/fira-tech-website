import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/services - List services
router.get('/', async (req, res) => {
  try {
    const { all } = req.query
    let query = 'SELECT * FROM services'
    if (all !== 'true') {
      query += ` WHERE status = 'published'`
    }
    query += ' ORDER BY display_order ASC, created_at ASC'
    const result = await db.query(query)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching services:', error.message)
    return res.status(500).json({ error: 'Failed to fetch services' })
  }
})

// GET /api/services/:id - Single service
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM services WHERE id = $1 OR slug = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }
    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('deleting service:', error.message)
    return res.status(500).json({ error: 'Failed to fetch service' })
  }
})

// POST /api/services - Admin create service
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      icon,
      features = [],
      technologies = [],
      category,
      displayOrder = 0,
      status = 'published',
      featured = true,
    } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const finalSlug = slug || generateSlug(title)

    const result = await db.query(
      `INSERT INTO services (
        title, slug, short_description, description, icon, features, technologies, category, display_order, status, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        title,
        finalSlug,
        shortDescription || null,
        description || null,
        icon || 'Code',
        JSON.stringify(features),
        technologies,
        category || null,
        displayOrder,
        status,
        featured,
      ]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating service:', error.message)
    return res.status(500).json({ error: 'Failed to create service' })
  }
})

// PUT /api/services/:id - Admin update service
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      icon,
      features,
      technologies,
      category,
      displayOrder,
      status,
      featured,
    } = req.body

    const existing = await db.query('SELECT * FROM services WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }

    const result = await db.query(
      `UPDATE services SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        short_description = COALESCE($3, short_description),
        description = COALESCE($4, description),
        icon = COALESCE($5, icon),
        features = COALESCE($6, features),
        technologies = COALESCE($7, technologies),
        category = COALESCE($8, category),
        display_order = COALESCE($9, display_order),
        status = COALESCE($10, status),
        featured = COALESCE($11, featured),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
      [
        title,
        slug,
        shortDescription,
        description,
        icon,
        features ? JSON.stringify(features) : undefined,
        technologies,
        category,
        displayOrder,
        status,
        featured,
        req.params.id,
      ]
    )

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating service:', error.message)
    return res.status(500).json({ error: 'Failed to update service' })
  }
})

// DELETE /api/services/:id - Admin delete service
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM services WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }
    return res.status(200).json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('deleting service category:', error.message)
    return res.status(500).json({ error: 'Failed to delete service' })
  }
})

export default router
