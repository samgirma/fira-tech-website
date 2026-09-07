import { Router } from 'express'
import { db } from '../config/database.js'

const router = Router()

// GET /api/v1/public/company - Company profile and settings
router.get('/company', async (req, res, next) => {
  try {
    const settingsResult = await db.query(`SELECT key, value FROM settings`)
    const socialResult = await db.query(`SELECT platform, url, icon, label FROM social_links WHERE is_active = true ORDER BY sort_order`)

    const settings = {}
    settingsResult.rows.forEach(s => { settings[s.key] = s.value })

    res.json({
      name: settings.company_name || 'Fira Tech Solutions',
      tagline: settings.company_tagline || 'Innovation. Community. Value.',
      description: settings.company_description || '',
      email: settings.contact_email || settings.company_email || '',
      phone: settings.contact_phone || settings.company_phone || '',
      location: settings.company_location || 'Adama, Ethiopia',
      website: settings.company_website || 'https://firatech.systems',
      logo: settings.company_logo || null,
      socialLinks: socialResult.rows,
      founder: {
        name: settings.founder_name || '',
        role: settings.founder_role || 'Founder & CEO',
        bio: settings.founder_bio || '',
        photo: settings.founder_photo || null,
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/services - All published services
router.get('/services', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, slug, short_description, description, icon, features, technologies, category, display_order, hero_image
       FROM services
       WHERE status = 'published'
       ORDER BY display_order, created_at`
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/services/:slug - Single service detail
router.get('/services/:slug', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM services WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/projects - Published portfolio projects
router.get('/projects', async (req, res, next) => {
  try {
    const { featured, category, technology } = req.query
    let query = `
      SELECT p.id, p.title, p.slug, p.client_name, p.category, p.short_description,
             p.full_description, p.problem, p.solution, p.results, p.technologies,
             p.images, p.demo_url, p.repository_url, p.completion_date, p.featured, p.status,
             pj.name as internal_project_name
      FROM portfolio_projects p
      LEFT JOIN projects pj ON p.project_id = pj.id
      WHERE p.status = 'published'
    `
    const params = []
    let paramIndex = 1

    if (featured === 'true') {
      query += ` AND p.featured = true`
    }
    if (category) {
      query += ` AND p.category = $${paramIndex++}`
      params.push(category)
    }
    if (technology) {
      query += ` AND $${paramIndex++} = ANY(p.technologies)`
      params.push(technology)
    }

    query += ` ORDER BY p.featured DESC, p.completion_date DESC NULLS LAST, p.created_at DESC`

    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/projects/:slug - Single project detail
router.get('/projects/:slug', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*, pj.name as internal_project_name
       FROM portfolio_projects p
       LEFT JOIN projects pj ON p.project_id = pj.id
       WHERE p.slug = $1 AND p.status = 'published'`,
      [req.params.slug]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/blog - Published blog posts
router.get('/blog', async (req, res, next) => {
  try {
    const { category } = req.query
    let query = `
      SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image, b.category, b.tags,
             b.published_at, b.created_at, u.name as author_name, u.avatar as author_avatar
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.published = true
    `
    const params = []
    if (category) {
      params.push(category)
      query += ` AND b.category = $1`
    }
    query += ` ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC`
    const result = await db.query(query, params)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/blog/:slug - Single blog post
router.get('/blog/:slug', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT b.*, u.name as author_name, u.email as author_email, u.avatar as author_avatar
       FROM blogs b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.slug = $1 AND b.published = true`,
      [req.params.slug]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/testimonials - Published testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, customer_name, position, company, content, photo_url, rating, featured
       FROM testimonials
       WHERE published = true
       ORDER BY featured DESC, created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/jobs - Active job listings
router.get('/jobs', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, department, location, type, experience, remote, created_at
       FROM jobs
       WHERE is_active = true
       ORDER BY created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/jobs/:id - Single job detail
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM jobs WHERE id = $1 AND is_active = true`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/public/contact - Submit contact form
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' })
    }
    await db.query(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`,
      [name, email, subject || '', message]
    )
    res.status(201).json({ message: 'Your message has been received. We will get back to you soon.' })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/public/project-requests - Submit project request
router.post('/project-requests', async (req, res, next) => {
  try {
    const { name, email, phone, company, projectType, description, timeline, budget, additionalInfo } = req.body
    if (!name || !email || !description) {
      return res.status(400).json({ error: 'Name, email, and project description are required' })
    }
    const message = `[Project Request] ${projectType || 'General'}: ${description}${timeline ? ` | Timeline: ${timeline}` : ''}${budget ? ` | Budget: ${budget}` : ''}${company ? ` | Company: ${company}` : ''}${additionalInfo ? ` | ${additionalInfo}` : ''}`

    // Parse estimated value from budget string if possible
    let estimatedValue = null
    if (budget) {
      const cleanBudget = budget.replace(/,/g, '')
      const digits = cleanBudget.replace(/[^0-9.]/g, ' ').trim().split(/\s+/).filter(Boolean)
      if (digits.length > 0) {
        estimatedValue = parseFloat(digits[0])
      }
    }

    // 1. Insert into clients as 'new' stage
    const clientResult = await db.query(
      `INSERT INTO clients (name, company, email, phone, source, service_interested, estimated_value, stage, notes)
       VALUES ($1, $2, $3, $4, 'website_request', $5, $6, 'new', $7)
       RETURNING *`,
      [name, company || null, email, phone || null, projectType || 'General', estimatedValue, message]
    )

    // 2. Also log to contact_messages for reference
    await db.query(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`,
      [name, email, `Project Request: ${projectType || 'General'}`, message]
    )

    res.status(201).json({
      message: 'Your project request has been received. We will review the details and get back to you.',
      client: clientResult.rows[0],
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/public/job-applications - Submit job application
router.post('/job-applications', async (req, res, next) => {
  try {
    const { jobId, name, email, phone, cvUrl, portfolioUrl, githubUrl, linkedinUrl, coverLetter } = req.body
    if (!jobId || !name || !email) {
      return res.status(400).json({ error: 'Job, name, and email are required' })
    }
    await db.query(
      `INSERT INTO applications (job_id, name, email, phone, cv_url, portfolio_url, github_url, linkedin_url, cover_letter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [jobId, name, email, phone, cvUrl, portfolioUrl, githubUrl, linkedinUrl, coverLetter]
    )
    res.status(201).json({ message: 'Your application has been submitted. We will review it shortly.' })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/home - Aggregated homepage data
router.get('/home', async (req, res, next) => {
  try {
    const [services, projects, testimonials, blog, jobs, settingsResult] = await Promise.all([
      db.query(`SELECT id, title, slug, short_description, icon, features FROM services WHERE status = 'published' AND featured = true ORDER BY display_order LIMIT 6`),
      db.query(`SELECT id, title, slug, client_name, category, short_description, technologies, images, featured FROM portfolio_projects WHERE status = 'published' AND featured = true ORDER BY created_at DESC LIMIT 4`),
      db.query(`SELECT id, customer_name, position, company, content, rating FROM testimonials WHERE published = true AND featured = true ORDER BY created_at DESC LIMIT 3`),
      db.query(`SELECT id, title, slug, excerpt, cover_image, category, published_at FROM blogs WHERE published = true ORDER BY published_at DESC NULLS LAST LIMIT 3`),
      db.query(`SELECT id, title, department, location, type, remote FROM jobs WHERE is_active = true ORDER BY created_at DESC LIMIT 3`),
    ])

    const settings = {}
    const settingsRows = (await db.query(`SELECT key, value FROM settings`)).rows
    settingsRows.forEach(s => { settings[s.key] = s.value })

    res.json({
      services: services.rows,
      featuredProjects: projects.rows,
      testimonials: testimonials.rows,
      blogPosts: blog.rows,
      openJobs: jobs.rows,
      settings: {
        companyName: settings.company_name || 'Fira Tech Solutions',
        tagline: settings.company_tagline || 'Innovation. Community. Value.',
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/public/navigation - Site navigation
router.get('/navigation', async (req, res, next) => {
  res.json({
    primary: [
      { label: 'Home', url: '/', order: 0 },
      { label: 'Services', url: '/services', order: 1 },
      { label: 'Work', url: '/work', order: 2 },
      { label: 'Insights', url: '/insights', order: 3 },
      { label: 'About', url: '/about', order: 4 },
      { label: 'Careers', url: '/careers', order: 5 },
    ],
    cta: {
      primary: { label: 'Start a Project', url: '/start-a-project' },
      secondary: { label: "Let's Talk", url: '/contact' },
    },
  })
})

export default router
