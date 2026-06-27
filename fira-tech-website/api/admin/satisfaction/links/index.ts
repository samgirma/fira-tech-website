import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { data: { user } } = await supabase.auth.getUser(
    req.headers.authorization?.replace('Bearer ', '')
  )
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const { data, error } = await supabase
    .from('settings').select('value').eq('key', 'satisfaction_links').single()

  if (error || !data?.value) return res.status(200).json([])
  try { return res.status(200).json(JSON.parse(data.value)) }
  catch { return res.status(200).json([]) }
}
