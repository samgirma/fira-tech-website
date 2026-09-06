import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, blogSchema } from '../middleware/validate.js'

const router = Router()

// Helper to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now()
}

// GET /api/blogs - Public: list published blogs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, u.name as author_name, u.email as author_email,
              (SELECT COUNT(*) FROM comments c WHERE c.blog_id = b.id) as comment_count
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.published = true
       ORDER BY b.created_at DESC`
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return res.status(500).json({ error: 'Failed to fetch blogs' })
  }
})

// GET /api/blogs/:slug - Public: get single blog
router.get('/:slug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, u.name as author_name, u.email as author_email
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.slug = $1 AND b.published = true`,
      [req.params.slug]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error fetching blog:', error)
    return res.status(500).json({ error: 'Failed to fetch blog' })
  }
})

// POST /api/blogs - Admin: create blog
router.post('/', authenticate, requireAdmin, validate(blogSchema), async (req, res) => {
  try {
    const { title, content, published } = req.body
    const slug = generateSlug(title)

    const result = await db.query(
      `INSERT INTO blogs (title, slug, content, author_id, published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, slug, content, req.user.id, published || false, published ? new Date() : null]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating blog:', error)
    return res.status(500).json({ error: 'Failed to create blog' })
  }
})

// PUT /api/blogs/:id - Admin: update blog
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, content, published, excerpt, category, tags, coverImage } = req.body
    const { id } = req.params

    const result = await db.query(
      `UPDATE blogs 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           published = COALESCE($3, published),
           excerpt = COALESCE($4, excerpt),
           category = COALESCE($5, category),
           tags = COALESCE($6, tags),
           cover_image = COALESCE($7, cover_image),
           published_at = CASE WHEN $3 = true AND published_at IS NULL THEN NOW() ELSE published_at END,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, content, published, excerpt, category, tags, coverImage, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating blog:', error)
    return res.status(500).json({ error: 'Failed to update blog' })
  }
})

// DELETE /api/blogs/:id - Admin: delete blog
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM blogs WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    return res.status(200).json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return res.status(500).json({ error: 'Failed to delete blog' })
  }
})

export default router
