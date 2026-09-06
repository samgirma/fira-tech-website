import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { db } from '../config/database.js'
import { validate, loginSchema } from '../middleware/validate.js'

const router = Router()

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
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
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
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
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })

  return res.status(200).json({ message: 'Logout successful' })
})

// POST /api/auth/register (admin only - for initial setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, 'ADMIN']
    )

    return res.status(201).json({ user: result.rows[0], message: 'User created' })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
