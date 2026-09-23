import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { db } from '../../config/database.js'
import { authenticate, requireAdmin } from '../../middleware/auth.js'
import { generateCompletion, getAiSpendStatistics } from './ai.provider.js'
import { extractCvText } from './cv.parser.js'
import { logger } from '../../utils/logger.js'

const router = Router()

// Rate limit: 45 admin AI operations per minute to prevent accidental click surges
const adminAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
})

// All AI admin routes require authentication and admin role
router.use(authenticate, requireAdmin, adminAiLimiter)

// ============================================
// 1. AI SPEND & USAGE MONITORING
// ============================================

// GET /api/ai/spend - Founder AI spend overview
router.get('/spend', async (req, res) => {
  try {
    const stats = await getAiSpendStatistics()
    return res.status(200).json(stats)
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get AI spend stats')
    return res.status(500).json({ error: 'Failed to retrieve AI spend statistics' })
  }
})

// ============================================
// 2. CONTEXT-AWARE EMAIL DRAFTING
// ============================================

// POST /api/ai/email/draft - Generate 2 editable email variants
router.post('/email/draft', async (req, res) => {
  try {
    const { purpose, recipientContext, keyPoints = [], tone = 'Professional' } = req.body

    if (!purpose && !recipientContext) {
      return res.status(400).json({ error: 'Email purpose or recipient context is required' })
    }

    const systemPrompt = `You are an executive email drafting assistant for Samuel Girma, founder and principal engineer of Fira Tech Solutions (firatech.systems).
Your task is to generate TWO short, distinct, high-impact email draft variants:
- Variant 1: "Direct & Structured" (crisp, clear bullet points or short paragraphs, professional, immediately actionable).
- Variant 2: "Warm & Conversational" (personable, relationship-focused, thoughtful, collaborative).

Rules:
1. Tone requested: ${tone}.
2. Never auto-send. This is an editable draft.
3. Keep emails concise and respectful of the recipient's time.
4. Sign off as "Samuel Girma | Founder & Lead Architect, Fira Tech Solutions".
5. Return strict JSON matching this structure:
{
  "variants": [
    {
      "id": "direct",
      "label": "Direct & Structured",
      "subject": "Clear subject line",
      "body": "Email body content"
    },
    {
      "id": "warmer",
      "label": "Warm & Conversational",
      "subject": "Warm subject line",
      "body": "Email body content"
    }
  ]
}`

    const userPrompt = `Draft an email with the following details:
- Purpose: ${purpose || 'Follow-up communication'}
- Recipient Context: ${JSON.stringify(recipientContext || {})}
- Key Talking Points: ${Array.isArray(keyPoints) ? keyPoints.join('; ') : keyPoints}
- Tone: ${tone}`

    const completion = await generateCompletion({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      jsonMode: true,
      feature: 'email_drafting',
      maxTokens: 1000,
      temperature: 0.4,
    })

    let parsed
    try {
      parsed = JSON.parse(completion.content)
    } catch {
      // Fallback parser if markdown blocks wrap json
      const cleaned = completion.content.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    return res.status(200).json({
      variants: parsed.variants || [],
      provider: completion.provider,
      softCapExceeded: completion.softCapExceeded,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to draft email with AI')
    return res.status(500).json({ error: `Failed to draft email: ${error.message}` })
  }
})

// ============================================
// 3. THOUGHT LEADERSHIP & BLOG WRITING
// ============================================

// POST /api/ai/blog/draft - Draft a new blog post
router.post('/blog/draft', async (req, res) => {
  try {
    const { topic, targetKeywords = [], outline = '', tone = 'Thought Leadership' } = req.body

    if (!topic) {
      return res.status(400).json({ error: 'Blog topic is required' })
    }

    const systemPrompt = `You are a technology thought-leadership writer for Fira Tech Solutions and its founder, Samuel Girma.
Your voice reflects:
- Deep engineering expertise (modular monoliths, TypeScript, PostgreSQL, high-concurrency systems, cross-platform apps).
- Cultural grounding in the Oda tree and Ethiopian technological sovereignty.
- Pragmatic software craftsmanship: fast, durable, clean architecture over fleeting hype.
- Engaging, articulate, and insightful style.

Generate a complete, ready-to-edit blog post. Return strict JSON:
{
  "title": "Compelling, non-clickbait essay title",
  "excerpt": "2-sentence punchy summary for the homepage feed",
  "metaDescription": "155-character SEO meta description",
  "body": "Full article formatted in rich GitHub Flavored Markdown (with ## subheaders, code snippets or bullet points where fitting)",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "category": "Architecture | FinTech | Mobile | Engineering"
}`

    const userPrompt = `Topic: ${topic}
Target Keywords: ${Array.isArray(targetKeywords) ? targetKeywords.join(', ') : targetKeywords}
Outline / Specific Angles: ${outline || 'Cover core engineering principles, common industry anti-patterns, and practical architecture recommendations.'}
Tone: ${tone}`

    const completion = await generateCompletion({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      jsonMode: true,
      feature: 'blog_drafting',
      maxTokens: 2500,
      temperature: 0.5,
    })

    let parsed
    try {
      parsed = JSON.parse(completion.content)
    } catch {
      const cleaned = completion.content.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    return res.status(200).json({
      ...parsed,
      provider: completion.provider,
      softCapExceeded: completion.softCapExceeded,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to draft blog with AI')
    return res.status(500).json({ error: `Failed to generate blog draft: ${error.message}` })
  }
})

// POST /api/ai/blog/improve - Review & evaluate existing blog post
router.post('/blog/improve', async (req, res) => {
  try {
    const { title, content, excerpt } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Blog content is required for improvement analysis' })
    }

    const systemPrompt = `You are an SEO and technical editorial auditor for Fira Tech Solutions.
Analyze the provided blog post draft and provide actionable improvements without rewriting the whole post.
Return strict JSON:
{
  "titleSuggestions": ["Better title option 1", "Better title option 2"],
  "metaDescription": "Optimized 155-character meta description",
  "readabilityScore": "High | Medium | Needs Polish",
  "readabilityNotes": "1-2 sentences on tone, flow, and pacing",
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "strengths": ["What works really well in this article"],
  "editorialRecommendations": ["Specific section or technical concept that could be expanded"]
}`

    const userPrompt = `Title: ${title || 'Untitled'}
Excerpt: ${excerpt || 'None'}
Content:
${content.slice(0, 5000)}`

    const completion = await generateCompletion({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      jsonMode: true,
      feature: 'blog_improving',
      maxTokens: 1000,
      temperature: 0.3,
    })

    let parsed
    try {
      parsed = JSON.parse(completion.content)
    } catch {
      const cleaned = completion.content.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
    }

    return res.status(200).json({
      ...parsed,
      provider: completion.provider,
    })
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to improve blog with AI')
    return res.status(500).json({ error: `Failed to review blog: ${error.message}` })
  }
})

// ============================================
// 4. APPLICANT SCREENING & ANALYSIS
// ============================================

// POST /api/ai/applications/:id/analyze - Extract CV and generate structured evaluation
router.post('/applications/:id/analyze', async (req, res) => {
  const { id } = req.params
  try {
    // 1. Fetch application and parent job
    const appRes = await db.query(
      `SELECT a.*, j.title as job_title, j.description as job_description, j.experience as job_experience
       FROM applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    )

    if (appRes.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const application = appRes.rows[0]

    // 2. Extract CV text
    let cvText = ''
    if (application.cv_url) {
      try {
        cvText = await extractCvText(application.cv_url)
      } catch (cvErr) {
        logger.warn({ err: cvErr.message, cvUrl: application.cv_url }, 'Could not extract CV text')
        cvText = `[CV file text could not be extracted: ${cvErr.message}]`
      }
    } else {
      cvText = '[No CV attachment provided]'
    }

    // 3. Build evaluation prompt
    const systemPrompt = `You are an elite technical talent evaluator assisting Samuel Girma at Fira Tech Solutions.
Evaluate the candidate's application against the target job posting.

Evaluation Criteria:
1. Technical depth and relevance to the position.
2. Verified practical experience and years in the field.
3. Clarity and intentionality in cover letter.
4. Specific red flags or remarkable strengths.

Privacy & Guardrail Rule:
This evaluation is private to the founder. Candidate data is NEVER indexed for public consumption.

You MUST return a strict JSON object:
{
  "score": 0-100 (integer score of overall fit),
  "summary": "2-3 sentence executive overview of the candidate",
  "strengths": ["Key strength 1", "Key strength 2"],
  "concerns": ["Potential gap or area to probe in interview"],
  "yearsExperience": number (estimated from resume, or 0 if entry),
  "keySkillsFound": ["skill 1", "skill 2", "..."],
  "missingRequiredSkills": ["skill 1", "..."],
  "recommendation": "strong_fit" | "possible_fit" | "not_a_fit"
}`

    const userPrompt = `Target Job Title: ${application.job_title || 'Software Engineer'}
Target Job Experience Level: ${application.job_experience || 'Not specified'}
Job Requirements & Description:
${application.job_description || 'General software engineering role.'}

Candidate Name: ${application.name}
Cover Letter:
${application.cover_letter || 'No cover letter provided.'}

Extracted CV / Resume Text:
${cvText.slice(0, 7000)}`

    const completion = await generateCompletion({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      jsonMode: true,
      feature: 'applicant_analysis',
      maxTokens: 1200,
      temperature: 0.2,
    })

    let analysis
    try {
      analysis = JSON.parse(completion.content)
    } catch {
      const cleaned = completion.content.replace(/```json|```/g, '').trim()
      analysis = JSON.parse(cleaned)
    }

    const score = Math.min(100, Math.max(0, parseInt(analysis.score) || 50))

    // 4. Update database row
    const updateRes = await db.query(
      `UPDATE applications
       SET ai_score = $1,
           ai_analysis = $2,
           ai_analyzed_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [score, JSON.stringify(analysis), id]
    )

    return res.status(200).json({
      application: updateRes.rows[0],
      analysis,
      score,
      provider: completion.provider,
    })
  } catch (error) {
    logger.error({ error: error.message, id }, 'Failed to analyze application')
    return res.status(500).json({ error: `Applicant analysis failed: ${error.message}` })
  }
})

// POST /api/ai/jobs/:jobId/analyze-all - Batch analyze all unanalyzed applicants for a job
router.post('/jobs/:jobId/analyze-all', async (req, res) => {
  const { jobId } = req.params
  try {
    const unanalyzed = await db.query(
      `SELECT id FROM applications WHERE job_id = $1 AND ai_score IS NULL`,
      [jobId]
    )

    let analyzedCount = 0
    for (const app of unanalyzed.rows) {
      try {
        // Run single analysis logic
        const singleRes = await fetch(
          `http://localhost:${process.env.PORT || 3000}/api/ai/applications/${app.id}/analyze`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: req.headers.cookie || '',
              Authorization: req.headers.authorization || '',
            },
          }
        )
        if (singleRes.ok) analyzedCount++
        // Gentle delay between calls to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 600))
      } catch (singleErr) {
        logger.warn({ err: singleErr.message, appId: app.id }, 'Batch analysis skipped application')
      }
    }

    return res.status(200).json({
      message: `Batch analysis completed: ${analyzedCount} of ${unanalyzed.rows.length} applications processed.`,
      analyzedCount,
      total: unanalyzed.rows.length,
    })
  } catch (error) {
    logger.error({ error: error.message, jobId }, 'Failed batch application analysis')
    return res.status(500).json({ error: `Batch analysis failed: ${error.message}` })
  }
})

export default router
