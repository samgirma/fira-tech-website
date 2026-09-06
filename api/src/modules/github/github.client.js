import { githubConfig } from './github.config.js'
import { getInstallationToken, clearCachedToken, GitHubAuthError } from './github.auth.js'
import { GITHUB_API_VERSION } from './github.types.js'

const GITHUB_BASE_URL = 'https://api.github.com'

/**
 * Create an authenticated GitHub API client.
 * Returns a function that makes authenticated requests to the GitHub API.
 */
export function createGitHubClient() {
  return {
    /**
     * Make an authenticated GET request to the GitHub API.
     * @param {string} endpoint - API endpoint (e.g., '/orgs/{org}')
     * @param {Object} options - Additional options
     * @returns {Promise<{data: any, headers: Object}>}
     */
    async get(endpoint, options = {}) {
      const token = await getInstallationToken()
      const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_BASE_URL}${endpoint}`

      const params = new URLSearchParams()
      if (options.page) params.set('page', String(options.page))
      if (options.perPage) params.set('per_page', String(options.perPage))
      if (options.sort) params.set('sort', options.sort)
      if (options.direction) params.set('direction', options.direction)
      if (options.state) params.set('state', options.state)
      if (options.accept) params.set('accept', options.accept)

      const queryString = params.toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
          'User-Agent': 'Fira-Command-App',
        },
      })

      if (response.status === 401) {
        clearCachedToken()
        throw new GitHubAuthError(401, 'GitHub authentication failed', 'unauthorized')
      }

      if (response.status === 403) {
        const error = await response.json().catch(() => ({}))
        if (error.message?.includes('rate limit')) {
          throw new GitHubAuthError(403, 'GitHub rate limit exceeded', 'rate_limited')
        }
        throw new GitHubAuthError(403, 'GitHub permission denied', 'forbidden')
      }

      if (response.status === 422) {
        const error = await response.json().catch(() => ({}))
        throw new GitHubAuthError(422, error.message || 'GitHub validation error', 'validation_error')
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new GitHubAuthError(response.status, error.message || `GitHub API error: ${response.status}`, 'api_error')
      }

      // Parse Link header for pagination
      const linkHeader = response.headers.get('link')
      const pagination = parseLinkHeader(linkHeader)

      const data = await response.json()
      return { data, headers: Object.fromEntries(response.headers.entries()), pagination }
    },

    /**
     * Make an authenticated request to the GitHub GraphQL API.
     * @param {string} query - GraphQL query
     * @param {Object} variables - Query variables
     * @returns {Promise<any>}
     */
    async graphql(query, variables = {}) {
      const token = await getInstallationToken()

      const response = await fetch(`${GITHUB_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
          'User-Agent': 'Fira-Command-App',
        },
        body: JSON.stringify({ query, variables }),
      })

      if (response.status === 401) {
        clearCachedToken()
        throw new GitHubAuthError(401, 'GitHub authentication failed', 'unauthorized')
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new GitHubAuthError(response.status, error.message || 'GraphQL error', 'graphql_error')
      }

      return response.json()
    },
  }
}

/**
 * Parse GitHub Link header for pagination.
 * @param {string|null} linkHeader
 * @returns {Object} Pagination info with next/prev page numbers
 */
function parseLinkHeader(linkHeader) {
  if (!linkHeader) return {}

  const links = {}
  const parts = linkHeader.split(',')

  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="(\w+)"/)
    if (match) {
      const url = new URL(match[1])
      const rel = match[2]
      links[rel] = parseInt(url.searchParams.get('page') || '1', 10)
    }
  }

  return links
}

/**
 * Normalize GitHub API errors for client consumption.
 * Does not expose internal details.
 * @param {Error} error
 * @returns {Object} Normalized error
 */
export function normalizeGitHubError(error) {
  if (error instanceof GitHubAuthError) {
    switch (error.code) {
      case 'unauthorized':
        return {
          status: 401,
          message: 'GitHub connection could not be authenticated. Check the GitHub App configuration.',
        }
      case 'forbidden':
        return {
          status: 403,
          message: 'GitHub permissions do not allow this action.',
        }
      case 'rate_limited':
        return {
          status: 429,
          message: 'GitHub is temporarily rate limited. Data shown may be delayed.',
        }
      case 'installation_not_found':
        return {
          status: 404,
          message: 'GitHub App installation not found. Verify the installation ID.',
        }
      default:
        return {
          status: error.status || 500,
          message: 'GitHub is currently unavailable.',
        }
    }
  }

  return {
    status: 500,
    message: 'GitHub is currently unavailable.',
  }
}
