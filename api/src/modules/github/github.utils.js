/**
 * Normalize a GitHub organization response to a clean DTO.
 * @param {Object} githubOrg - Raw GitHub API organization object
 * @returns {Object} Normalized organization
 */
export function normalizeOrganization(githubOrg) {
  return {
    githubId: String(githubOrg.id),
    login: githubOrg.login,
    name: githubOrg.name || githubOrg.login,
    avatarUrl: githubOrg.avatar_url,
    description: githubOrg.description,
    htmlUrl: githubOrg.html_url,
    publicRepos: githubOrg.public_repos,
    followers: githubOrg.followers,
    blog: githubOrg.blog,
    email: githubOrg.email,
    location: githubOrg.location,
    createdAtGithub: githubOrg.created_at,
  }
}

/**
 * Normalize a GitHub repository response to a clean DTO.
 * @param {Object} repo - Raw GitHub API repository object
 * @returns {Object} Normalized repository
 */
export function normalizeRepository(repo) {
  return {
    githubId: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    archived: repo.archived,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url,
    cloneUrl: repo.clone_url,
    language: repo.language,
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
    createdAtGithub: repo.created_at,
    updatedAtGithub: repo.updated_at,
    pushedAtGithub: repo.pushed_at,
  }
}

/**
 * Normalize a GitHub member response to a clean DTO.
 * @param {Object} member - Raw GitHub API membership object
 * @returns {Object} Normalized member
 */
export function normalizeMember(member) {
  return {
    githubId: String(member.id || member.githubId || '0'),
    login: member.login,
    name: member.name,
    avatarUrl: member.avatar_url,
    htmlUrl: member.html_url,
    role: member.role || 'MEMBER',
    bio: member.bio,
    company: member.company,
    location: member.location,
    email: member.email,
    followers: member.followers,
    publicRepos: member.public_repos,
    createdAtGithub: member.created_at,
  }
}

/**
 * Normalize a GitHub issue response to a clean DTO.
 * @param {Object} issue - Raw GitHub API issue object
 * @returns {Object} Normalized issue
 */
export function normalizeIssue(issue) {
  return {
    githubId: String(issue.id),
    number: issue.number,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    stateReason: issue.state_reason,
    htmlUrl: issue.html_url,
    authorLogin: issue.user?.login,
    assigneeLogin: issue.assignee?.login,
    labels: (issue.labels || []).map(l => l.name),
    milestone: issue.milestone?.title,
    comments: issue.comments,
    locked: issue.locked,
    createdAtGithub: issue.created_at,
    updatedAtGithub: issue.updated_at,
    closedAtGithub: issue.closed_at,
  }
}

/**
 * Normalize a GitHub pull request response to a clean DTO.
 * @param {Object} pr - Raw GitHub API pull request object
 * @returns {Object} Normalized pull request
 */
export function normalizePullRequest(pr) {
  return {
    githubId: String(pr.id),
    number: pr.number,
    title: pr.title,
    body: pr.body,
    state: pr.state,
    merged: pr.merged,
    mergedAt: pr.merged_at,
    htmlUrl: pr.html_url,
    authorLogin: pr.user?.login,
    headBranch: pr.head?.ref,
    baseBranch: pr.base?.ref,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    mergeable: pr.mergeable,
    reviewComments: pr.review_comments,
    createdAtGithub: pr.created_at,
    updatedAtGithub: pr.updated_at,
    closedAtGithub: pr.closed_at,
  }
}

/**
 * Normalize a GitHub release response to a clean DTO.
 * @param {Object} release - Raw GitHub API release object
 * @returns {Object} Normalized release
 */
export function normalizeRelease(release) {
  return {
    githubId: String(release.id),
    tagName: release.tag_name,
    name: release.name,
    body: release.body,
    draft: release.draft,
    prerelease: release.prerelease,
    htmlUrl: release.html_url,
    authorLogin: release.author?.login,
    publishedAtGithub: release.published_at,
    createdAtGithub: release.created_at,
    tarballUrl: release.tarball_url,
    zipballUrl: release.zipball_url,
  }
}

/**
 * Normalize a GitHub workflow run response to a clean DTO.
 * @param {Object} run - Raw GitHub API workflow run object
 * @returns {Object} Normalized workflow run
 */
export function normalizeWorkflowRun(run) {
  return {
    githubId: String(run.id),
    name: run.name,
    runNumber: run.run_number,
    branch: run.head_branch,
    status: run.status,
    conclusion: run.conclusion,
    event: run.event,
    htmlUrl: run.html_url,
    runAttempt: run.run_attempt,
    createdAtGithub: run.created_at,
    updatedAtGithub: run.updated_at,
    startedAtGithub: run.run_started_at,
    completedAtGithub: run.updated_at,
  }
}

/**
 * Safe logger that redacts sensitive information.
 * Never logs: private keys, tokens, JWTs, webhook secrets.
 * @param {string} level - Log level
 * @param {string} message - Message
 * @param {Object} context - Additional context
 */
export function safeLog(level, message, context = {}) {
  const sanitized = { ...context }
  // Remove any sensitive fields
  delete sanitized.privateKey
  delete sanitized.token
  delete sanitized.installationToken
  delete sanitized.webhookSecret
  delete sanitized.password
  delete sanitized.secret

  if (process.env.NODE_ENV !== 'production') {
    console[level](`[GitHub] ${message}`, Object.keys(sanitized).length ? sanitized : '')
  }
}
