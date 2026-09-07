import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, socialLinkSchema } from '../middleware/validate.js'

const router = Router()

// GET /api/social-links - Public: get active social links
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT platform, url, icon, label FROM social_links WHERE is_active = true ORDER BY sort_order ASC'
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching social links:', error.message)
    return res.status(500).json({ error: 'Failed to fetch social links' })
  }
})

// GET /api/admin/social-links - Admin: get all social links
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM social_links ORDER BY sort_order ASC')
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching social links:', error.message)
    return res.status(500).json({ error: 'Failed to fetch social links' })
  }
})

// POST /api/admin/social-links - Admin: create social link
router.post('/admin', authenticate, requireAdmin, validate(socialLinkSchema), async (req, res) => {
  try {
    const { platform, url, icon, label, sortOrder, isActive } = req.body

    const result = await db.query(
      `INSERT INTO social_links (platform, url, icon, label, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [platform, url, icon, label, sortOrder || 0, isActive !== false]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating social link:', error.message)
    return res.status(500).json({ error: 'Failed to create social link' })
  }
})

// PUT /api/admin/social-links/:id - Admin: update social link
router.put('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { platform, url, icon, label, sortOrder, isActive } = req.body

    const result = await db.query(
      `UPDATE social_links 
       SET platform = COALESCE($1, platform),
           url = COALESCE($2, url),
           icon = COALESCE($3, icon),
           label = COALESCE($4, label),
           sort_order = COALESCE($5, sort_order),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [platform, url, icon, label, sortOrder, isActive, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social link not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating social link:', error.message)
    return res.status(500).json({ error: 'Failed to update social link' })
  }
})

// DELETE /api/admin/social-links/:id - Admin: delete social link
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM social_links WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Social link not found' })
    }

    return res.status(200).json({ message: 'Social link deleted successfully' })
  } catch (error) {
    console.error('deleting social link:', error.message)
    return res.status(500).json({ error: 'Failed to delete social link' })
  }
})

export default router
