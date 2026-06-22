import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { email, password, name } = req.body

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' })
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        return res.status(400).json({ error: authError.message })
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email,
          name,
          role: 'ADMIN',
        })

      if (profileError) {
        return res.status(500).json({ error: 'Failed to create admin profile' })
      }

      return res.status(201).json({
        message: 'Admin user created successfully',
        user: { id: authData.user!.id, email, name, role: 'ADMIN' },
      })
    } catch (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
