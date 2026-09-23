import { config } from '../../config/index.js'
import { db } from '../../config/database.js'
import { logger } from '../../utils/logger.js'

// Pricing per token in USD
const PRICING = {
  groq: {
    inputPerToken: 0.59 / 1_000_000,
    outputPerToken: 0.79 / 1_000_000,
  },
  gemini: {
    inputPerToken: 0.075 / 1_000_000,
    outputPerToken: 0.30 / 1_000_000,
  },
  openai: {
    inputPerToken: 0.15 / 1_000_000,
    outputPerToken: 0.60 / 1_000_000,
  },
  openaiEmbedding: {
    inputPerToken: 0.02 / 1_000_000,
    outputPerToken: 0,
  },
}

/**
 * Log token usage and estimated cost to database
 */
export async function logAiUsage({
  provider,
  feature = 'general',
  inputTokens = 0,
  outputTokens = 0,
  estimatedCostUsd = 0,
}) {
  try {
    await db.query(
      `INSERT INTO ai_usage_log (provider, feature, input_tokens, output_tokens, estimated_cost_usd)
       VALUES ($1, $2, $3, $4, $5)`,
      [provider, feature, inputTokens, outputTokens, estimatedCostUsd]
    )
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to write ai_usage_log')
  }
}

/**
 * Check if the monthly AI spending has exceeded the soft cap
 */
export async function checkMonthlySpend() {
  const cap = config.ai.monthlyCapUsd || 25.0
  try {
    const result = await db.query(`
      SELECT COALESCE(SUM(estimated_cost_usd), 0)::numeric AS total_spend,
             COUNT(*)::int AS total_calls
      FROM ai_usage_log
      WHERE created_at >= date_trunc('month', CURRENT_TIMESTAMP)
    `)
    const totalSpend = parseFloat(result.rows[0]?.total_spend || 0)
    const isCapExceeded = totalSpend >= cap

    if (isCapExceeded) {
      logger.warn(
        { totalSpend, cap },
        '⚠️ AI monthly soft cap exceeded! Founder notice surfaced on dashboard.'
      )
    }

    return {
      totalSpend,
      monthlyCap: cap,
      isCapExceeded,
      totalCalls: parseInt(result.rows[0]?.total_calls || 0),
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to calculate monthly AI spend')
    return {
      totalSpend: 0,
      monthlyCap: cap,
      isCapExceeded: false,
      totalCalls: 0,
    }
  }
}

/**
 * Retrieve comprehensive monthly AI statistics for Admin Dashboard
 */
export async function getAiSpendStatistics() {
  const spendInfo = await checkMonthlySpend()
  try {
    const featureBreakdown = await db.query(`
      SELECT feature,
             COUNT(*)::int AS count,
             COALESCE(SUM(estimated_cost_usd), 0)::numeric AS spend
      FROM ai_usage_log
      WHERE created_at >= date_trunc('month', CURRENT_TIMESTAMP)
      GROUP BY feature
      ORDER BY spend DESC
    `)

    const providerBreakdown = await db.query(`
      SELECT provider,
             COUNT(*)::int AS count,
             COALESCE(SUM(estimated_cost_usd), 0)::numeric AS spend
      FROM ai_usage_log
      WHERE created_at >= date_trunc('month', CURRENT_TIMESTAMP)
      GROUP BY provider
      ORDER BY spend DESC
    `)

    return {
      ...spendInfo,
      byFeature: featureBreakdown.rows.map((r) => ({
        feature: r.feature,
        count: parseInt(r.count),
        spend: parseFloat(r.spend),
      })),
      byProvider: providerBreakdown.rows.map((r) => ({
        provider: r.provider,
        count: parseInt(r.count),
        spend: parseFloat(r.spend),
      })),
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to query AI spend breakdowns')
    return {
      ...spendInfo,
      byFeature: [],
      byProvider: [],
    }
  }
}

/**
 * Try generating completion with Groq
 */
async function callGroq({ system, messages, jsonMode, maxTokens = 1200, temperature = 0.3 }) {
  if (!config.ai.groqKey || config.ai.groqKey.startsWith('YOUR_')) {
    throw new Error('Groq API key not configured')
  }

  const { default: Groq } = await import('groq-sdk')
  const groq = new Groq({ apiKey: config.ai.groqKey })

  const chatMessages = []
  if (system) {
    chatMessages.push({ role: 'system', content: system })
  }
  for (const m of messages) {
    chatMessages.push({ role: m.role || 'user', content: m.content })
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: chatMessages,
    temperature,
    max_tokens: maxTokens,
  }

  if (jsonMode) {
    payload.response_format = { type: 'json_object' }
  }

  const completion = await groq.chat.completions.create(payload)
  const choice = completion.choices[0]
  const content = choice?.message?.content || ''

  const inputTokens = completion.usage?.prompt_tokens || Math.ceil((system?.length || 0 + JSON.stringify(messages).length) / 4)
  const outputTokens = completion.usage?.completion_tokens || Math.ceil(content.length / 4)
  const cost = inputTokens * PRICING.groq.inputPerToken + outputTokens * PRICING.groq.outputPerToken

  return {
    content,
    provider: 'Groq',
    model: 'llama-3.3-70b-versatile',
    inputTokens,
    outputTokens,
    costUsd: cost,
  }
}

/**
 * Try generating completion with Gemini
 */
async function callGemini({ system, messages, jsonMode, maxTokens = 1200, temperature = 0.3 }) {
  if (!config.ai.geminiKey || config.ai.geminiKey.startsWith('YOUR_')) {
    throw new Error('Gemini API key not configured')
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(config.ai.geminiKey)
  
  // Use current active models
  const modelNames = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']
  let lastErr = null

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })

      const contents = []
      for (const m of messages) {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })
      }

      const genConfig = {
        temperature,
        maxOutputTokens: Math.max(maxTokens, 2048),
      }

      if (jsonMode) {
        genConfig.responseMimeType = 'application/json'
      }

      const requestOptions = {
        contents,
        generationConfig: genConfig,
      }

      if (system) {
        requestOptions.systemInstruction = {
          parts: [{ text: system }],
        }
      }

      const result = await model.generateContent(requestOptions)
      const text = result.response.text()

      const inputTokens = result.response.usageMetadata?.promptTokenCount || Math.ceil((system?.length || 0 + JSON.stringify(messages).length) / 4)
      const outputTokens = result.response.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4)
      const cost = inputTokens * PRICING.gemini.inputPerToken + outputTokens * PRICING.gemini.outputPerToken

      return {
        content: text,
        provider: 'Gemini',
        model: modelName,
        inputTokens,
        outputTokens,
        costUsd: cost,
      }
    } catch (err) {
      lastErr = err
    }
  }

  throw lastErr || new Error('All Gemini model variants failed')
}

