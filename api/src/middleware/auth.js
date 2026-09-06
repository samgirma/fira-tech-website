import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { db } from '../config/database.js'

export function authenticate(req, res, next) {
  const token = req.cookies['auth-token'] || 
                req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
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
