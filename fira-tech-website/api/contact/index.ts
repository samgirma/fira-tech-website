import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, subject, message })

    if (error) throw error
    return res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error submitting contact message:', error)
    return res.status(500).json({ error: 'Failed to submit message' })
  }
}
