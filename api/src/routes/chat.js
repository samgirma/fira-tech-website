import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { db } from '../config/database.js'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

const router = Router()

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat requests. Please try again in 15 minutes.' },
})

const SYSTEM_PROMPT = `You are the AI assistant for Fira Tech Solutions, a premier software engineering agency based in Adama, Ethiopia, founded by Samuel Girma.
Our brand identity is rooted in the Oda tree—a symbol of community assembly, wisdom, enduring growth, and kinship.
You answer visitor inquiries about our services (Custom Software, Web Platforms, Mobile Apps, Cloud Infrastructure, Retail SaaS, FinTech/Telebirr integrations), our portfolio (including BROS Technology and Bera Computer), our pricing approach (milestone sprints and retainers), and how to start a project.
Keep responses concise, welcoming, professional, and helpful. Guide users to our Start a Project page or Contact form when appropriate. If you do not know a specific detail, invite the user to contact the founder directly at contact@firatech.systems.`

const FALLBACK_RESPONSE = `Thank you for your interest in Fira Tech Solutions! I am temporarily unable to reach our AI inference service. Please leave your email in our contact form or write to us directly at contact@firatech.systems, and our founder will follow up with you today!`

async function searchKnowledgeBase(query) {
  try {
    // 1. Try keyword search function
    const keywordRes = await db.query(
      `SELECT category, title, content FROM search_knowledge_base_keyword($1, 4)`,
      [query]
    )
    if (keywordRes.rows.length > 0) {
      return keywordRes.rows.map(r => `[${r.category}] ${r.title}: ${r.content}`).join('\n\n')
    }

    // 2. Direct fallback
    const directRes = await db.query(
      `SELECT category, title, content FROM knowledge_base WHERE is_active = true LIMIT 4`
    )
    return directRes.rows.map(r => `[${r.category}] ${r.title}: ${r.content}`).join('\n\n')
  } catch (err) {
    logger.warn({ err: err.message }, 'Error searching knowledge base')
    return ''
  }
}

async function generateWithGroq(context, message) {
  if (!config.ai.groqKey || config.ai.groqKey.startsWith('YOUR_')) return null
  try {
    const { default: Groq } = await import('groq-sdk')
    const groq = new Groq({ apiKey: config.ai.groqKey })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nContext:\n${context}` },
        { role: 'user', content: message },
      ],
      temperature: 0.4,
      max_tokens: 300,
    })
    return completion.choices[0]?.message?.content || null
  } catch (err) {
    logger.warn({ err: err.message }, 'Groq chat generation failed')
    return null
  }
}

async function generateWithGemini(context, message) {
  if (!config.ai.geminiKey || config.ai.geminiKey.startsWith('YOUR_')) return null
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(config.ai.geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nContext:\n${context}` }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
    })
    return result.response.text() || null
  } catch (err) {
    logger.warn({ err: err.message }, 'Gemini chat generation failed')
    return null
  }
}

async function generateWithOpenAI(context, message) {
  if (!config.ai.openaiKey || config.ai.openaiKey.startsWith('YOUR_')) return null
  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: config.ai.openaiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nContext:\n${context}` },
        { role: 'user', content: message },
      ],
      temperature: 0.4,
      max_tokens: 300,
    })
    return completion.choices[0]?.message?.content || null
  } catch (err) {
    logger.warn({ err: err.message }, 'OpenAI chat generation failed')
    return null
  }
}

// POST /api/chat
router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' })
    }

    const trimmed = message.trim()
    if (!trimmed) {
      return res.status(400).json({ error: 'Message cannot be empty' })
    }

    // Retrieve context from knowledge base
    const context = await searchKnowledgeBase(trimmed)

    // Try fallback chain: Groq -> Gemini -> OpenAI
    let response = await generateWithGroq(context, trimmed)
    if (!response) {
      response = await generateWithGemini(context, trimmed)
    }
    if (!response) {
      response = await generateWithOpenAI(context, trimmed)
    }

    // Graceful fallback if all models fail or are unconfigured
    if (!response) {
      response = FALLBACK_RESPONSE
    }

    return res.status(200).json({ response })
  } catch (error) {
    logger.error({ error }, 'Fatal error in chat endpoint')
    return res.status(200).json({ response: FALLBACK_RESPONSE })
  }
})

export default router
