import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../src/lib/supabase'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password, name } = req.body
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' })
      }
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) {
        return res.status(400).json({ error: authError.message })
      }
      
      // Create user in our database with ADMIN role
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'ADMIN'
        }
      })
      
      return res.status(201).json({
        message: 'Admin user created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
