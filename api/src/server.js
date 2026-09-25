import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { pinoHttp } from 'pino-http'
import { config } from './config/index.js'
import routes from './routes/index.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { errorHandler, notFound } from './middleware/error.js'
import { logger } from './utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Serve uploaded files (e.g. candidate resumes) with strict security headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'")
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline')
    } else if (filePath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      res.setHeader('Content-Disposition', 'attachment')
    } else if (filePath.endsWith('.doc')) {
      res.setHeader('Content-Type', 'application/msword')
      res.setHeader('Content-Disposition', 'attachment')
    }
  },
}))

// Security headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}))

// Capture error messages from JSON responses for logging
app.use((req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = (body) => {
    if (body && (body.error || body.message) && res.statusCode >= 400) {
      res.locals.errMsg = body.error || body.message
    }
    return originalJson(body)
  }
  next()
})

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
  customSuccessMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
  customErrorMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}${res.locals?.errMsg ? ` ${res.locals.errMsg}` : ''}`,
  serializers: {
    err: () => undefined,
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
}))

// CORS configuration
// Loopback origins (localhost/127.0.0.1/[::1] on any port) are allowed outside
// production so local dev works regardless of the browser origin/port the user
// opened. Production uses the strict CORS_ORIGINS allowlist.
const isLoopbackOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false
  if (!origin) return false
  try {
    const url = new URL(origin)
    if (url.protocol !== 'http:') return false
    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.origins.includes(origin) || isLoopbackOrigin(origin)) {
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

// Start server when run directly (local dev / standalone). On Vercel the exported
// app is invoked per-request by the platform; we must not bind a port there.
if (!process.env.VERCEL) {
  const PORT = config.port

  app.listen(PORT, () => {
    logger.info({ port: PORT }, `🚀 Fira Tech API running on http://localhost:${PORT}`)
    logger.info(`📝 Health check: http://localhost:${PORT}/api/health`)
  })
}

export default app
