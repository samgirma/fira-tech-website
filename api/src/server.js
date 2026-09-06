import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/index.js'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/error.js'

const app = express()

// Middleware
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

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// Routes
app.use('/api', routes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = config.port

app.listen(PORT, () => {
  console.log(`\n🚀 Fira Tech API running on http://localhost:${PORT}`)
  console.log(`📝 Health check: http://localhost:${PORT}/api/health\n`)
})

export default app
