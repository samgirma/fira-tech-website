import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { db } from '../config/database.js'

export function issueAuthCookie(res, token) {
  res.cookie('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export function authenticate(req, res, next) {
  const token = req.cookies['auth-token'] || 
                req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded

    // Sliding session refresh: if less than 12 hours remaining, auto-renew cookie
    const nowInSeconds = Math.floor(Date.now() / 1000)
    if (decoded.exp && (decoded.exp - nowInSeconds < 12 * 60 * 60)) {
      const refreshedToken = jwt.sign(
        { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      )
      issueAuthCookie(res, refreshedToken)
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export function optionalAuth(req, res, next) {
  const token = req.cookies['auth-token'] || 
                req.headers.authorization?.replace('Bearer ', '')

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret)
      req.user = decoded
    } catch (error) {
      // Token invalid, continue without auth
    }
  }
  next()
}
