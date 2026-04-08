import { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { content, author, email, blogId } = req.body
    
    if (!content || !author || !blogId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        author,
        email,
        blogId,
        approved: false // Admin approval required
      }
    })
    
    return res.status(201).json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return res.status(500).json({ error: 'Failed to create comment' })
  }
}
