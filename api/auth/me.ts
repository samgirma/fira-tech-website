import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../src/lib/supabase'
import { getTokenFromCookie, verifyToken } from '../../lib/jwt'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const token = getTokenFromCookie(req)
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }
      
      const payload = verifyToken(token)
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }
      
      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .eq('id', payload.id)
        .single()
      
      if (profileError || !profile) {
        return res.status(401).json({ error: 'User profile not found' })
      }
      
      return res.status(200).json({
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role
        }
      })
    } catch (error) {
      console.error('Auth me error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
