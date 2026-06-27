import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { partner_name, rating, feedback } = req.body
    if (!partner_name || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'partner_name and rating (1-5) are required' })
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'satisfaction_responses')
      .single()

    const responses = existing?.value ? JSON.parse(existing.value) : []
    responses.push({
      id: Date.now().toString(),
      partner_name: partner_name.trim(),
      rating,
      feedback: (feedback || '').trim(),
      created_at: new Date().toISOString(),
    })

    const { error: upsertError } = await supabaseAdmin
      .from('settings')
      .upsert({ key: 'satisfaction_responses', value: JSON.stringify(responses) }, { onConflict: 'key' })

    if (upsertError) return res.status(500).json({ error: upsertError.message })
    return res.status(201).json({ success: true })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'satisfaction_responses')
      .single()

    if (error || !data?.value) {
      return res.status(200).json({ average: 0, total: 0, percentage: 0 })
    }

    const responses = JSON.parse(data.value)
    if (!responses.length) {
      return res.status(200).json({ average: 0, total: 0, percentage: 0 })
    }

    const total = responses.length
    const sum = responses.reduce((acc: number, r: any) => acc + r.rating, 0)
    const average = Math.round((sum / total) * 10) / 10
    const percentage = Math.round((average / 5) * 100)

    return res.status(200).json({ average, total, percentage })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