/**
 * Try generating completion with OpenAI
 */
async function callOpenAI({ system, messages, jsonMode, maxTokens = 1200, temperature = 0.3 }) {
  if (!config.ai.openaiKey || config.ai.openaiKey.startsWith('YOUR_')) {
    throw new Error('OpenAI API key not configured')
  }

  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: config.ai.openaiKey })

  const chatMessages = []
  if (system) {
    chatMessages.push({ role: 'system', content: system })
  }
  for (const m of messages) {
    chatMessages.push({ role: m.role || 'user', content: m.content })
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: chatMessages,
    temperature,
    max_tokens: maxTokens,
  }

  if (jsonMode) {
    payload.response_format = { type: 'json_object' }
  }

  const completion = await openai.chat.completions.create(payload)
  const content = completion.choices[0]?.message?.content || ''

  const inputTokens = completion.usage?.prompt_tokens || Math.ceil((system?.length || 0 + JSON.stringify(messages).length) / 4)
  const outputTokens = completion.usage?.completion_tokens || Math.ceil(content.length / 4)
  const cost = inputTokens * PRICING.openai.inputPerToken + outputTokens * PRICING.openai.outputPerToken

  return {
    content,
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    inputTokens,
    outputTokens,
    costUsd: cost,
  }
}

/**
 * Shared multi-provider completion function:
 * Fallback order: Groq -> Gemini -> OpenAI
 */
