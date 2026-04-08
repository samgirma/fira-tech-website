import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../src/lib/supabase'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }
      
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (authError) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      
      // Check if user is admin in our database
      const user = await prisma.user.findUnique({
        where: { email: authData.user.email },
        select: { id: true, email: true, name: true, role: true }
      })
      
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' })
      }
      
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        session: authData.session
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
