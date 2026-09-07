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

// GET /api/portfolio - List all projects (public or admin)
router.get('/', async (req, res) => {
  try {
    const { status, featured } = req.query
    let query = 'SELECT * FROM portfolio_projects WHERE 1=1'
    const params = []
    let pIdx = 1

    if (status) {
      query += ` AND status = $${pIdx++}`
      params.push(status)
    }
    if (featured === 'true') {
      query += ' AND featured = true'
    }

    query += ' ORDER BY featured DESC, completion_date DESC NULLS LAST, created_at DESC'
    const result = await db.query(query, params)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('fetching portfolio:', error.message)
    return res.status(500).json({ error: 'Failed to fetch portfolio projects' })
  }
})

// GET /api/portfolio/:id - Single project
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM portfolio_projects WHERE id = $1 OR slug = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('deleting portfolio project:', error.message)
    return res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/portfolio - Admin create
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      clientName,
      category,
      shortDescription,
      fullDescription,
      problem,
      solution,
      results,
      technologies,
      images,
      demoUrl,
      repositoryUrl,
      completionDate,
      featured = false,
      status = 'published',
    } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const finalSlug = slug || generateSlug(title)

    const result = await db.query(
      `INSERT INTO portfolio_projects (
        title, slug, client_name, category, short_description, full_description,
        problem, solution, results, technologies, images, demo_url, repository_url,
        completion_date, featured, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        title,
        finalSlug,
        clientName || null,
        category || null,
        shortDescription || null,
        fullDescription || null,
        problem || null,
        solution || null,
        results || null,
        technologies || [],
        images || [],
        demoUrl || null,
        repositoryUrl || null,
        completionDate || null,
        featured,
        status,
      ]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('creating portfolio project:', error.message)
    return res.status(500).json({ error: 'Failed to create portfolio project' })
  }
})

// PUT /api/portfolio/:id - Admin update
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      clientName,
      category,
      shortDescription,
      fullDescription,
      problem,
      solution,
      results,
      technologies,
      images,
      demoUrl,
      repositoryUrl,
      completionDate,
      featured,
      status,
    } = req.body

    const existing = await db.query('SELECT * FROM portfolio_projects WHERE id = $1', [req.params.id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const result = await db.query(
      `UPDATE portfolio_projects SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        client_name = COALESCE($3, client_name),
        category = COALESCE($4, category),
        short_description = COALESCE($5, short_description),
        full_description = COALESCE($6, full_description),
        problem = COALESCE($7, problem),
        solution = COALESCE($8, solution),
        results = COALESCE($9, results),
        technologies = COALESCE($10, technologies),
        images = COALESCE($11, images),
        demo_url = COALESCE($12, demo_url),
        repository_url = COALESCE($13, repository_url),
        completion_date = COALESCE($14, completion_date),
        featured = COALESCE($15, featured),
        status = COALESCE($16, status),
        updated_at = NOW()
      WHERE id = $17
      RETURNING *`,
      [
        title,
        slug,
        clientName,
        category,
        shortDescription,
        fullDescription,
        problem,
        solution,
        results,
        technologies,
        images,
        demoUrl,
        repositoryUrl,
        completionDate,
        featured,
        status,
        req.params.id,
      ]
    )

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating portfolio project:', error.message)
    return res.status(500).json({ error: 'Failed to update portfolio project' })
  }
})

// DELETE /api/portfolio/:id - Admin delete
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM portfolio_projects WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    return res.status(200).json({ message: 'Portfolio project deleted successfully' })
  } catch (error) {
    console.error('linking project:', error.message)
    return res.status(500).json({ error: 'Failed to delete portfolio project' })
  }
})

export default router
