import { db } from '../../config/database.js'
import { embedText } from './ai.provider.js'
import { logger } from '../../utils/logger.js'

// Hand-crafted core company knowledge base derived from Fira Tech founding story and brand guidelines
const COMPANY_INFO_CHUNKS = [
  {
    title: 'Fira Tech Solutions — Company Overview & Heritage',
    content: `Fira Tech Solutions is a premier software engineering and digital transformation agency based in Adama, Ethiopia, founded and led by Samuel Girma.
Our brand visual identity and cultural ethos are anchored in the sacred Oda tree (Sycamore Fig) — the historical Oromo symbol of community assembly, wisdom, enduring shelter, kinship, and transparent consensus.
We reject the generic "flashy neon startup" aesthetic in favor of "Luxury Technology": an intentional fusion of Ethiopian heritage, architectural craftsmanship, deep engineering rigor, and serene digital elegance.
We build enterprise web platforms, high-performance mobile applications, customized SaaS products, and local Ethiopian payment infrastructure (Telebirr, CBE Birr, Chapa).`,
  },
  {
    title: 'Fira Tech Solutions — Engagement Model & Sprint Pricing Philosophy',
    content: `Fira Tech operates on a transparent, solo-founder-driven engineering engagement model.
Rather than ambiguous time-and-materials billing, we structure projects into defined, milestone-based sprints with guaranteed deliverable scopes.
Typical project pricing tiers:
- Discovery & Architectural Prototyping: Fixed rapid sprints to design database architecture, UI/UX design systems, and technical specifications.
- Core Web Platforms & Mobile Apps: Sprint milestones covering frontend, backend API, administrative CMS, and database integrations ($5,000 - $35,000+ depending on scope).
- Ongoing Engineering Retainers: Dedicated post-launch infrastructure monitoring, continuous integration, security auditing, and feature iteration.
Clients receive direct access to Samuel Girma with zero agency bloat or communication middlemen.`,
  },
  {
    title: 'Fira Tech Solutions — Technology Stack & Architecture',
    content: `Fira Tech engineers maintain a modern, battle-tested technology ecosystem designed for high concurrency, rock-solid security, and effortless maintainability:
- Frontend: React 18+, TypeScript, Vite, Tailwind CSS, Framer Motion, Radix UI / shadcn/ui.
- Backend: Node.js, Express, PostgreSQL with pgvector for artificial intelligence, Pino logging, Helmet security headers, JWT authentication.
- Mobile: React Native, Expo, Flutter for cross-platform iOS and Android deployments.
- Integrations: Telebirr payment gateway, CBE Birr, Chapa API, GitHub Apps CI/CD webhooks, Cloudinary media storage, AWS cloud infrastructure.
Every platform is designed as a modular monolith or clean layered architecture to deliver fast load speeds and long-term durability.`,
  },
  {
    title: 'Fira Tech Solutions — Founder Story: Samuel Girma',
    content: `Samuel Girma is the founder, principal software architect, and lead engineer at Fira Tech Solutions.
With deep expertise across full-stack distributed systems, mobile development, and financial payment integrations, Samuel founded Fira Tech to bridge the gap between traditional Ethiopian enterprises and international-grade technology standards.
Under his leadership, Fira Tech has delivered landmark platforms across education, retail, real estate, and financial technology, including the enterprise systems for Bros Technology, Bera Computer, and cultural heritage initiatives.
Visitors and prospective clients can reach Samuel directly through the website at contact@firatech.systems or through the Start a Project intake workflow.`,
  },
]

// Default initial FAQs to index
const DEFAULT_FAQS = [
  {
    question: 'How do I start a new project with Fira Tech?',
    answer: 'You can initiate a project directly through our Start a Project page on firatech.systems or by sharing your project scope in this chat. Samuel will personally review your technical requirements and reply within 24 hours with an architectural blueprint and milestone estimate.',
    category: 'engagement',
  },
  {
    question: 'Do you support Ethiopian payment integrations like Telebirr and CBE Birr?',
    answer: 'Yes. Fira Tech has built production-tested integrations for Telebirr SuperApp, CBE Birr, and Chapa payment gateways, enabling secure automated checkouts, QR payments, and real-time webhook settlement.',
    category: 'services',
  },
  {
    question: 'Can Fira Tech build mobile apps for both iOS and Android?',
    answer: 'Absolutely. We develop unified cross-platform mobile apps using React Native and Flutter with native performance, offline caching, push notifications, and seamless backend API synchronizations.',
    category: 'services',
  },
  {
    question: 'Where is Fira Tech located?',
    answer: 'Our primary studio is located in Adama, Ethiopia, and we serve clients across Addis Ababa, East Africa, North America, and Europe through secure remote collaboration and milestone delivery.',
    category: 'company',
  },
]

