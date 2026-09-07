import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { validate, jobSchema } from '../middleware/validate.js'
import { sendCandidateEmail } from '../utils/email_service.js'

const router = Router()

// GET /api/jobs - Public: list active jobs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM jobs WHERE is_active = true ORDER BY created_at DESC'
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/:id - Public: get single job
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error fetching job:', error)
    return res.status(500).json({ error: 'Failed to fetch job' })
  }
})

// GET /api/admin/jobs - Admin: list all jobs
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM jobs ORDER BY created_at DESC'
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// POST /api/admin/jobs - Admin: create job
router.post('/admin', authenticate, requireAdmin, validate(jobSchema), async (req, res) => {
  try {
    const { title, description, department, location, type, experience, remote } = req.body

    const result = await db.query(
      `INSERT INTO jobs (title, description, department, location, type, experience, remote)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, department, location, type, experience, remote]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating job:', error)
    return res.status(500).json({ error: 'Failed to create job' })
  }
})

// PUT /api/admin/jobs/:id - Admin: update job
router.put('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, department, location, type, experience, remote } = req.body

    const result = await db.query(
      `UPDATE jobs 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           department = COALESCE($3, department),
           location = COALESCE($4, location),
           type = COALESCE($5, type),
           experience = COALESCE($6, experience),
           remote = COALESCE($7, remote),
           updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, description, department, location, type, experience, remote, req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating job:', error)
    return res.status(500).json({ error: 'Failed to update job' })
  }
})

// PATCH /api/admin/jobs/:id/toggle - Admin: toggle job active status
router.patch('/admin/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE jobs SET is_active = NOT is_active, updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error toggling job:', error)
    return res.status(500).json({ error: 'Failed to toggle job' })
  }
})

// DELETE /api/admin/jobs/:id - Admin: delete job
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    return res.status(200).json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return res.status(500).json({ error: 'Failed to delete job' })
  }
})

// POST /api/jobs/:id/apply - Public: submit application
router.post('/:id/apply', async (req, res) => {
  try {
    const { name, email, phone, cvUrl, portfolioUrl, githubUrl, linkedinUrl, coverLetter } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    const result = await db.query(
      `INSERT INTO applications (job_id, name, email, phone, cv_url, portfolio_url, github_url, linkedin_url, cover_letter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.params.id, name, email, phone, cvUrl, portfolioUrl, githubUrl, linkedinUrl, coverLetter]
    )

    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error submitting application:', error)
    return res.status(500).json({ error: 'Failed to submit application' })
  }
})

// GET /api/jobs/admin/applications - Admin: get all applications
router.get('/admin/applications', authenticate, requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.query
    let query = `
      SELECT a.*, 
             a.cv_url as resume_url,
             j.title as job_title, 
             j.department as job_department,
             (SELECT COUNT(*) FROM application_emails ae WHERE ae.application_id = a.id) as emails_count,
             (SELECT MAX(sent_at) FROM application_emails ae WHERE ae.application_id = a.id) as last_emailed_at
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
    `
    const params = []
    if (jobId) {
      query += ' WHERE a.job_id = $1'
      params.push(jobId)
    }
    query += ' ORDER BY a.created_at DESC'
    const result = await db.query(query, params)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

// POST /api/jobs/admin/applications/:id/email - Admin: send professional email to applicant
router.post('/admin/applications/:id/email', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { subject, body, template, newStatus } = req.body

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' })
    }

    const appRes = await db.query('SELECT * FROM applications WHERE id = $1', [id])
    if (appRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const application = appRes.rows[0]

    const dispatchResult = await sendCandidateEmail({
      applicationId: application.id,
      recipientEmail: application.email,
      recipientName: application.name,
      subject,
      body,
      template: template || 'custom',
      sentByUserId: req.user?.id || null,
    })

    if (newStatus) {
      await db.query('UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, id])
    }

    return res.status(200).json({
      success: true,
      message: 'Email dispatched successfully',
      email: dispatchResult.email,
      mode: dispatchResult.mode,
      newStatus: newStatus || application.status,
    })
  } catch (error) {
    console.error('Error emailing applicant:', error)
    return res.status(500).json({ error: error.message || 'Failed to dispatch email' })
  }
})

// PATCH /api/jobs/admin/applications/:id/status - Admin: update application status
router.patch('/admin/applications/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const result = await db.query(
      `UPDATE applications 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, notes, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error updating application status:', error)
    return res.status(500).json({ error: 'Failed to update application status' })
  }
})

// GET /api/jobs/admin/applications/:id/emails - Admin: get email history for applicant
router.get('/admin/applications/:id/emails', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      `SELECT ae.*, u.name as sender_name
       FROM application_emails ae
       LEFT JOIN users u ON ae.sent_by = u.id
       WHERE ae.application_id = $1
       ORDER BY ae.sent_at DESC`,
      [id]
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching application emails:', error)
    return res.status(500).json({ error: 'Failed to fetch application emails' })
  }
})

export default router
