import crypto from 'crypto'
import path from 'path'

// Maximum file size: 10 Megabytes
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Disallowed extensions that must never appear in any part of the filename
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'bash', 'bin', 'msi', 'com', 'scr', 'pif',
  'php', 'php3', 'php4', 'php5', 'phtml', 'phar',
  'asp', 'aspx', 'jsp', 'jspx', 'cgi', 'pl', 'py', 'rb',
  'js', 'mjs', 'cjs', 'ts', 'vbs', 'wsf', 'jar',
  'htm', 'html', 'xhtml', 'svg', 'xml',
  'dll', 'so', 'dylib', 'elf',
])

// Allowed document extensions
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])

/**
 * Checks the magic bytes (file signature) of a buffer to verify
 * its true content type matches a supported document format.
 */
export function detectMagicFormat(buffer) {
  if (!buffer || buffer.length < 4) return null

  // 1. PDF: begins with "%PDF-" (0x25 0x50 0x44 0x46 0x2D)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'pdf'
  }

  // 2. DOC (OLE2 Compound Document): begins with 0xD0 0xCF 0x11 0xE0
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xD0 &&
    buffer[1] === 0xCF &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xE0
  ) {
    return 'doc'
  }

  // 3. DOCX (OpenXML ZIP container): begins with "PK\x03\x04" (0x50 0x4B 0x03 0x04)
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4B &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return 'docx'
  }

  return null
}

/**
 * Sanitizes an original filename, stripping directory traversal,
 * multiple dangerous extensions, and special characters.
 */
export function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'resume.pdf'
  }

  // 1. Strip path components & null bytes
  let name = path.basename(originalName).replace(/\0/g, '').trim()

  // 2. Remove URL encoded sequences
  try {
    name = decodeURIComponent(name)
  } catch {
    // Ignore decode error and proceed with raw
  }

  // 3. Replace spaces with underscores
  name = name.replace(/\s+/g, '_')

  // 4. Remove all characters except alphanumeric, hyphen, underscore, and dot
  name = name.replace(/[^a-zA-Z0-9._-]/g, '')

  // 5. Inspect extension
  const parts = name.split('.').filter(Boolean)
  if (parts.length < 2) {
    return null
  }

  const declaredExt = parts[parts.length - 1].toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(declaredExt)) {
    return null
  }

  // Check all intermediary parts for disguised dangerous extensions (e.g. name.php.pdf)
  for (let i = 0; i < parts.length - 1; i++) {
    if (DANGEROUS_EXTENSIONS.has(parts[i].toLowerCase())) {
      return null
    }
  }

  // Clean base name without final extension
  const baseName = parts.slice(0, -1).join('_').substring(0, 50) || 'document'
  return `${baseName}.${declaredExt}`
}

/**
 * Comprehensive verification of an uploaded resume buffer and filename.
 */
export function validateAndSanitizeResume(buffer, originalFilename, claimedMime) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { isValid: false, error: 'No valid file data received.' }
  }

  // 1. Check size limit
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File exceeds maximum allowed size of 10 MB (received ${(buffer.length / (1024 * 1024)).toFixed(1)} MB).`,
    }
  }

  if (buffer.length === 0) {
    return { isValid: false, error: 'File is empty (0 bytes).' }
  }

  // 2. Sanitize filename & verify extension
  const cleanOriginal = sanitizeFilename(originalFilename)
  if (!cleanOriginal) {
    return {
      isValid: false,
      error: 'Invalid file name or unsupported file extension. Allowed formats: .pdf, .doc, .docx.',
    }
  }

  const ext = path.extname(cleanOriginal).slice(1).toLowerCase()

  // 3. Magic bytes binary inspection
  const detectedFormat = detectMagicFormat(buffer)
  if (!detectedFormat) {
    return {
      isValid: false,
      error: 'File content signature could not be verified. Please ensure this is a genuine PDF or Word document.',
    }
  }

  // Verify that declared extension aligns with the true binary format
  // Note: Some systems output .doc for modern docx or vice versa, but format must be valid
  if (ext === 'pdf' && detectedFormat !== 'pdf') {
    return {
      isValid: false,
      error: 'File content does not match a valid PDF format.',
    }
  }

  if ((ext === 'doc' || ext === 'docx') && detectedFormat !== 'doc' && detectedFormat !== 'docx') {
    return {
      isValid: false,
      error: 'File content does not match a valid Microsoft Word document format.',
    }
  }

  // 4. Generate unique secure storage filename
  const randomToken = crypto.randomBytes(6).toString('hex')
  const baseOnly = path.basename(cleanOriginal, `.${ext}`).replace(/[^a-zA-Z0-9_-]/g, '')
  const storageFilename = `resume_${Date.now()}_${randomToken}_${baseOnly}.${detectedFormat}`

  const mimeMap = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }

  return {
    isValid: true,
    storageFilename,
    originalName: cleanOriginal,
    extension: detectedFormat,
    mimeType: mimeMap[detectedFormat] || claimedMime || 'application/octet-stream',
    size: buffer.length,
  }
}
