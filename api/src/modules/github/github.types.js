export const GITHUB_API_VERSION = '2022-11-28'

/**
 * @typedef {Object} GitHubOrganization
 * @property {string} id
 * @property {string} githubId
 * @property {string} login
 * @property {string} name
 * @property {string} avatarUrl
 * @property {string} description
 * @property {string} htmlUrl
 * @property {number} publicRepos
 * @property {Date} lastSyncedAt
 */

/**
 * @typedef {Object} GitHubRepository
 * @property {string} id
 * @property {string} githubId
 * @property {string} organizationId
 * @property {string} name
 * @property {string} fullName
 * @property {string} description
 * @property {boolean} private
 * @property {boolean} archived
 * @property {string} defaultBranch
 * @property {string} htmlUrl
 * @property {string} language
 * @property {Date} createdAtGithub
 * @property {Date} updatedAtGithub
 * @property {Date} pushedAtGithub
 * @property {Date} lastSyncedAt
 */

/**
 * @typedef {Object} GitHubMember
 * @property {string} id
 * @property {string} githubId
 * @property {string} login
 * @property {string} name
 * @property {string} avatarUrl
 * @property {string} htmlUrl
 * @property {string} role
 * @property {Date} lastSyncedAt
 */

/**
 * @typedef {Object} GitHubIssue
 * @property {string} id
 * @property {string} githubId
 * @property {number} number
 * @property {string} title
 * @property {string} body
 * @property {string} state
 * @property {string} htmlUrl
 * @property {string} repositoryId
 * @property {string} authorLogin
 * @property {string} assigneeLogin
 * @property {string[]} labels
 * @property {Date} createdAtGithub
 * @property {Date} updatedAtGithub
 * @property {Date} closedAtGithub
 */

/**
 * @typedef {Object} GitHubPullRequest
 * @property {string} id
 * @property {string} githubId
 * @property {number} number
 * @property {string} title
 * @property {string} state
 * @property {boolean} merged
 * @property {string} htmlUrl
 * @property {string} repositoryId
 * @property {string} authorLogin
 * @property {Date} createdAtGithub
 * @property {Date} updatedAtGithub
 * @property {Date} mergedAtGithub
 */

/**
 * @typedef {Object} GitHubRelease
 * @property {string} id
 * @property {string} githubId
 * @property {string} tagName
 * @property {string} name
 * @property {string} body
 * @property {boolean} draft
 * @property {boolean} prerelease
 * @property {string} htmlUrl
 * @property {string} authorLogin
 * @property {Date} publishedAtGithub
 * @property {Date} createdAtGithub
 * @property {string} repositoryId
 */

/**
 * @typedef {Object} GitHubWorkflowRun
 * @property {string} id
 * @property {string} githubId
 * @property {string} name
 * @property {number} runNumber
 * @property {string} branch
 * @property {string} status
 * @property {string} conclusion
 * @property {Date} createdAtGithub
 * @property {Date} updatedAtGithub
 * @property {Date} startedAtGithub
 * @property {Date} completedAtGithub
 * @property {string} htmlUrl
 * @property {string} repositoryId
 */

/**
 * @typedef {Object} GitHubSyncResult
 * @property {string} status
 * @property {Date} startedAt
 * @property {Date} completedAt
 * @property {Object} counts
 * @property {string[]} errors
 */

/**
 * @typedef {Object} GitHubConnectionStatus
 * @property {boolean} connected
 * @property {string} provider
 * @property {string} organization
 * @property {string} installationId
 * @property {Date} lastCheckedAt
 */

/**
 * @typedef {Object} GitHubApiError
 * @property {number} status
 * @property {string} message
 * @property {string} documentationUrl
 */