/**
 * Split text into chunks of roughly maxWords with overlap
 */
function chunkText(text, maxWords = 350, overlap = 40) {
  if (!text) return []
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return [text.trim()]

  const chunks = []
  let i = 0
  while (i < words.length) {
    const end = Math.min(i + maxWords, words.length)
    chunks.push(words.slice(i, end).join(' '))
    if (end === words.length) break
    i += maxWords - overlap
  }
  return chunks
}

/**
 * Reindex everything across company_info, services, portfolio, blogs, and FAQ
 */
export async function reindexAll() {
  logger.info('Starting full RAG knowledge base re-indexing...')
  let indexedCount = 0

  try {
    // 1. Clear existing chunks
    await db.query('DELETE FROM knowledge_chunks')

    // 2. Ensure default FAQs exist
    for (const f of DEFAULT_FAQS) {
      await db.query(
        `INSERT INTO faq (question, answer, category, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT DO NOTHING`,
        [f.question, f.answer, f.category]
      )
    }

    // 3. Index Company Info Chunks
    for (const item of COMPANY_INFO_CHUNKS) {
      const fullText = `${item.title}\n\n${item.content}`
      const embedding = await embedText(fullText)
      await db.query(
        `INSERT INTO knowledge_chunks (source_type, source_id, content, embedding, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        ['company_info', null, fullText, JSON.stringify(embedding), { title: item.title }]
      )
      indexedCount++
    }

    // 4. Index Active Services
    const servicesRes = await db.query(
      `SELECT id, title, description, short_description, features, deliverables, technologies, category
       FROM services WHERE status = 'active' OR status IS NULL`
    )
    for (const s of servicesRes.rows) {
      const serviceText = `Service: ${s.title} (${s.category || 'Engineering'})
Description: ${s.description || s.short_description || ''}
${s.features?.length ? `Key Features: ${Array.isArray(s.features) ? s.features.join(', ') : s.features}` : ''}
${s.deliverables?.length ? `Deliverables: ${Array.isArray(s.deliverables) ? s.deliverables.join(', ') : s.deliverables}` : ''}
${s.technologies?.length ? `Technologies: ${Array.isArray(s.technologies) ? s.technologies.join(', ') : s.technologies}` : ''}`.trim()

      const chunks = chunkText(serviceText)
      for (const chunk of chunks) {
        const embedding = await embedText(chunk)
        await db.query(
          `INSERT INTO knowledge_chunks (source_type, source_id, content, embedding, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          ['service', s.id, chunk, JSON.stringify(embedding), { id: s.id, name: s.title }]
        )
        indexedCount++
      }
    }

    // 5. Index Portfolio Projects (Case Studies)
    const portfolioRes = await db.query(
      `SELECT id, title, client_name, category, short_description, full_description, problem, solution, results, technologies
       FROM portfolio_projects`
    )
    for (const p of portfolioRes.rows) {
      const pText = `Case Study: ${p.title} for ${p.client_name || 'Client'} (${p.category || 'Project'})
Overview: ${p.short_description || p.full_description || ''}
${p.problem ? `The Challenge: ${p.problem}` : ''}
${p.solution ? `Engineering Solution: ${p.solution}` : ''}
${p.results ? `Results & Impact: ${p.results}` : ''}
${p.technologies?.length ? `Technologies: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}` : ''}`.trim()

      const chunks = chunkText(pText)
      for (const chunk of chunks) {
        const embedding = await embedText(chunk)
        await db.query(
          `INSERT INTO knowledge_chunks (source_type, source_id, content, embedding, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          ['portfolio', p.id, chunk, JSON.stringify(embedding), { id: p.id, title: p.title }]
        )
        indexedCount++
      }
    }

    // 6. Index Published Blogs
    const blogsRes = await db.query(
      `SELECT id, title, excerpt, content, category FROM blogs WHERE published = true`
    )
    for (const b of blogsRes.rows) {
      const blogText = `Thought Leadership Article: ${b.title} (${b.category || 'Insights'})
Excerpt: ${b.excerpt || ''}
Content: ${b.content || ''}`.trim()

      const chunks = chunkText(blogText)
      for (const chunk of chunks) {
        const embedding = await embedText(chunk)
        await db.query(
          `INSERT INTO knowledge_chunks (source_type, source_id, content, embedding, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          ['blog', b.id, chunk, JSON.stringify(embedding), { id: b.id, title: b.title }]
        )
        indexedCount++
      }
    }

    // 7. Index FAQs
    const faqRes = await db.query(
      `SELECT id, question, answer, category FROM faq WHERE is_active = true`
    )
    for (const f of faqRes.rows) {
      const faqText = `Frequently Asked Question: ${f.question}
Answer: ${f.answer}`.trim()

      const embedding = await embedText(faqText)
      await db.query(
        `INSERT INTO knowledge_chunks (source_type, source_id, content, embedding, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        ['faq', f.id, faqText, JSON.stringify(embedding), { id: f.id, question: f.question }]
      )
      indexedCount++
    }

    logger.info({ indexedCount }, '✅ Full RAG indexing completed successfully')
    return { success: true, indexedChunks: indexedCount }
  } catch (err) {
    logger.error({ err: err.message }, 'Failed during reindexAll')
    throw err
  }
}

/**
 * Incremental indexing for single changed items (services, portfolio, blogs, faq)
 */
export async function indexSingleItem(sourceType, sourceId) {
  if (!sourceType || !sourceId) return
  try {
    // 1. Delete previous chunks for this item
    await db.query(
      `DELETE FROM knowledge_chunks WHERE source_type = $1 AND source_id = $2`,
      [sourceType, String(sourceId)]
    )

    let contentToChunk = ''
    let metadata = {}

    if (sourceType === 'service') {
      const s = (
        await db.query('SELECT * FROM services WHERE id = $1', [sourceId])
      ).rows[0]
      if (!s) return
      contentToChunk = `Service: ${s.title} (${s.category || 'Engineering'})
Description: ${s.description || s.short_description || ''}
${s.features?.length ? `Features: ${Array.isArray(s.features) ? s.features.join(', ') : s.features}` : ''}
${s.deliverables?.length ? `Deliverables: ${Array.isArray(s.deliverables) ? s.deliverables.join(', ') : s.deliverables}` : ''}
${s.technologies?.length ? `Technologies: ${Array.isArray(s.technologies) ? s.technologies.join(', ') : s.technologies}` : ''}`
      metadata = { id: s.id, name: s.title }
    } else if (sourceType === 'portfolio') {
      const p = (
        await db.query('SELECT * FROM portfolio_projects WHERE id = $1', [sourceId])
      ).rows[0]
      if (!p) return
      contentToChunk = `Case Study: ${p.title} for ${p.client_name || 'Client'}
Overview: ${p.short_description || p.full_description || ''}
${p.problem ? `Problem: ${p.problem}` : ''}
${p.solution ? `Solution: ${p.solution}` : ''}
${p.results ? `Results: ${p.results}` : ''}`
      metadata = { id: p.id, title: p.title }
    } else if (sourceType === 'blog') {
      const b = (
        await db.query('SELECT * FROM blogs WHERE id = $1 AND published = true', [sourceId])
      ).rows[0]
      if (!b) return
      contentToChunk = `Article: ${b.title} (${b.category || 'Tech'})
Summary: ${b.excerpt || ''}
Content: ${b.content || ''}`
      metadata = { id: b.id, title: b.title }
    } else if (sourceType === 'faq') {
      const f = (
        await db.query('SELECT * FROM faq WHERE id = $1 AND is_active = true', [sourceId])
      ).rows[0]
      if (!f) return
      contentToChunk = `Question: ${f.question}\nAnswer: ${f.answer}`
      metadata = { id: f.id, question: f.question }
    }

    if (!contentToChunk) return

    const chunks = chunkText(contentToChunk)
    for (const chunk of chunks) {
      const embedding = await embedText(chunk)
      await db.query(
        `INSERT INTO knowledge_chunks (source_type, source_id, content, embedding, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [sourceType, String(sourceId), chunk, JSON.stringify(embedding), metadata]
      )
    }

    logger.info({ sourceType, sourceId, chunksCount: chunks.length }, 'Incremental RAG item indexed')
  } catch (err) {
    logger.warn({ err: err.message, sourceType, sourceId }, 'Incremental indexing failed')
  }
}

/**
 * Remove chunks when an item is deleted
 */
export async function deleteItemChunks(sourceType, sourceId) {
  try {
    await db.query(
      `DELETE FROM knowledge_chunks WHERE source_type = $1 AND source_id = $2`,
      [sourceType, String(sourceId)]
    )
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to delete knowledge chunks')
  }
}

export default {
  reindexAll,
  indexSingleItem,
  deleteItemChunks,
}
