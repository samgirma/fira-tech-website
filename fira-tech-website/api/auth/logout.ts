import { VercelRequest, VercelResponse } from '@vercel/node'
import { clearAuthCookie } from '../../lib/jwt'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      clearAuthCookie(res)
      return res.status(200).json({ message: 'Logout successful' })
    } catch (error) {
      console.error('Logout error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
