import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// POST /api/comments - Public: submit comment
router.post('/', async (req, res) => {
  try {
    const { content, author, email, blogId } = req.body

    if (!content || !author || !blogId) {
      return res.status(400).json({ error: 'Content, author, and blogId are required' })
    }

    const result = await db.query(
      `INSERT INTO comments (content, author_name, author_email, blog_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [content, author, email, blogId]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating comment:', error)
    return res.status(500).json({ error: 'Failed to create comment' })
  }
})

// GET /api/comments/:blogId - Public: get comments for a blog
router.get('/:blogId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM comments 
       WHERE blog_id = $1 AND approved = true
       ORDER BY created_at DESC`,
      [req.params.blogId]
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// GET /api/admin/comments - Admin: list all comments
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { pending } = req.query
    
    let query = `
      SELECT c.*, b.title as blog_title, b.slug as blog_slug
      FROM comments c
      LEFT JOIN blogs b ON c.blog_id = b.id
    `
    
    if (pending === 'true') {
      query += ' WHERE c.approved = false'
    }
    
    query += ' ORDER BY c.created_at DESC'

    const result = await db.query(query)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// PUT /api/admin/comments/:id - Admin: approve/reject comment
router.put('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { approved } = req.body

    const result = await db.query(
      'UPDATE comments SET approved = $1 WHERE id = $2 RETURNING *',
      [approved, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating comment:', error)
    return res.status(500).json({ error: 'Failed to update comment' })
  }
})

// DELETE /api/admin/comments/:id - Admin: delete comment
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM comments WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    return res.status(200).json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return res.status(500).json({ error: 'Failed to delete comment' })
  }
})

export default router
