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
      const { data, error } = await supabase.from('settings').select('*')
      if (error) return res.status(500).json({ error: error.message })

      const settings: Record<string, string> = {}
      for (const row of data || []) {
        settings[row.key] = row.value
      }
      return res.status(200).json(settings)
    }

    case 'PUT': {
      const { key, value } = req.body
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'key and value are required' })
      }
      const { data, error } = await supabase
        .from('settings').upsert({ key, value }, { onConflict: 'key' }).select().single()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
