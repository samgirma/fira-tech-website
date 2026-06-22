import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { data: links, error } = await supabase
      .from('social_links')
      .select('platform, url, icon, label')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return res.status(200).json(links || [])
  } catch (error) {
    console.error('Error fetching social links:', error)
    return res.status(500).json({ error: 'Failed to fetch social links' })
  }
}
