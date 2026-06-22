import { VercelRequest, VercelResponse } from '@vercel/node'
import { openai } from '@ai-sdk/openai'
import { generateText, embed } from 'ai'
import { supabase } from '../../lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock responses if OpenAI is not configured
      const mockResponses = {
        'hello': 'Hello! I\'m your Fira Tech assistant. How can I help you today? I can tell you about our services, technology solutions, or answer questions about digital innovation in Africa.',
        'service': 'At Fira Tech, we offer comprehensive digital solutions including web development, mobile apps, digital transformation consulting, and community-focused technology platforms. We specialize in creating solutions that blend modern technology with cultural heritage preservation.',
        'blog': 'We have several blog posts about technology and heritage! You can check out our latest posts about "Building Digital Communities in Ethiopia" and "The Future of African Tech Innovation" on our blogs page.',
        'contact': 'You can reach us through our contact form on the website, or email us directly. We\'re based in Adama, Ethiopia and would love to discuss how we can help bring your digital ideas to life!',
        'heritage': 'Cultural heritage is at the heart of what we do at Fira Tech. We believe technology should enhance and preserve cultural traditions, not replace them. Our projects focus on creating digital platforms that celebrate African heritage while enabling modern innovation.',
        'ethiopia': 'Ethiopia and Africa are experiencing incredible technological growth! We\'re proud to be part of this transformation, creating solutions that address local challenges while connecting communities to global opportunities.',
        'default': 'Thank you for your question! I\'m here to help you learn about Fira Tech and our mission to blend technology with heritage. Feel free to ask me about our services, blog posts, or how we can help with your digital projects.'
      }
      
      const lowerMessage = message.toLowerCase()
      let response = mockResponses.default
      
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerMessage.includes(key)) {
          response = value
          break
        }
      }
      
      return res.status(200).json({ response })
    }
    
    // Generate embedding for the user query
    const { embedding: queryEmbedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: message,
    })
    
    // Search for relevant blog content using Supabase
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('title, content, author:users(name)')
      .eq('published', true)
      .limit(5) // Limit context for AI
    
    if (error) throw error
    
    // Create context from blog content
    const context = blogs.map(blog => 
      `Blog: ${blog.title}\nContent: ${blog.content.substring(0, 500)}...\nAuthor: ${blog.author?.name || 'Unknown'}`
    ).join('\n\n')
    
    // Generate AI response with context
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      system: `You are an AI assistant for Fira Tech, a technology company based in Ethiopia that blends modern technology with cultural heritage. Use the provided blog content to answer user questions. If the information isn't in the context, say so politely. Be helpful, conversational, and highlight Fira Tech's mission and values.
      
      Available blog content:
      ${context}`,
      prompt: message,
    })
    
    return res.status(200).json({ response: text })
  } catch (error) {
    console.error('Error in AI chat:', error)
    
    // Fallback response on error
    return res.status(200).json({ 
      response: 'I apologize, but I\'m having trouble connecting to my AI services right now. I\'m your Fira Tech assistant, and I\'d be happy to help you learn about our technology solutions, heritage preservation work, or answer any questions about our services. Could you try again or let me know what specific information you\'re looking for?'
    })
  }
}
