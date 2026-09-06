import { createGitHubClient, normalizeGitHubError } from './github.client.js'
import { normalizeMember } from './github.utils.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'

/**
 * Fetch all members from the GitHub organization.
 * Falls back to repo contributors if members endpoint is restricted.
 * @returns {Promise<Object[]>} Normalized members
 */
export async function getMembersFromGitHub() {
  const client = createGitHubClient()
  const orgName = process.env.GITHUB_ORG_NAME
  const allMembers = []
  let page = 1

  // Try the org members endpoint first
  while (true) {
    const { data, pagination } = await client.get(`/orgs/${orgName}/members`, {
      page,
      perPage: 100,
    })

    allMembers.push(...data)

    if (!pagination.next || data.length === 0) break
    page = pagination.next
  }

  // If members endpoint returned results, use them
  if (allMembers.length > 0) {
    const detailedMembers = []
    for (const member of allMembers) {
      try {
        const { data: detailed } = await client.get(`/users/${member.login}`)
        detailedMembers.push(normalizeMember({ ...detailed, role: member.role }))
      } catch (err) {
        detailedMembers.push(normalizeMember(member))
      }
    }
    return detailedMembers
  }

  // Fallback: get unique contributors from all repos
  safeLog('info', 'Members endpoint empty, falling back to repo contributors')
  const { data: repos } = await client.get(`/orgs/${orgName}/repos`, { perPage: 100 })

  const contributorsMap = new Map()

  for (const repo of repos) {
    try {
      const { data: contributors } = await client.get(`/repos/${orgName}/${repo.name}/contributors`, { perPage: 100 })
      for (const c of contributors) {
        if (!contributorsMap.has(c.login)) {
          contributorsMap.set(c.login, {
            login: c.login,
            avatar_url: c.avatar_url,
            contributions: c.contributions,
          })
        } else {
          contributorsMap.get(c.login).contributions += c.contributions
        }
      }
    } catch (err) {
      // Skip repos we can't access
    }
  }

  // Fetch full profile for each contributor
  const detailedMembers = []
  for (const [login, contrib] of contributorsMap) {
    try {
      const { data: user } = await client.get(`/users/${login}`)
      detailedMembers.push(normalizeMember({
        id: user.id,
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        bio: user.bio,
        company: user.company,
        location: user.location,
        email: user.email,
        followers: user.followers,
        public_repos: user.public_repos,
        created_at: user.created_at,
        role: 'MEMBER',
      }))
    } catch (err) {
      detailedMembers.push(normalizeMember({
        id: 0,
        login: contrib.login,
        avatar_url: contrib.avatar_url,
        role: 'MEMBER',
      }))
    }
  }

  return detailedMembers
}

/**
 * Get members from the local database.
 * @returns {Promise<Object[]>}
 */
export async function getLocalMembers() {
  const result = await db.query(
    'SELECT * FROM github_members ORDER BY login ASC'
  )
  return result.rows
}

/**
 * Get a single member by ID from the local database.
 * @param {string} id - Member UUID
 * @returns {Promise<Object|null>}
 */
export async function getLocalMember(id) {
  const result = await db.query('SELECT * FROM github_members WHERE id = $1', [id])
  return result.rows[0] || null
}

/**
 * Sync all organization members from GitHub to the local database.
 * @returns {Promise<Object>} Sync result
 */
export async function syncMembers() {
  const startedAt = new Date()
  let created = 0
  let updated = 0
  let unchanged = 0
  const errors = []

  try {
    const githubMembers = await getMembersFromGitHub()

    const existingResult = await db.query('SELECT github_id FROM github_members')
    const existingGithubIds = new Set(existingResult.rows.map(m => m.github_id))

    for (const member of githubMembers) {
      try {
        const result = await db.query(
          `INSERT INTO github_members (
            github_id, login, name, avatar_url, html_url, role,
            bio, company, location, email, followers, public_repos,
            created_at_github, last_synced_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          ON CONFLICT (github_id) DO UPDATE SET
            login = EXCLUDED.login,
            name = EXCLUDED.name,
            avatar_url = EXCLUDED.avatar_url,
            html_url = EXCLUDED.html_url,
            role = EXCLUDED.role,
            bio = EXCLUDED.bio,
            company = EXCLUDED.company,
            location = EXCLUDED.location,
            email = EXCLUDED.email,
            followers = EXCLUDED.followers,
            public_repos = EXCLUDED.public_repos,
            last_synced_at = NOW()
          RETURNING (xmax = 0) as inserted`,
          [
            member.githubId, member.login, member.name, member.avatarUrl,
            member.htmlUrl, member.role, member.bio, member.company,
            member.location, member.email, member.followers, member.publicRepos,
            member.createdAtGithub,
          ]
        )

        if (result.rows[0].inserted) {
          created++
        } else {
          updated++
        }

        existingGithubIds.delete(member.githubId)
      } catch (err) {
        errors.push(`Member ${member.login}: ${err.message}`)
      }
    }

    unchanged = existingGithubIds.size
    safeLog('info', 'Member sync completed', { created, updated, unchanged })

    return {
      status: 'completed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      members: { created, updated, unchanged },
      errors,
    }
  } catch (error) {
    safeLog('error', 'Member sync failed', { error: error.message })
    return {
      status: 'failed',
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      members: { created, updated, unchanged },
      errors: [...errors, error.message],
    }
  }
}
