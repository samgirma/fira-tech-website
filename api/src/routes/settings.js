import { Router } from 'express'
import { db } from '../config/database.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/settings - Public: get all settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT key, value FROM settings')
    const settings = {}
    for (const row of result.rows) {
      settings[row.key] = row.value
    }
    return res.status(200).json(settings)
  } catch (error) {
    console.error('fetching settings:', error.message)
    return res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// GET /api/settings/:key - Public: get single setting
router.get('/:key', async (req, res) => {
  try {
    const result = await db.query('SELECT value FROM settings WHERE key = $1', [req.params.key])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' })
    }

    return res.status(200).json({ key: req.params.key, value: result.rows[0].value })
  } catch (error) {
    console.error('fetching setting:', error.message)
    return res.status(500).json({ error: 'Failed to fetch setting' })
  }
})

// PUT /api/admin/settings - Admin: update setting
router.put('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' })
    }

    const result = await db.query(
      `INSERT INTO settings (key, value, updated_at) 
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [key, value]
    )

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('updating setting:', error.message)
    return res.status(500).json({ error: 'Failed to update setting' })
  }
})

// DELETE /api/admin/settings/:key - Admin: delete setting
router.delete('/admin/:key', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM settings WHERE key = $1 RETURNING key', [req.params.key])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' })
    }

    return res.status(200).json({ message: 'Setting deleted successfully' })
  } catch (error) {
    console.error('deleting setting:', error.message)
    return res.status(500).json({ error: 'Failed to delete setting' })
  }
})

export default router
