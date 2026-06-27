import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.query
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ valid: false, error: 'Token is required' })
  }

  const { data, error } = await supabaseAdmin
    .from('settings').select('value').eq('key', 'satisfaction_links').single()

  if (error || !data?.value) {
    return res.status(200).json({ valid: false, error: 'No links found' })
  }

  const links = JSON.parse(data.value)
  const link = links.find((l: any) => l.token === token)

  if (!link) {
    return res.status(200).json({ valid: false, error: 'Invalid link' })
  }

  if (new Date(link.expires_at) < new Date()) {
    return res.status(200).json({ valid: false, error: 'Link has expired' })
  }

  return res.status(200).json({ valid: true })
}
