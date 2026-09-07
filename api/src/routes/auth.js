import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { config } from '../config/index.js'
import { db } from '../config/database.js'
import { validate, loginSchema } from '../middleware/validate.js'
import { issueAuthCookie, authenticate } from '../middleware/auth.js'

const router = Router()

// Brute-force protection for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
})

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const result = await db.query(
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1 AND is_active = true',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id])

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    // Set cookie
    issueAuthCookie(res, token)

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login failed:', error.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const user = req.user
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    issueAuthCookie(res, token)

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      message: 'Session refreshed',
    })
  } catch (error) {
    console.error('refreshing session:', error.message)
    return res.status(500).json({ error: 'Failed to refresh session' })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.cookies['auth-token'] || 
                req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    
    const result = await db.query(
      'SELECT id, email, name, role, avatar, phone FROM users WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Auto-renew on /me if within sliding window
    const nowInSeconds = Math.floor(Date.now() / 1000)
    if (decoded.exp && (decoded.exp - nowInSeconds < 12 * 60 * 60)) {
      const refreshedToken = jwt.sign(
        { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )
      issueAuthCookie(res, refreshedToken)
    }

    return res.status(200).json({ user: result.rows[0] })
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return res.status(200).json({ message: 'Logout successful' })
})

export default router
