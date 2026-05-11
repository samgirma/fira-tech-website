import { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../src/lib/supabase'

interface Blog {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  author_id: string
  created_at: string
  profiles?: {
    name: string
    email: string
  }
  comments?: string[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles!inner(name, email),
          comments(id)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform the data to match expected format
      const transformedBlogs = (blogs as Blog[]).map((blog: any) => ({
        ...blog,
        author: blog.profiles || { name: 'Unknown', email: 'unknown@example.com' },
        _count: {
          comments: Array.isArray(blog.comments) ? blog.comments.length : 0
        }
      }))
      
      return res.status(200).json(transformedBlogs)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      return res.status(500).json({ error: 'Failed to fetch blogs' })
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { title, content, published } = req.body
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }
      
      // Get user ID from middleware headers
      const userId = req.headers['x-user-id'] as string
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now()
      
      const { data: blog, error } = await supabase
        .from('blogs')
        .insert({
          title,
          content,
          slug,
          published: published || false,
          author_id: userId
        })
        .select(`
          *,
          profiles!inner(name, email)
        `)
        .single()
      
      if (error) throw error
      
      return res.status(201).json({
        ...(blog as Blog),
        author: (blog as any).profiles || { name: 'Unknown', email: 'unknown@example.com' },
        _count: { comments: 0 }
      })
    } catch (error) {
      console.error('Error creating blog:', error)
      return res.status(500).json({ error: 'Failed to create blog' })
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, title, content, published } = req.body
      
      if (!id || !title || !content) {
        return res.status(400).json({ error: 'ID, title, and content are required' })
      }
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now()
      
      const { data: blog, error } = await supabase
        .from('blogs')
        .update({
          title,
          content,
          published: published !== undefined ? published : undefined,
          slug
        })
        .eq('id', id)
        .select(`
          *,
          profiles!inner(name, email)
        `)
        .single()
      
      if (error) throw error
      
      return res.status(200).json({
        ...(blog as Blog),
        author: (blog as any).profiles || { name: 'Unknown', email: 'unknown@example.com' },
        _count: { comments: 0 }
      })
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
      
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id as string)
      
      if (error) throw error
      
      return res.status(200).json({ message: 'Blog deleted successfully' })
    } catch (error) {
      console.error('Error deleting blog:', error)
      return res.status(500).json({ error: 'Failed to delete blog' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
