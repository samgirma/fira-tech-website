import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { db } from '../../config/database.js'
import { generateCompletion, embedText } from './ai.provider.js'
import { reindexAll } from './rag.indexer.js'
import { authenticate, requireAdmin } from '../../middleware/auth.js'
import { logger } from '../../utils/logger.js'

const router = Router()

// Rate limit for public chatbot: 40 requests per 15 minutes per IP
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat inquiries. Please wait a moment before sending another message.' },
})

const ODA_SYSTEM_PROMPT = `You are the AI assistant for Fira Tech Solutions, rooted in the sacred spirit of the Oda tree (Sycamore Fig) — the historical Oromo symbol of community assembly, wisdom, enduring shelter, kinship, and transparent consensus.
Fira Tech Solutions is a luxury technology and software engineering studio based in Adama, Ethiopia, founded and led by Samuel Girma.
We build enterprise web platforms, high-performance mobile apps, customized SaaS, and Ethiopian financial integrations (Telebirr, CBE Birr, Chapa).

Persona & Behavioral Rules:
1. Grounding: Answer visitor inquiries using the verified knowledge base chunks provided below.
2. Anti-Hallucination: If the answer cannot be determined from the provided context, state clearly: "I'm not sure about that specific detail — let me have Samuel follow up with you directly." Never invent unquoted prices, false technical commitments, or fictitious staff.
3. Tone: Welcoming, articulate, professional, respectful, calm, and grounded in craftsmanship.
4. Lead Capture: If the visitor asks about starting a project, hiring Fira Tech, requesting a quote, or building a system, invite them warmly: "Would you like me to pass your project details directly to Samuel Girma? If so, please share your email or phone number here, or visit our /start-project page."
5. Contact Detection: If the user provides an email or phone number to connect with Samuel, acknowledge it warmly and confirm that their inquiry is being shared with Samuel Girma.`

/**
 * Helper to detect email or phone in user message for lead capture
 */
function extractContactInfo(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
  const phoneRegex = /(\+?251\s?\d{1,2}\s?\d{3}\s?\d{4}|\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\b09\d{8}\b|\b07\d{8}\b)/g

  const emails = text.match(emailRegex) || []
  const phones = text.match(phoneRegex) || []

  return {
    email: emails[0] || null,
    phone: phones[0] || null,
    hasContact: emails.length > 0 || phones.length > 0,
  }
}

// POST /api/chat - Public RAG Chatbot
router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message, sessionId = 'anon', history = [] } = req.body
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' })
    }

    const trimmed = message.trim()

    // 1. Generate query embedding
    let queryEmbedding
    try {
      queryEmbedding = await embedText(trimmed)
    } catch (embErr) {
      logger.warn({ err: embErr.message }, 'Could not generate query embedding')
    }

    // 2. Vector search knowledge chunks
    let matchedChunks = []
    if (queryEmbedding && Array.isArray(queryEmbedding)) {
      const vectorRes = await db.query(
        `SELECT id, source_type, content, 1 - (embedding <=> $1::vector) AS similarity
         FROM knowledge_chunks
         ORDER BY embedding <=> $1::vector
         LIMIT 5`,
        [JSON.stringify(queryEmbedding)]
      )
      matchedChunks = vectorRes.rows.filter((r) => parseFloat(r.similarity) > 0.35)
    }

    const matchedChunkIds = matchedChunks.map((c) => c.id)
    const contextContent = matchedChunks.length > 0
      ? matchedChunks.map((c) => `[Source: ${c.source_type}]\n${c.content}`).join('\n\n---\n\n')
      : 'No specific knowledge base records found for this query.'

    // 3. Check for visitor contact info & lead creation
    const contact = extractContactInfo(trimmed)
    let leadCaptured = false

    if (contact.hasContact) {
      try {
        await db.query(
          `INSERT INTO clients (name, email, phone, stage, source, notes)
           VALUES ($1, $2, $3, 'new', 'chat_assistant', $4)`,
          [
            contact.email ? contact.email.split('@')[0] : 'Chat Visitor',
            contact.email,
            contact.phone,
            `Inquiry captured via Oda Chat Assistant: "${trimmed}"`,
          ]
        )
        leadCaptured = true
        logger.info({ email: contact.email, phone: contact.phone }, '✅ Lead captured from chatbot')
      } catch (clientErr) {
        logger.warn({ err: clientErr.message }, 'Failed to insert chat lead into clients table')
      }
    }

    // 4. Build prompt & call completion
    const messages = []
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-4)) {
        if (h.role && h.content) {
          messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })
        }
      }
    }
    messages.push({ role: 'user', content: trimmed })

    const systemPrompt = `${ODA_SYSTEM_PROMPT}\n\n=== RETRIEVED KNOWLEDGE BASE CONTEXT ===\n${contextContent}\n\n${
      leadCaptured
        ? 'NOTE: The user just provided their contact information! Confirm that their inquiry and contact information have been directly recorded for Samuel Girma, and thank them warmly.'
        : ''
    }`

    const completion = await generateCompletion({
      system: systemPrompt,
      messages,
      feature: 'rag_chat',
      maxTokens: 500,
      temperature: 0.35,
    })

    const responseText = completion.content || "I apologize, but I'm unable to process this right now. Please reach out to Samuel directly at contact@firatech.systems."

    // 5. Log turn to chat_logs
    try {
      await db.query(
        `INSERT INTO chat_logs (session_id, message, response, matched_chunk_ids, lead_captured)
         VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, trimmed, responseText, matchedChunkIds, leadCaptured]
      )
    } catch (logErr) {
      logger.warn({ err: logErr.message }, 'Failed to log chat interaction')
    }

    return res.status(200).json({
      response: responseText,
      provider: completion.provider,
      leadCaptured,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Fatal error in RAG chat endpoint')
    return res.status(200).json({
      response: "Thank you for reaching out to Fira Tech Solutions! I am temporarily unable to complete your inquiry. Please reach out to Samuel Girma directly at contact@firatech.systems or through our Start a Project page.",
    })
  }
})

// POST /api/ai/reindex - Admin only: force full rebuild of knowledge base
router.post('/reindex', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await reindexAll()
    return res.status(200).json({
      message: 'RAG Knowledge base successfully re-indexed',
      indexedChunks: result.indexedChunks,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to reindex knowledge base')
    return res.status(500).json({ error: `Re-indexing failed: ${error.message}` })
  }
})

export default router
