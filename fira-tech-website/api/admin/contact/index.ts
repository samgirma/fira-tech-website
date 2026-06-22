import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { data: { user } } = await supabase.auth.getUser(
    req.headers.authorization?.replace('Bearer ', '')
  )

  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  switch (req.method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data || [])
    }

    case 'PUT': {
      const { id, is_read } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })
      const { data, error } = await supabase
        .from('contact_messages').update({ is_read }).eq('id', id).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    case 'DELETE': {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ success: true })
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
