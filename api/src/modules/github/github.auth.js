import crypto from 'node:crypto'
import { githubConfig } from './github.config.js'

let cachedToken = null
let tokenExpiresAt = 0

/**
 * Generate a short-lived JWT signed with RS256 for GitHub App authentication.
 * Valid for max 10 minutes per GitHub's requirement.
 */
export function generateAppJwt() {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 600 // 10 minutes

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const payload = {
    iat: now - 60, // 60 seconds in the past to allow clock drift
    exp,
    iss: githubConfig.appId,
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const privateKey = formatPrivateKey(githubConfig.privateKey)
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(dataToSign)
  sign.end()
  const signature = sign.sign(privateKey, 'base64url')

  return `${dataToSign}.${signature}`
}

/**
 * Ensure the private key is properly formatted for Node.js crypto.
 */
function formatPrivateKey(key) {
  if (!key) return key
  // Replace literal \n with actual newlines (from .env files)
  key = key.replace(/\\n/g, '\n')
  // If already has headers, return as-is
  if (key.includes('-----BEGIN')) return key
  // Otherwise wrap it
  return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`
}

/**
 * Get an installation access token for the configured installation.
 * Caches the token until it expires (tokens last 1 hour).
 */
export async function getInstallationToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiresAt > Date.now() + 300_000) {
    return cachedToken
  }

  const jwt = generateAppJwt()

  const response = await fetch(
    `https://api.github.com/app/installations/${githubConfig.installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': githubConfig.apiVersion,
        'User-Agent': 'Fira-Command-App',
      },
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new GitHubAuthError(
      response.status,
      error.message || 'Failed to obtain installation token',
      response.status === 401 ? 'invalid_credentials' :
      response.status === 403 ? 'permission_denied' :
      response.status === 404 ? 'installation_not_found' : 'unknown'
    )
  }

  const data = await response.json()
  cachedToken = data.token
  // expires_at is ISO string, convert to ms
  tokenExpiresAt = new Date(data.expires_at).getTime()

  return data.token
}

/**
 * Clear cached token (e.g., on 401 error).
 */
export function clearCachedToken() {
  cachedToken = null
  tokenExpiresAt = 0
}

/**
 * Custom error class for GitHub authentication errors.
 */
export class GitHubAuthError extends Error {
  constructor(status, message, code) {
    super(message)
    this.name = 'GitHubAuthError'
    this.status = status
    this.code = code
  }
}
