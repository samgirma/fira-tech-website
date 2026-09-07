import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { pinoHttp } from 'pino-http'
import { config } from './config/index.js'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/error.js'
import { logger } from './utils/logger.js'

const app = express()

// Security headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}))

// Structured HTTP request logging with Pino
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
}))

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.origins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// General API Rate Limiter (500 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
})
app.use('/api', apiLimiter)

// Raw body for GitHub webhook signature verification
// Must come before express.json() for the webhook path
app.use('/api/v1/integrations/github/webhook', express.raw({ type: 'application/json' }))

app.use((req, res, next) => {
  if (req.path === '/api/v1/integrations/github/webhook') {
    return next()
  }
  express.json({ limit: '10mb' })(req, res, next)
})
app.use(cookieParser())

// Routes
app.use('/api', routes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = config.port

app.listen(PORT, () => {
  logger.info({ port: PORT }, `🚀 Fira Tech API running on http://localhost:${PORT}`)
  logger.info(`📝 Health check: http://localhost:${PORT}/api/health`)
})

export default app
