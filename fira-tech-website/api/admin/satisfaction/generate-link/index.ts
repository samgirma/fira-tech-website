import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../../lib/supabase'

function generateToken(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { data: { user } } = await supabase.auth.getUser(
    req.headers.authorization?.replace('Bearer ', '')
  )
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  const token = generateToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data: existing } = await supabase
    .from('settings').select('value').eq('key', 'satisfaction_links').single()

  const links = existing?.value ? JSON.parse(existing.value) : []
  links.push({
    token,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  })

  const { error: upsertError } = await supabase
    .from('settings').upsert({ key: 'satisfaction_links', value: JSON.stringify(links) }, { onConflict: 'key' })

  if (upsertError) return res.status(500).json({ error: upsertError.message })

  const origin = req.headers.origin || `https://${req.headers.host || 'firatech.systems'}`
  const url = `${origin}/feedback?token=${token}`

  return res.status(201).json({ token, url, expires_at: expiresAt.toISOString() })
}
