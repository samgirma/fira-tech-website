import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { pending } = req.query

      let query = supabase
        .from('comments')
        .select(`
          *,
          blogs!inner(title, slug)
        `)
        .order('created_at', { ascending: false })

      if (pending === 'true') {
        query = query.eq('approved', false)
      }

      const { data: comments, error } = await query

      if (error) throw error

      return res.status(200).json(comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      return res.status(500).json({ error: 'Failed to fetch comments' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, approved } = req.body

      if (!id || typeof approved !== 'boolean') {
        return res.status(400).json({ error: 'Comment ID and approved status are required' })
      }

      const { data: comment, error } = await supabase
        .from('comments')
        .update({ approved })
        .eq('id', id)
        .select(`
          *,
          blogs!inner(title, slug)
        `)
        .single()

      if (error) throw error

      return res.status(200).json(comment)
    } catch (error) {
      console.error('Error updating comment:', error)
      return res.status(500).json({ error: 'Failed to update comment' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Comment ID is required' })
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id as string)

      if (error) throw error

      return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
      console.error('Error deleting comment:', error)
      return res.status(500).json({ error: 'Failed to delete comment' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
