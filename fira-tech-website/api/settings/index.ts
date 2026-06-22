import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { data, error } = await supabase.from('settings').select('key, value')
    if (error) throw error

    const settings: Record<string, string> = {}
    for (const row of data || []) {
      settings[row.key] = row.value
    }
    return res.status(200).json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ error: 'Failed to fetch settings' })
  }
}
