import { VercelRequest, VercelResponse } from '@vercel/node'
import { openai } from '@ai-sdk/openai'
import { generateText, embed } from 'ai'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    // Generate embedding for the user query
    const { embedding: queryEmbedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: message,
    })
    
    // Search for relevant blog content using pgvector (simplified approach)
    // In a real implementation, you'd use vector similarity search
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      include: {
        author: {
          select: { name: true }
        }
      },
      take: 5 // Limit context for AI
    })
    
    // Create context from blog content
    const context = blogs.map(blog => 
      `Blog: ${blog.title}\nContent: ${blog.content.substring(0, 500)}...\nAuthor: ${blog.author.name}`
    ).join('\n\n')
    
    // Generate AI response with context
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      system: `You are an AI assistant for a blog website. Use the provided blog content to answer user questions. 
      If the information isn't in the context, say so politely. Be helpful and conversational.
      
      Available blog content:
      ${context}`,
      prompt: message,
    })
    
    return res.status(200).json({ response: text })
  } catch (error) {
    console.error('Error in AI chat:', error)
    return res.status(500).json({ error: 'Failed to process chat message' })
  }
}
