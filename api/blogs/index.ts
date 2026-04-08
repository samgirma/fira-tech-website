import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const blogs = await prisma.blog.findMany({
        where: { published: true },
        include: {
          author: {
            select: { name: true, email: true }
          },
          comments: {
            where: { approved: true },
            orderBy: { createdAt: 'desc' }
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
  
  if (req.method === 'POST') {
    try {
      const { title, content, authorId } = req.body
      
      if (!title || !content || !authorId) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now()
      
      const blog = await prisma.blog.create({
        data: {
          title,
          content,
          slug,
          authorId,
          published: true
        },
        include: {
          author: {
            select: { name: true, email: true }
          }
        }
      })
      
      return res.status(201).json(blog)
    } catch (error) {
      console.error('Error creating blog:', error)
      return res.status(500).json({ error: 'Failed to create blog' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
