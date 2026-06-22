import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const app = express()
const PORT = 3000

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

if (!supabaseUrl) {
  console.error('\n❌ VITE_SUPABASE_URL is not set.')
  console.error('   Create a .env.local file in fira-tech-website/ with:')
  console.error('   VITE_SUPABASE_URL=https://dboquayegkmmkyjjsczv.supabase.co')
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

app.use(cors())
app.use(express.json())

function getToken(req) {
  const cookieHeader = req.headers.cookie || ''
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=')
    acc[name] = value
    return acc
  }, {})
  return cookies['auth-token'] || null
}

app.use('/api/auth/login', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) return res.status(401).json({ error: 'Invalid credentials' })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single()
    if (!profile || profile.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' })

    const token = jwt.sign({ id: profile.id, email: profile.email, name: profile.name, role: profile.role }, JWT_SECRET, { expiresIn: '1h' })
    res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`)
    return res.status(200).json({ user: profile, message: 'Login successful' })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.use('/api/auth/me', async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const token = getToken(req)
    if (!token) return res.status(401).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, JWT_SECRET)
    const { data: profile } = await supabase.from('profiles').select('id, email, name, role').eq('id', decoded.id).single()
    if (!profile) return res.status(401).json({ error: 'User not found' })

    return res.status(200).json({ user: profile })
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
})

app.use('/api/auth/logout', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Set-Cookie', 'auth-token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
  return res.status(200).json({ message: 'Logout successful' })
})

app.use('/api/blogs', async (req, res) => {
  if (req.method === 'GET') {
    const { data: blogs, error } = await supabase
      .from('blogs').select('*, profiles!inner(name, email), comments(id)')
      .eq('published', true).order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch blogs' })

    const transformed = (blogs || []).map(blog => ({
      ...blog,
      author: blog.profiles || { name: 'Unknown', email: '' },
      _count: { comments: blog.comments?.length || 0 }
    }))
    return res.status(200).json(transformed)
  }

  if (req.method === 'POST') {
    const { title, content, authorId } = req.body
    if (!title || !content || !authorId) return res.status(400).json({ error: 'Missing required fields' })

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
    const { data: blog, error } = await supabase
      .from('blogs').insert({ title, content, slug, author_id: authorId, published: true })
      .select('*, profiles!inner(name, email)').single()

    if (error) return res.status(500).json({ error: 'Failed to create blog' })
    return res.status(201).json({ ...blog, author: blog.profiles || { name: 'Unknown' }, _count: { comments: 0 } })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/admin/blogs', async (req, res) => {
  if (req.method === 'GET') {
    const { data: blogs, error } = await supabase
      .from('blogs').select('*, profiles!inner(name, email), comments(id)')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch blogs' })
    const transformed = (blogs || []).map(blog => ({
      ...blog,
      author: blog.profiles || { name: 'Unknown' },
      _count: { comments: blog.comments?.length || 0 }
    }))
    return res.status(200).json(transformed)
  }

  if (req.method === 'POST') {
    const { title, content, published } = req.body
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' })

    const userId = req.headers['x-user-id'] || (getToken(req) ? jwt.verify(getToken(req), JWT_SECRET).id : null)
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

    const { data: blog, error } = await supabase
      .from('blogs').insert({ title, content, slug, published: published || false, author_id: userId })
      .select('*, profiles!inner(name, email)').single()

    if (error) return res.status(500).json({ error: 'Failed to create blog' })
    return res.status(201).json({ ...blog, author: blog.profiles || { name: 'Unknown' }, _count: { comments: 0 } })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Blog ID is required' })
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) return res.status(500).json({ error: 'Failed to delete blog' })
    return res.status(200).json({ message: 'Blog deleted successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/comments', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { content, author, email, blogId } = req.body
    if (!content || !author || !blogId) return res.status(400).json({ error: 'Missing required fields' })

    const { data: comment, error } = await supabase
      .from('comments').insert({ content, author, email, blog_id: blogId, approved: false })
      .select().single()

    if (error) return res.status(500).json({ error: 'Failed to create comment' })
    return res.status(201).json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return res.status(500).json({ error: 'Failed to submit comment' })
  }
})

app.use('/api/admin/comments', async (req, res) => {
  if (req.method === 'GET') {
    const { pending } = req.query
    let query = supabase.from('comments').select('*, blogs!inner(title, slug)').order('created_at', { ascending: false })
    if (pending === 'true') query = query.eq('approved', false)
    const { data: comments, error } = await query
    if (error) return res.status(500).json({ error: 'Failed to fetch comments' })
    return res.status(200).json(comments || [])
  }

  if (req.method === 'PUT') {
    const { id, approved } = req.body
    if (!id || typeof approved !== 'boolean') return res.status(400).json({ error: 'Invalid request' })
    const { data: comment, error } = await supabase
      .from('comments').update({ approved }).eq('id', id)
      .select('*, blogs!inner(title, slug)').single()
    if (error) return res.status(500).json({ error: 'Failed to update comment' })
    return res.status(200).json(comment)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Comment ID is required' })
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) return res.status(500).json({ error: 'Failed to delete comment' })
    return res.status(200).json({ message: 'Comment deleted successfully' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/jobs', async (req, res) => {
  if (req.method === 'GET') {
    const { data: jobs, error } = await supabase
      .from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: 'Failed to fetch jobs' })
    return res.status(200).json(jobs || [])
  }
  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/admin/jobs', async (req, res) => {
  if (req.method === 'GET') {
    const { data: jobs, error } = await supabase
      .from('jobs').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: 'Failed to fetch jobs' })
    return res.status(200).json(jobs || [])
  }

  if (req.method === 'POST') {
    const { title, description, department, location, type, experience, remote } = req.body
    if (!title || !description || !department || !location) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const { data: job, error } = await supabase
      .from('jobs').insert({ title, description, department, location, type, experience, remote, is_active: true })
      .select().single()
    if (error) return res.status(500).json({ error: 'Failed to create job' })
    return res.status(201).json(job)
  }

  if (req.method === 'PUT') {
    const { id, ...updateData } = req.body
    if (!id) return res.status(400).json({ error: 'Job ID is required' })
    const { data: job, error } = await supabase
      .from('jobs').update(updateData).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: 'Failed to update job' })
    return res.status(200).json(job)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Job ID is required' })
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) return res.status(500).json({ error: 'Failed to delete job' })
    return res.status(200).json({ message: 'Job deleted successfully' })
  }

  if (req.method === 'PATCH') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'Job ID is required' })
    const { data: job } = await supabase.from('jobs').select('is_active').eq('id', id).single()
    if (!job) return res.status(404).json({ error: 'Job not found' })
    const { data: updated, error } = await supabase
      .from('jobs').update({ is_active: !job.is_active }).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: 'Failed to toggle job status' })
    return res.status(200).json(updated)
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/chat', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'Message is required' })

    if (!process.env.OPENAI_API_KEY) {
      const responses = {
        hello: 'Hello! I\'m your Fira Tech assistant. How can I help you today?',
        service: 'At Fira Tech, we offer comprehensive digital solutions including web development, mobile apps, and digital transformation consulting.',
        blog: 'Check out our latest posts about technology and heritage on our blogs page!',
        contact: 'You can reach us through our contact form or email us directly.',
        heritage: 'Cultural heritage is at the heart of what we do at Fira Tech.',
        ethiopia: 'Ethiopia and Africa are experiencing incredible technological growth!',
        default: 'Thank you for your question! Feel free to ask about our services, blog posts, or digital projects.'
      }
      const lower = message.toLowerCase()
      let response = responses.default
      for (const [key, value] of Object.entries(responses)) {
        if (lower.includes(key)) { response = value; break }
      }
      return res.status(200).json({ response })
    }

    const { generateText } = await import('ai')
    const { openai } = await import('@ai-sdk/openai')
    const { data: blogs } = await supabase
      .from('blogs').select('title, content').eq('published', true).limit(5)

    const context = (blogs || []).map(b => `Blog: ${b.title}\nContent: ${b.content.substring(0, 500)}`).join('\n\n')
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      system: `You are an AI assistant for Fira Tech. Use blog content: ${context}`,
      prompt: message,
    })
    return res.status(200).json({ response: text })
  } catch (error) {
    return res.status(200).json({ response: 'I apologize, but I\'m having trouble connecting right now.' })
  }
})

app.use('/api/admin/social-links', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('social_links').select('*').order('sort_order', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const { platform, url, icon, label, sort_order, is_active } = req.body
    if (!platform || !url || !icon || !label) {
      return res.status(400).json({ error: 'platform, url, icon, and label are required' })
    }
    const { data, error } = await supabase
      .from('social_links').insert({ platform, url, icon, label, sort_order, is_active }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { data, error } = await supabase
      .from('social_links').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { error } = await supabase.from('social_links').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/social-links', async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { data: links, error } = await supabase
      .from('social_links').select('platform, url, icon, label')
      .eq('is_active', true).order('sort_order', { ascending: true })
    if (error) throw error
    return res.status(200).json(links || [])
  } catch (error) {
    console.error('Error fetching social links:', error)
    return res.status(500).json({ error: 'Failed to fetch social links' })
  }
})

app.use('/api/admin/settings', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('settings').select('*')
    if (error) return res.status(500).json({ error: error.message })
    const settings = {}
    for (const row of data || []) settings[row.key] = row.value
    return res.status(200).json(settings)
  }

  if (req.method === 'PUT') {
    const { key, value } = req.body
    if (!key || value === undefined) return res.status(400).json({ error: 'key and value are required' })
    const { data, error } = await supabase
      .from('settings').upsert({ key, value }, { onConflict: 'key' }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.use('/api/settings', async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { data, error } = await supabase.from('settings').select('key, value')
    if (error) throw error
    const settings = {}
    for (const row of data || []) settings[row.key] = row.value
    return res.status(200).json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

app.use('/api/contact', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message })
    if (error) throw error
    return res.status(201).json({ success: true })
  } catch (error) {
    console.error('Error submitting contact message:', error)
    return res.status(500).json({ error: 'Failed to submit message' })
  }
})

app.use('/api/admin/contact', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('contact_messages').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'PUT') {
    const { id, is_read } = req.body
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { data, error } = await supabase
      .from('contact_messages').update({ is_read }).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id is required' })
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})

app.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`)
})
