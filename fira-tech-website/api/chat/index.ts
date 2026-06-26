import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `You are the Fira Tech AI assistant. Answer questions about Fira Tech based ONLY on the provided knowledge base context.

Rules:
- Give short, precise answers (1-3 sentences max)
- Greet politely when the user greets you
- If the user asks something outside Fira Tech, politely say you can only provide answers related to Fira Tech Solutions
- Never fabricate information — only use what's in the context
- If the context doesn't contain enough info, say so briefly
- No filler, no lengthy explanations
- Be direct and factual`

const FALLBACK = "I'm temporarily unavailable, please try again later."

// ─── Embedding ─────────────────────────────────────────────────────
// Priority: Gemini → OpenAI → Groq (Groq uses llama to embed via completion trick)

async function generateEmbeddingGemini(text: string): Promise<number[]> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }) // more stable than gemini-embedding-001
  const res = await model.embedContent(text)
  const values = res.embedding.values
  // Pad or trim to 1536 to match your Supabase column
  if (values.length >= 1536) return values.slice(0, 1536)
  return [...values, ...new Array(1536 - values.length).fill(0)]
}

async function generateEmbeddingOpenAI(text: string): Promise<number[]> {
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  })
  return res.data[0].embedding
}

// Groq doesn't have a native embedding API — fallback: keyword-based search
// This triggers only if both Gemini and OpenAI embedding fail
async function generateEmbeddingFallback(text: string): Promise<number[] | null> {
  // Return null to signal: skip vector search, use keyword match instead
  console.warn('[EMBED] All embedding providers failed — falling back to keyword search')
  return null
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  // 1. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const vec = await generateEmbeddingGemini(text)
      console.log('[EMBED] Gemini OK')
      return vec
    } catch (err) {
      console.error('[EMBED] Gemini failed:', (err as Error).message)
    }
  }

  // 2. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const vec = await generateEmbeddingOpenAI(text)
      console.log('[EMBED] OpenAI OK')
      return vec
    } catch (err) {
      console.error('[EMBED] OpenAI failed:', (err as Error).message)
    }
  }

  // 3. No embedding available
  return generateEmbeddingFallback(text)
}

// ─── Vector Search ─────────────────────────────────────────────────

async function searchKnowledgeBase(query: string): Promise<string> {
  const embedding = await generateEmbedding(query)

  // Embedding succeeded — do vector search
  if (embedding) {
    const pgVec = '[' + embedding.join(',') + ']'
    const { data, error } = await supabase.rpc('search_knowledge_base', {
      query_embedding: pgVec,
      match_count: 5,
      match_threshold: 0.3,
    })
    if (!error && data && data.length > 0) {
      console.log(`[VECTOR] Found ${data.length} results`)
      return data
        .map((r: { category: string; title: string; content: string }) =>
          `[${r.category}] ${r.title}: ${r.content}`
        )
        .join('\n\n')
    }
    console.warn('[VECTOR] No results or error:', error?.message)
  }

  // Embedding failed — fallback: full-text / keyword search in Supabase
  console.log('[SEARCH] Trying keyword search fallback...')
  const { data, error } = await supabase
    .from('knowledge_base') // adjust to your actual table name
    .select('category, title, content')
    .textSearch('content', query, { type: 'plain' })
    .limit(5)

  if (!error && data && data.length > 0) {
    console.log(`[KEYWORD] Found ${data.length} results`)
    return data
      .map((r: { category: string; title: string; content: string }) =>
        `[${r.category}] ${r.title}: ${r.content}`
      )
      .join('\n\n')
  }

  console.warn('[SEARCH] No results from any method')
  return ''
}

// ─── AI Generation ─────────────────────────────────────────────────
// Priority: Groq (free, reliable) → Gemini → OpenAI

async function generateWithGroq(context: string, message: string): Promise<string> {
  const { default: Groq } = await import('groq-sdk')
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',  // free, high quality
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nKnowledge base:\n${context}` },
      { role: 'user', content: message },
    ],
    temperature: 0.3,
    max_tokens: 256,
  })
  return completion.choices[0]?.message?.content || ''
}

async function generateWithGemini(context: string, message: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) // stable free-tier model
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
    systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nKnowledge base:\n${context}` }] },
    generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
  })
  return result.response.text() || ''
}

async function generateWithOpenAI(context: string, message: string): Promise<string> {
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nKnowledge base:\n${context}` },
      { role: 'user', content: message },
    ],
    temperature: 0.3,
    max_tokens: 256,
  })
  return completion.choices[0]?.message?.content || ''
}

async function generateResponse(context: string, message: string): Promise<string> {
  // 1. Groq first — free and reliable
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await generateWithGroq(context, message)
      if (res) { console.log('[CHAT] Groq OK'); return res }
    } catch (err) {
      console.error('[CHAT] Groq error:', (err as Error).message)
    }
  }

  // 2. Gemini fallback
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await generateWithGemini(context, message)
      if (res) { console.log('[CHAT] Gemini OK'); return res }
    } catch (err) {
      console.error('[CHAT] Gemini error:', (err as Error).message)
    }
  }

  // 3. OpenAI last resort
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await generateWithOpenAI(context, message)
      if (res) { console.log('[CHAT] OpenAI OK'); return res }
    } catch (err) {
      console.error('[CHAT] OpenAI error:', (err as Error).message)
    }
  }

  return ''
}

// ─── Handler ───────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Step 1: Retrieve context
    let context = ''
    try {
      context = await searchKnowledgeBase(message)
    } catch (err) {
      console.error('[SEARCH] Fatal error:', err)
    }

    if (!context) {
      return res.status(200).json({ response: FALLBACK })
    }

    // Step 2: Generate answer
    const response = (await generateResponse(context, message)) || FALLBACK

    return res.status(200).json({ response })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[HANDLER] Fatal error:', msg)
    return res.status(200).json({ response: FALLBACK })
  }
}
