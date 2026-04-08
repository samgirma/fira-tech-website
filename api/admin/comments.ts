import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { pending } = req.query
      
      const whereClause = pending === 'true' 
        ? { approved: false }
        : {}
      
      const comments = await prisma.comment.findMany({
        where: whereClause,
        include: {
          blog: {
            select: { title: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
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
      
      const comment = await prisma.comment.update({
        where: { id },
        data: { approved },
        include: {
          blog: {
            select: { title: true, slug: true }
          }
        }
      })
      
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
      
      await prisma.comment.delete({
        where: { id: id as string }
      })
      
      return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
      console.error('Error deleting comment:', error)
      return res.status(500).json({ error: 'Failed to delete comment' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
