import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Download file buffer from URL or read from local uploads folder
 */
async function getFileBuffer(cvUrl) {
  if (!cvUrl) throw new Error('No CV URL provided')

  // Case 1: Local file in uploads
  if (cvUrl.includes('/uploads/')) {
    const filename = cvUrl.split('/uploads/').pop()?.split('?')[0]
    const localPath = path.join(__dirname, '../../../uploads', filename)
    if (fs.existsSync(localPath)) {
      return {
        buffer: fs.readFileSync(localPath),
        filename,
      }
    }
  }

  // Case 2: Remote URL (Cloudinary, S3, or external HTTP)
  if (cvUrl.startsWith('http://') || cvUrl.startsWith('https://')) {
    const res = await fetch(cvUrl)
    if (!res.ok) {
      throw new Error(`Failed to download CV file: HTTP ${res.status}`)
    }
    const arrayBuffer = await res.arrayBuffer()
    const filename = cvUrl.split('/').pop()?.split('?')[0] || 'document.pdf'
    return {
      buffer: Buffer.from(arrayBuffer),
      filename,
    }
  }

  // Case 3: Direct local file path
  if (fs.existsSync(cvUrl)) {
    return {
      buffer: fs.readFileSync(cvUrl),
      filename: path.basename(cvUrl),
    }
  }

  throw new Error(`CV file could not be located at ${cvUrl}`)
}

/**
 * Extract clean plain text from PDF or DOCX resume
 */
export async function extractCvText(cvUrl) {
  try {
    const { buffer, filename } = await getFileBuffer(cvUrl)
    const ext = filename.split('.').pop()?.toLowerCase() || ''

    if (ext === 'pdf' || buffer.slice(0, 5).toString('ascii').startsWith('%PDF')) {
      const { default: pdfParse } = await import('pdf-parse')
      const data = await pdfParse(buffer)
      const text = data.text || ''
      return text.replace(/\s+/g, ' ').trim()
    }

    if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''
      return text.replace(/\s+/g, ' ').trim()
    }

    // Fallback: UTF-8 text string
    return buffer.toString('utf8').replace(/\s+/g, ' ').trim()
  } catch (err) {
    logger.error({ err: err.message, cvUrl }, 'Failed to extract CV text')
    throw new Error(`CV extraction failed: ${err.message}`)
  }
}

export default {
  extractCvText,
}
