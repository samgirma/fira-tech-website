import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../src/lib/supabase'
import { generateToken, setAuthCookie } from '../../lib/jwt'

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
      
      // Check if user exists and has admin metadata
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()
      
      if (profileError) {
        // Create admin profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Admin',
            role: 'ADMIN'
          })
          .select('id, email, name, role')
          .single()
        
        if (insertError) {
          return res.status(500).json({ error: 'Failed to create admin profile' })
        }
        
        const user = {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Admin',
          role: 'ADMIN'
        }
      } else if (profile.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' })
      } else {
        const user = {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Admin',
          role: profile.role
        }
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      })
      
      // Set secure HTTP-only cookie
      setAuthCookie(res, token)
      
      return res.status(200).json({
        user,
        message: 'Login successful'
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
