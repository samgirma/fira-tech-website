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

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'satisfaction_responses')
      .single()
    if (error) return res.status(200).json([])
    try { return res.status(200).json(JSON.parse(data.value)) }
    catch { return res.status(200).json([]) }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'id is required' })

    const { data: existing } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'satisfaction_responses')
      .single()

    const responses = existing?.value ? JSON.parse(existing.value) : []
    const filtered = responses.filter((r: any) => r.id !== id)

    const { error: upsertError } = await supabase
      .from('settings')
      .upsert({ key: 'satisfaction_responses', value: JSON.stringify(filtered) }, { onConflict: 'key' })

    if (upsertError) return res.status(500).json({ error: upsertError.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
