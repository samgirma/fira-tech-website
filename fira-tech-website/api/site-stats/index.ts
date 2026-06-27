import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_stats')
    .single()

  if (error) return res.status(200).json([])

  try {
    const stats = JSON.parse(data.value)

    // Inject dynamic satisfaction stats
    const satisfaction = stats.find((s: any) => s.key === 'client_satisfaction')
    if (satisfaction) {
      const { data: respData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'satisfaction_responses')
        .single()

      if (respData?.value) {
        const responses = JSON.parse(respData.value)
        if (responses.length > 0) {
          const total = responses.length
          const sum = responses.reduce((acc: number, r: any) => acc + r.rating, 0)
          const average = Math.round((sum / total) * 10) / 10
          const percentage = Math.round((average / 5) * 100)
          satisfaction.dynamicValue = percentage
          satisfaction.dynamicLabel = `${percentage}% Satisfaction`
          satisfaction.dynamicItems = responses
        }
      }
    }

    return res.status(200).json(stats)
  } catch {
    return res.status(200).json([])
  }
}
