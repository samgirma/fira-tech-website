import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const blogs = await prisma.blog.findMany({
        include: {
          author: {
            select: { name: true, email: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return res.status(200).json(blogs)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      return res.status(500).json({ error: 'Failed to fetch blogs' })
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, title, content, published } = req.body
      
      if (!id || !title || !content) {
        return res.status(400).json({ error: 'ID, title, and content are required' })
      }
      
      const blog = await prisma.blog.update({
        where: { id },
        data: {
          title,
          content,
          published: published !== undefined ? published : undefined,
          slug: title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now()
        },
        include: {
          author: {
            select: { name: true, email: true }
          }
        }
      })
      
      return res.status(200).json(blog)
    } catch (error) {
      console.error('Error updating blog:', error)
      return res.status(500).json({ error: 'Failed to update blog' })
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ error: 'Blog ID is required' })
      }
      
      await prisma.blog.delete({
        where: { id: id as string }
      })
      
      return res.status(200).json({ message: 'Blog deleted successfully' })
    } catch (error) {
      console.error('Error deleting blog:', error)
      return res.status(500).json({ error: 'Failed to delete blog' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
