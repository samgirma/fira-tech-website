import { Router } from 'express'
import authRoutes from './auth.js'
import blogRoutes from './blogs.js'
import commentRoutes from './comments.js'
import jobRoutes from './jobs.js'
import clientRoutes from './clients.js'
import projectRoutes from './projects.js'
import taskRoutes from './tasks.js'
import contactRoutes from './contacts.js'
import settingRoutes from './settings.js'
import socialLinkRoutes from './social-links.js'
import satisfactionRoutes from './satisfaction.js'
import uploadRoutes from './upload.js'
import financeRoutes from './finance.js'
import notificationRoutes from './notifications.js'
import publicRoutes from './public.js'
import portfolioRoutes from './portfolio.js'
import testimonialRoutes from './testimonials.js'
import serviceRoutes from './services.js'
import chatRoutes from './chat.js'
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

// Public website API v1
router.use('/v1/public', publicRoutes)

// Auth routes
router.use('/auth', authRoutes)

// AI Chatbot
router.use('/chat', chatRoutes)

// Public and CMS content routes
router.use('/blogs', blogRoutes)
router.use('/comments', commentRoutes)
router.use('/jobs', jobRoutes)
router.use('/contact', contactRoutes)
router.use('/settings', settingRoutes)
router.use('/social-links', socialLinkRoutes)
router.use('/satisfaction', satisfactionRoutes)
router.use('/portfolio', portfolioRoutes)
router.use('/testimonials', testimonialRoutes)
router.use('/services', serviceRoutes)

// Protected admin routes
router.use('/clients', clientRoutes)
router.use('/leads', clientRoutes) // Backward compatibility alias
router.use('/customers', clientRoutes) // Backward compatibility alias
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)
router.use('/upload', uploadRoutes)
router.use('/finance', financeRoutes)
router.use('/notifications', notificationRoutes)

// GitHub integration routes
router.use('/v1/integrations/github', githubRoutes)

export default router
