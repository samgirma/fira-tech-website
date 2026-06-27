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
- For greetings, reply with a simple greeting only; do not mention links or the homepage unless asked
- If the user asks about a page or section on the site, return the exact link
- Include homepage links for about/home questions
- If the user asks something outside Fira Tech, politely say you can only provide answers related to Fira Tech Solutions
- If the user asks for confidential, internal, secret, or admin-only company information, refuse and direct them to the admin
- Never fabricate information — only use what's in the context
- Never use firatech.com; the official domain is https://firatech.systems
- If the context doesn't contain enough info, say so briefly
- No filler, no lengthy explanations
- Be direct and factual`

const FALLBACK = "I'm temporarily unavailable, please try again later."
const ADMIN_FALLBACK = "This information is not intended for public support. Please contact the admin for details about Fira Tech Solutions."

function isConfidentialQuestion(message: string): boolean {
  return /(sensitive|secret|secrets|confidential|internal|private|password|api key|token|credential|credentials|admin login|source code|database|revenue|salary|budget|members count|staff count|employee count)/i.test(message)
}

function isGreeting(message: string): boolean {
  return /^(hi|hello|hey|good\s*(morning|afternoon|evening))/i.test(message.trim())
}

function isLikelyFiraQuestion(message: string): boolean {
  return /(fira|service|services|blog|blogs|career|careers|job|jobs|hiring|contact|support|about|home|homepage|telebirr|cbe|birr|location|admin|comment|comments|payment|payments)/i.test(message)
}

function getPageLinkResponse(message: string): string {
  const lower = message.toLowerCase()
  if (/\bblog\b|\bblogs\b|\bposts\b|\barticles\b/.test(lower)) {
    return 'You can find our blogs here: https://firatech.systems/blogs'
  }
  if (/\babout\b|\bhome\b|\bhomepage\b|\bstart\b|\bwho are you\b/.test(lower)) {
    return 'You can find our homepage here: https://firatech.systems/'
  }
  if (/\bcareer\b|\bcareers\b|\bjob\b|\bjobs\b|\bhiring\b|\bopenings\b/.test(lower)) {
    return 'You can find our careers page here: https://firatech.systems/careers'
  }
  if (/\bcontact\b|\bsupport\b|\breach\s*out\b|\bget in touch\b/.test(lower)) {
    return 'You can find our contact section here: https://firatech.systems/#contact'
  }
  return ''
}

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

    if (process.env.CHAT_ENABLE_RULES === 'true' && isGreeting(message)) {
      return res.status(200).json({ response: 'Hello, how can I assist you with Fira Tech today?' })
    }

    if (process.env.CHAT_ENABLE_RULES === 'true' && isConfidentialQuestion(message)) {
      return res.status(200).json({ response: ADMIN_FALLBACK })
    }

    if (process.env.CHAT_ENABLE_RULES === 'true' && !isLikelyFiraQuestion(message)) {
      return res.status(200).json({ response: ADMIN_FALLBACK })
    }

    const pageLink = getPageLinkResponse(message)
    if (process.env.CHAT_ENABLE_RULES === 'true' && pageLink) {
      return res.status(200).json({ response: pageLink })
    }

    // Step 1: Retrieve context
    let context = ''
    try {
      context = await searchKnowledgeBase(message)
    } catch (err) {
      console.error('[SEARCH] Fatal error:', err)
    }

    if (!context) {
      console.log('[SEARCH] No context returned')
    }

    // Step 2: Generate answer
    let response = (await generateResponse(context, message)) || FALLBACK

    response = response.replace(/firatech\.com/gi, 'firatech.systems')

    return res.status(200).json({ response })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[HANDLER] Fatal error:', msg)
    return res.status(200).json({ response: FALLBACK })
  }
}
