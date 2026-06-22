import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { content, author, email, blogId } = req.body

    if (!content || !author || !blogId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content,
        author,
        email,
        blog_id: blogId,
        approved: false,
      })
      .select()
      .single()

    if (error) throw error

    return res.status(201).json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return res.status(500).json({ error: 'Failed to create comment' })
  }
}
