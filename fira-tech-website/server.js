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

const chatSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

const CHAT_SYSTEM_PROMPT = `You are the Fira Tech AI assistant. Answer questions about Fira Tech based ONLY on the provided knowledge base context.

Rules:
- Give short, precise answers (1-3 sentences max)
- Greet politely when the user greets you
- If the user asks something outside Fira Tech, politely say you can only provide answers related to Fira Tech Solutions
- Never fabricate information — only use what's in the context
- If the context doesn't contain enough info, say so briefly
- No filler, no lengthy explanations
- Be direct and factual`

async function generateGeminiEmbedding(text) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
  const res = await model.embedContent(text)
  return res.embedding.values.slice(0, 1536)
}

async function chatVectorSearch(query) {
  const embedding = await generateGeminiEmbedding(query)
  const pgVec = '[' + embedding.join(',') + ']'
  const { data, error } = await chatSupabase.rpc('search_knowledge_base', {
    query_embedding: pgVec,
    match_count: 5,
    match_threshold: 0.3,
  })
  if (error) {
    console.error('[VECTOR] RPC error:', error.message)
    return ''
  }
  if (!data || data.length === 0) {
    console.log('[VECTOR] No results for:', query.substring(0, 30))
    return ''
  }
  console.log('[VECTOR] Found', data.length, 'results for:', query.substring(0, 30))
  return data.map(r => `[${r.category}] ${r.title}: ${r.content}`).join('\n\n')
}

async function generateGeminiResponse(context, message) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
    systemInstruction: { parts: [{ text: `${CHAT_SYSTEM_PROMPT}\n\nKnowledge base:\n${context}` }] },
    generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
  })
  return result.response.text() || ''
}

async function generateOpenAIResponse(context, message) {
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `${CHAT_SYSTEM_PROMPT}\n\nKnowledge base:\n${context}` },
      { role: 'user', content: message },
    ],
    temperature: 0.3,
    max_tokens: 256,
  })
  return completion.choices[0]?.message?.content || ''
}

async function generateGroqResponse(context, message) {
  const { default: Groq } = await import('groq-sdk')
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: `${CHAT_SYSTEM_PROMPT}\n\nKnowledge base:\n${context}` },
      { role: 'user', content: message },
    ],
    temperature: 0.3,
    max_tokens: 256,
  })
  return completion.choices[0]?.message?.content || ''
}

const CHAT_FALLBACK = "I'm temporarily unavailable, please try again later."

app.use('/api/chat', async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'Message is required' })

    let context = ''
    try {
      context = await chatVectorSearch(message)
    } catch (err) {
      console.error('[CHAT] Search error:', err.message?.substring(0, 200))
    }

    if (!context) {
      return res.status(200).json({ response: CHAT_FALLBACK })
    }

    let response = ''

    if (process.env.GROQ_API_KEY) {
      try { response = await generateGroqResponse(context, message) }
      catch (err) { console.error('[CHAT] Groq error:', err.message?.substring(0, 100)) }
    }

    if (!response && process.env.GEMINI_API_KEY) {
      try { response = await generateGeminiResponse(context, message) }
      catch (err) { console.error('[CHAT] Gemini error:', err.message?.substring(0, 100)) }
    }

    if (!response && process.env.OPENAI_API_KEY) {
      try { response = await generateOpenAIResponse(context, message) }
      catch (err) { console.error('[CHAT] OpenAI error:', err.message?.substring(0, 100)) }
    }

    if (!response) {
      response = CHAT_FALLBACK
    }

    return res.status(200).json({ response })
  } catch (error) {
    console.error('[CHAT] Fatal error:', error.message)
    return res.status(200).json({ response: CHAT_FALLBACK })
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
