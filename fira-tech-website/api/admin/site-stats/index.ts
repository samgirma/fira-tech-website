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
        .from('settings').select('value').eq('key', 'site_stats').single()
      if (error) return res.status(200).json([])
      try {
        return res.status(200).json(JSON.parse(data.value))
      } catch {
        return res.status(200).json([])
      }
    }

    case 'PUT': {
      const stats = req.body
      if (!Array.isArray(stats)) {
        return res.status(400).json({ error: 'Body must be an array of stats' })
      }
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key: 'site_stats', value: JSON.stringify(stats) }, { onConflict: 'key' })
        .select()
        .single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(JSON.parse(data.value))
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
