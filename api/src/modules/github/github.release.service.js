import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizeRelease } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch releases from a GitHub repository.
 * @param {string} repoFullName - Repository full name
 * @returns {Promise<Object[]>} Normalized releases
 */
export async function getReleasesFromGitHub(repoFullName) {
  const client = createGitHubClient()
  const allReleases = []
  let page = 1

  while (true) {
    const { data, pagination } = await client.get(`/repos/${repoFullName}/releases`, {
      page,
      perPage: 100,
    })

    allReleases.push(...data)

    if (!pagination.next || data.length === 0) break
    page = pagination.next

    if (allReleases.length >= 200) break
  }

  return allReleases.map(normalizeRelease)
}

/**
 * Get releases from the local database.
 * @param {Object} filters - Filter options
 * @returns {Promise<Object[]>}
 */
export async function getLocalReleases(filters = {}) {
  let query = `
    SELECT rel.*, r.name as repository_name, r.full_name as repository_full_name
    FROM github_releases rel
    LEFT JOIN github_repositories r ON rel.repository_id = r.id
    WHERE 1=1
  `
  const params = []
  let paramIndex = 1

  if (filters.repositoryId) {
    query += ` AND rel.repository_id = $${paramIndex}`
    params.push(filters.repositoryId)
    paramIndex++
  }

  query += ' ORDER BY rel.published_at_github DESC'

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`
    params.push(filters.limit)
    paramIndex++
  }

  const result = await db.query(query, params)
  return result.rows
}

/**
 * Sync releases for a specific repository.
 * @param {string} repositoryId - Local repository UUID
 * @param {string} repoFullName - Repository full name
 * @returns {Promise<Object>} Sync result
 */
export async function syncReleases(repositoryId, repoFullName) {
  const startedAt = new Date()
  let created = 0
  let updated = 0
  const errors = []

  try {
    const githubReleases = await getReleasesFromGitHub(repoFullName)

    const existingResult = await db.query(
      'SELECT github_id FROM github_releases WHERE repository_id = $1',
      [repositoryId]
    )
    const existingGithubIds = new Set(existingResult.rows.map(r => r.github_id))

    for (const release of githubReleases) {
      try {
        const result = await db.query(
          `INSERT INTO github_releases (
            github_id, tag_name, name, body, draft, prerelease,
            html_url, repository_id, author_login,
            published_at_github, created_at_github, tarball_url, zipball_url,
            last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          ON CONFLICT (github_id) DO UPDATE SET
            tag_name = EXCLUDED.tag_name,
            name = EXCLUDED.name,
            body = EXCLUDED.body,
            draft = EXCLUDED.draft,
            prerelease = EXCLUDED.prerelease,
            html_url = EXCLUDED.html_url,
            author_login = EXCLUDED.author_login,
            published_at_github = EXCLUDED.published_at_github,
            tarball_url = EXCLUDED.tarball_url,
            zipball_url = EXCLUDED.zipball_url,
            last_synced_at = NOW()
          RETURNING (xmax = 0) as inserted`,
          [
            release.githubId, release.tagName, release.name, release.body,
            release.draft, release.prerelease, release.htmlUrl, repositoryId,
            release.authorLogin, release.publishedAtGithub, release.createdAtGithub,
            release.tarballUrl, release.zipballUrl,
          ]
        )

        if (result.rows[0].inserted) {
          created++
        } else {
          updated++
        }

        existingGithubIds.delete(release.githubId)
      } catch (err) {
        errors.push(`Release ${release.tagName}: ${err.message}`)
      }
    }

    safeLog('info', 'Release sync completed', { repoFullName, created, updated })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      releases: { created, updated, unchanged: existingGithubIds.size },
      errors,
    }
  } catch (error) {
    safeLog('error', 'Release sync failed', { repoFullName, error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      releases: { created, updated, unchanged: 0 },
      errors: [...errors, error.message],
    }
  }
}
