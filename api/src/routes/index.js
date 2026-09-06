import { Router } from 'express'
import authRoutes from './auth.js'
import blogRoutes from './blogs.js'
import commentRoutes from './comments.js'
import jobRoutes from './jobs.js'
import leadRoutes from './leads.js'
import projectRoutes from './projects.js'
import taskRoutes from './tasks.js'
import contactRoutes from './contacts.js'
import settingRoutes from './settings.js'
import socialLinkRoutes from './social-links.js'
import customerRoutes from './customers.js'
import satisfactionRoutes from './satisfaction.js'
import uploadRoutes from './upload.js'
import financeRoutes from './finance.js'
import notificationRoutes from './notifications.js'
import auditRoutes from './audit.js'
import publicRoutes from './public.js'
import githubRoutes from '../modules/github/github.routes.js'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fira-tech-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// Public website API (no auth required)
router.use('/v1/public', publicRoutes)

// Auth routes
router.use('/auth', authRoutes)

// Public routes
router.use('/blogs', blogRoutes)
router.use('/comments', commentRoutes)
router.use('/jobs', jobRoutes)
router.use('/contact', contactRoutes)
router.use('/settings', settingRoutes)
router.use('/social-links', socialLinkRoutes)
router.use('/satisfaction', satisfactionRoutes)

// Protected admin routes
router.use('/leads', leadRoutes)
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)
router.use('/customers', customerRoutes)
router.use('/upload', uploadRoutes)
router.use('/finance', financeRoutes)
router.use('/notifications', notificationRoutes)
router.use('/audit', auditRoutes)

// GitHub integration routes
router.use('/v1/integrations/github', githubRoutes)

export default router