export async function generateCompletion({
  system,
  messages = [],
  jsonMode = false,
  feature = 'copilot',
  maxTokens = 1200,
  temperature = 0.3,
}) {
  const errors = []
  let result = null

  // 1. Try Groq
  try {
    result = await callGroq({ system, messages, jsonMode, maxTokens, temperature })
  } catch (err) {
    errors.push(`Groq failed: ${err.message}`)
    logger.warn({ err: err.message }, 'Groq completion failed, falling back to Gemini')
  }

  // 2. Try Gemini fallback
  if (!result) {
    try {
      result = await callGemini({ system, messages, jsonMode, maxTokens, temperature })
    } catch (err) {
      errors.push(`Gemini failed: ${err.message}`)
      logger.warn({ err: err.message }, 'Gemini completion failed, falling back to OpenAI')
    }
  }

  // 3. Try OpenAI final fallback
  if (!result) {
    try {
      result = await callOpenAI({ system, messages, jsonMode, maxTokens, temperature })
    } catch (err) {
      errors.push(`OpenAI failed: ${err.message}`)
      logger.error({ errors }, 'All AI completion providers failed')
      throw new Error(`All AI completion providers failed: ${errors.join('; ')}`)
    }
  }

  // Log usage asynchronously
  await logAiUsage({
    provider: result.provider,
    feature,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    estimatedCostUsd: result.costUsd,
  })

  // Check budget status
  const spendInfo = await checkMonthlySpend()

  return {
    content: result.content,
    provider: result.provider,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd: result.costUsd,
    softCapExceeded: spendInfo.isCapExceeded,
    monthlySpend: spendInfo.totalSpend,
    monthlyCap: spendInfo.monthlyCap,
  }
}

/**
 * Dedicated text embedding:
 * Primary: OpenAI text-embedding-3-small (1536-dim).
 * Fallback: Gemini gemini-embedding-001 (configured with outputDimensionality: 1536).
 * Maintains strict 1536-dimension vector space for pgvector.
 */
export async function embedText(text) {
  const cleanText = text.replace(/\n+/g, ' ').trim()
  if (!cleanText) {
    throw new Error('Cannot embed empty text')
  }

  // 1. Try OpenAI if configured
  if (config.ai.openaiKey && !config.ai.openaiKey.startsWith('YOUR_')) {
    try {
      const { default: OpenAI } = await import('openai')
      const openai = new OpenAI({ apiKey: config.ai.openaiKey })

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanText,
        dimensions: 1536,
      })

      const embedding = response.data[0]?.embedding
      if (embedding && Array.isArray(embedding)) {
        const tokens = response.usage?.total_tokens || Math.ceil(cleanText.length / 4)
        const cost = tokens * PRICING.openaiEmbedding.inputPerToken

        await logAiUsage({
          provider: 'OpenAI',
          feature: 'embedding',
          inputTokens: tokens,
          outputTokens: 0,
          estimatedCostUsd: cost,
        })

        return embedding
      }
    } catch (err) {
      logger.warn({ err: err.message }, 'OpenAI embedding failed, falling back to Gemini 1536-dim embedding')
    }
  }

  // 2. Fallback to Gemini with outputDimensionality: 1536
  if (config.ai.geminiKey && !config.ai.geminiKey.startsWith('YOUR_')) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(config.ai.geminiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })

      const res = await model.embedContent({
        content: { parts: [{ text: cleanText }] },
        outputDimensionality: 1536,
      })

      const embedding = res.embedding?.values
      if (embedding && Array.isArray(embedding) && embedding.length === 1536) {
        const tokens = Math.ceil(cleanText.length / 4)
        const cost = tokens * PRICING.openaiEmbedding.inputPerToken // negligible

        await logAiUsage({
          provider: 'Gemini',
          feature: 'embedding',
          inputTokens: tokens,
          outputTokens: 0,
          estimatedCostUsd: cost,
        })

        return embedding
      }
    } catch (err) {
      logger.error({ err: err.message }, 'Gemini embedding failed')
      throw new Error(`Gemini embedding failed: ${err.message}`)
    }
  }

  throw new Error('No valid embedding provider available')
}

export default {
  generateCompletion,
  embedText,
  checkMonthlySpend,
  getAiSpendStatistics,
  logAiUsage,
}
