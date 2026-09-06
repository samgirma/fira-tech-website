import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizeOrganization } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch the connected GitHub organization.
 * @returns {Promise<Object>} Normalized organization
 */
export async function getOrganization() {
  const client = createGitHubClient()
  const { data } = await client.get(`/orgs/${process.env.GITHUB_ORG_NAME}`)
  return normalizeOrganization(data)
}

/**
 * Get the organization from the local database.
 * @returns {Promise<Object|null>}
 */
export async function getLocalOrganization() {
  const result = await db.query(
    'SELECT * FROM github_organizations ORDER BY created_at DESC LIMIT 1'
  )
  return result.rows[0] || null
}

/**
 * Sync the organization to the local database.
 * @returns {Promise<Object>} Synced organization
 */
export async function syncOrganization() {
  const githubOrg = await getOrganization()

  const result = await db.query(
    `INSERT INTO github_organizations (github_id, login, name, avatar_url, description, html_url, public_repos, last_synced_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (github_id) DO UPDATE SET
       login = EXCLUDED.login,
       name = EXCLUDED.name,
       avatar_url = EXCLUDED.avatar_url,
       description = EXCLUDED.description,
       html_url = EXCLUDED.html_url,
       public_repos = EXCLUDED.public_repos,
       last_synced_at = NOW()
     RETURNING *`,
    [
      githubOrg.githubId,
      githubOrg.login,
      githubOrg.name,
      githubOrg.avatarUrl,
      githubOrg.description,
      githubOrg.htmlUrl,
      githubOrg.publicRepos,
    ]
  )

  safeLog('info', 'Organization synced', { login: githubOrg.login })
  return result.rows[0]
}

/**
 * Get connection status for the GitHub integration.
 * @returns {Promise<Object>} Connection status
 */
export async function getConnectionStatus() {
  try {
    const org = await getOrganization()
    return {
      connected: true,
      provider: 'github',
      organization: org.login,
      organizationName: org.name,
      installationId: process.env.GITHUB_INSTALLATION_ID,
      avatarUrl: org.avatarUrl,
      lastCheckedAt: new Date().toISOString(),
    }
  } catch (error) {
    const normalized = normalizeGitHubError(error)
    return {
      connected: false,
      provider: 'github',
      organization: process.env.GITHUB_ORG_NAME,
      installationId: process.env.GITHUB_INSTALLATION_ID,
      error: normalized.message,
      lastCheckedAt: new Date().toISOString(),
    }
  }
}
