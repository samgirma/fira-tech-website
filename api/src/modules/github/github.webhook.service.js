import crypto from 'node:crypto'
import { githubConfig } from './github.config.js'
import { db } from '../../config/database.js'
import { safeLog } from './github.utils.js'
import { syncRepositories } from './github.repository.service.js'
import { syncMembers } from './github.member.service.js'

/**
 * Verify GitHub webhook signature.
 * @param {string|Buffer} payload - Raw request body
 * @param {string} signature - X-Hub-Signature-256 header value
 * @returns {boolean} Whether signature is valid
 */
export function verifyWebhookSignature(payload, signature) {
  if (!signature || !githubConfig.webhookSecret) return false

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', githubConfig.webhookSecret)
    .update(typeof payload === 'string' ? payload : payload.toString())
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Check if a webhook delivery has already been processed (idempotency).
 * @param {string} deliveryId - GitHub delivery ID
 * @returns {Promise<boolean>}
 */
export async function isDuplicateDelivery(deliveryId) {
  const result = await db.query(
    'SELECT id FROM github_events WHERE delivery_id = $1',
    [deliveryId]
  )
  return result.rows.length > 0
}

/**
 * Record a webhook event for idempotency and audit.
 * @param {Object} params - Event params
 * @returns {Promise<Object>} Recorded event
 */
export async function recordEvent({ deliveryId, eventType, action, status, error }) {
  const eventStatus = status || 'received'
  const isProcessed = eventStatus === 'processed'

  const result = await db.query(
    `INSERT INTO github_events (delivery_id, event_type, action, status, error, received_at, processed_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), CASE WHEN $6 THEN NOW() ELSE NULL END)
     ON CONFLICT (delivery_id) DO UPDATE SET
       status = EXCLUDED.status,
       error = EXCLUDED.error,
       processed_at = CASE WHEN $6 THEN NOW() ELSE github_events.processed_at END
     RETURNING *`,
    [deliveryId, eventType, action, eventStatus, error || null, isProcessed]
  )
  return result.rows[0]
}

/**
 * Process a webhook event.
 * @param {Object} params - Processing params
 * @param {string} params.deliveryId - GitHub delivery ID
 * @param {string} params.eventType - Event type (e.g., 'push', 'pull_request')
 * @param {Object} params.payload - Parsed webhook payload
 * @returns {Promise<Object>} Processing result
 */
export async function processWebhookEvent({ deliveryId, eventType, payload }) {
  const action = payload.action

  try {
    // Record the event
    await recordEvent({
      deliveryId,
      eventType,
      action,
      status: 'processing',
    })

    // Process based on event type
    switch (eventType) {
      case 'push':
        await handlePushEvent(payload)
        break
      case 'pull_request':
        await handlePullRequestEvent(payload)
        break
      case 'issues':
        await handleIssueEvent(payload)
        break
      case 'release':
        await handleReleaseEvent(payload)
        break
      case 'workflow_run':
        await handleWorkflowRunEvent(payload)
        break
      case 'member':
        await handleMemberEvent(payload)
        break
      case 'ping':
        safeLog('info', 'Webhook ping received')
        break
      default:
        safeLog('info', `Unhandled webhook event: ${eventType}`)
    }

    // Mark as processed
    await recordEvent({
      deliveryId,
      eventType,
      action,
      status: 'processed',
    })

    return { success: true }
  } catch (error) {
    safeLog('error', `Webhook processing failed: ${eventType}`, { error: error.message })

    await recordEvent({
      deliveryId,
      eventType,
      action,
      status: 'failed',
      error: error.message,
    })

    return { success: false, error: error.message }
  }
}

/**
 * Handle push events.
 */
async function handlePushEvent(payload) {
  const repoFullName = payload.repository?.full_name
  if (!repoFullName) return

  safeLog('info', `Push to ${repoFullName}`, {
    branch: payload.ref?.replace('refs/heads/', ''),
    commits: payload.commits?.length || 0,
  })

  // Update repository's pushed_at timestamp
  await db.query(
    `UPDATE github_repositories
     SET pushed_at_github = NOW(), last_synced_at = NOW()
     WHERE full_name = $1`,
    [repoFullName]
  )
}

/**
 * Handle pull request events.
 */
async function handlePullRequestEvent(payload) {
  const pr = payload.pull_request
  if (!pr) return

  const repoFullName = payload.repository?.full_name
  const repoResult = await db.query(
    'SELECT id FROM github_repositories WHERE full_name = $1',
    [repoFullName]
  )

  if (repoResult.rows.length === 0) return
  const repositoryId = repoResult.rows[0].id

  await db.query(
    `INSERT INTO github_pull_requests (
      github_id, number, title, body, state, merged, merged_at,
      html_url, repository_id, author_login, head_branch, base_branch,
      additions, deletions, changed_files, mergeable, review_comments,
      created_at_github, updated_at_github, closed_at_github, last_synced_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
    ON CONFLICT (github_id) DO UPDATE SET
      state = EXCLUDED.state,
      merged = EXCLUDED.merged,
      merged_at = EXCLUDED.merged_at,
      updated_at_github = EXCLUDED.updated_at_github,
      closed_at_github = EXCLUDED.closed_at_github,
      last_synced_at = NOW()`,
    [
      String(pr.id), pr.number, pr.title, pr.body, pr.state, pr.merged, pr.merged_at,
      pr.html_url, repositoryId, pr.user?.login, pr.head?.ref, pr.base?.ref,
      pr.additions, pr.deletions, pr.changed_files, pr.mergeable, pr.review_comments,
      pr.created_at, pr.updated_at, pr.closed_at,
    ]
  )
}

/**
 * Handle issue events.
 */
async function handleIssueEvent(payload) {
  const issue = payload.issue
  if (!issue) return

  const repoFullName = payload.repository?.full_name
  const repoResult = await db.query(
    'SELECT id FROM github_repositories WHERE full_name = $1',
    [repoFullName]
  )

  if (repoResult.rows.length === 0) return
  const repositoryId = repoResult.rows[0].id

  await db.query(
    `INSERT INTO github_issues (
      github_id, number, title, body, state, state_reason,
      html_url, repository_id, author_login, assignee_login,
      labels, milestone, comments_count, locked,
      created_at_github, updated_at_github, closed_at_github, last_synced_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
    ON CONFLICT (github_id) DO UPDATE SET
      state = EXCLUDED.state,
      state_reason = EXCLUDED.state_reason,
      assignee_login = EXCLUDED.assignee_login,
      labels = EXCLUDED.labels,
      comments_count = EXCLUDED.comments_count,
      updated_at_github = EXCLUDED.updated_at_github,
      closed_at_github = EXCLUDED.closed_at_github,
      last_synced_at = NOW()`,
    [
      String(issue.id), issue.number, issue.title, issue.body, issue.state,
      issue.state_reason, issue.html_url, repositoryId, issue.user?.login,
      issue.assignee?.login, (issue.labels || []).map(l => l.name),
      issue.milestone?.title, issue.comments, issue.locked,
      issue.created_at, issue.updated_at, issue.closed_at,
    ]
  )
}

/**
 * Handle release events.
 */
async function handleReleaseEvent(payload) {
  const release = payload.release
  if (!release) return

  const repoFullName = payload.repository?.full_name
  const repoResult = await db.query(
    'SELECT id FROM github_repositories WHERE full_name = $1',
    [repoFullName]
  )

  if (repoResult.rows.length === 0) return
  const repositoryId = repoResult.rows[0].id

  await db.query(
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
      published_at_github = EXCLUDED.published_at_github,
      last_synced_at = NOW()`,
    [
      String(release.id), release.tag_name, release.name, release.body,
      release.draft, release.prerelease, release.html_url, repositoryId,
      release.author?.login, release.published_at, release.created_at,
      release.tarball_url, release.zipball_url,
    ]
  )
}

/**
 * Handle workflow_run events.
 */
async function handleWorkflowRunEvent(payload) {
  const run = payload.workflow_run
  if (!run) return

  const repoFullName = payload.repository?.full_name
  const repoResult = await db.query(
    'SELECT id FROM github_repositories WHERE full_name = $1',
    [repoFullName]
  )

  if (repoResult.rows.length === 0) return
  const repositoryId = repoResult.rows[0].id

  await db.query(
    `INSERT INTO github_workflow_runs (
      github_id, name, run_number, branch, status, conclusion, event,
      html_url, repository_id, run_attempt,
      created_at_github, updated_at_github, started_at_github, completed_at_github,
      last_synced_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    ON CONFLICT (github_id) DO UPDATE SET
      status = EXCLUDED.status,
      conclusion = EXCLUDED.conclusion,
      updated_at_github = EXCLUDED.updated_at_github,
      started_at_github = EXCLUDED.started_at_github,
      completed_at_github = EXCLUDED.completed_at_github,
      last_synced_at = NOW()`,
    [
      String(run.id), run.name, run.run_number, run.head_branch,
      run.status, run.conclusion, run.event, run.html_url,
      repositoryId, run.run_attempt, run.created_at, run.updated_at,
      run.run_started_at, run.updated_at,
    ]
  )
}

/**
 * Handle member events (added/removed).
 */
async function handleMemberEvent(payload) {
  const action = payload.action
  const member = payload.member

  if (action === 'added') {
    safeLog('info', `Member added: ${member?.login}`)
    // Sync will pick them up on next full sync
  } else if (action === 'removed') {
    safeLog('info', `Member removed: ${member?.login}`)
  }
}
