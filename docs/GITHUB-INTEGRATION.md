# GitHub Integration — Fira Command

## Architecture

```
GitHub Organization
       │
       ▼
   GitHub App
       │
       ▼
api.firatech.systems
       │
  ┌────┴────┐
  │         │
  ▼         ▼
PostgreSQL  GitHub API
  │
  ▼
admin.firatech.systems
```

## Environment Variables

Add these to `/api/.env`:

```bash
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_INSTALLATION_ID=789012
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_ORG_NAME=your-org-name
GITHUB_API_VERSION=2022-11-28
```

### Where to find each value

| Variable | Location |
|----------|----------|
| `GITHUB_APP_ID` | GitHub App Settings → General → About → App ID |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App Settings → General → Private keys → Generate |
| `GITHUB_INSTALLATION_ID` | URL when viewing the App installation: `https://github.com/settings/installations/{id}` |
| `GITHUB_WEBHOOK_SECRET` | GitHub App Settings → Webhooks → Add webhook → Secret |
| `GITHUB_ORG_NAME` | Your GitHub organization login name |

## GitHub App Permissions Required

### Repository permissions
- **Contents**: Read (for repository metadata)
- **Issues**: Read (for issue sync)
- **Pull requests**: Read (for PR sync)
- **Actions**: Read (for workflow runs)
- **Releases**: Read (for release sync)
- **Members**: Read (for org members)
- **Metadata**: Read (required for all GitHub App operations)

### Organization permissions
- **Members**: Read
- **Repository administration**: Read

### Events
- Push
- Issues
- Issue comment
- Pull request
- Pull request review
- Release
- Workflow run
- Member

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/integrations/github/status` | Connection status (no auth) |
| `POST` | `/api/v1/integrations/github/webhook` | Webhook receiver (signature verified) |

### Admin (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/integrations/github/organization` | Get org info from GitHub |
| `GET` | `/api/v1/integrations/github/repositories` | List repos (with filters) |
| `GET` | `/api/v1/integrations/github/repositories/:id` | Repo detail + issues/PRs/releases |
| `GET` | `/api/v1/integrations/github/members` | List org members |
| `GET` | `/api/v1/integrations/github/issues` | List issues (with filters) |
| `GET` | `/api/v1/integrations/github/pull-requests` | List PRs (with filters) |
| `GET` | `/api/v1/integrations/github/releases` | List releases |
| `GET` | `/api/v1/integrations/github/workflows` | List workflow runs |
| `GET` | `/api/v1/integrations/github/health` | Engineering health metrics |
| `GET` | `/api/v1/integrations/github/activity` | Recent activity timeline |
| `POST` | `/api/v1/integrations/github/sync` | Trigger full sync |
| `GET` | `/api/v1/integrations/github/projects/:id/repositories` | Get linked repos for project |
| `POST` | `/api/v1/integrations/github/projects/:id/repositories` | Link repo to project |
| `DELETE` | `/api/v1/integrations/github/projects/:pid/repositories/:rid` | Unlink repo |
| `PUT` | `/api/v1/integrations/github/projects/:pid/repositories/:rid/primary` | Set primary repo |
| `GET` | `/api/v1/integrations/github/tasks/:id/issues` | Get linked issues for task |
| `POST` | `/api/v1/integrations/github/tasks/:id/issues` | Link issue to task |
| `DELETE` | `/api/v1/integrations/github/tasks/:tid/issues/:iid` | Unlink issue |

## Database Tables

- `github_organizations` — Connected GitHub org
- `github_repositories` — Synced repositories
- `github_members` — Synced org members
- `github_issues` — Synced issues
- `github_pull_requests` — Synced pull requests
- `github_releases` — Synced releases
- `github_workflow_runs` — Synced CI/CD runs
- `github_events` — Webhook event log (idempotency)
- `project_github_repositories` — Project ↔ Repo linking
- `task_github_issues` — Task ↔ Issue linking

## Synchronization Strategy

1. **Manual sync**: `POST /api/v1/integrations/github/sync`
2. **Webhooks**: Real-time updates from GitHub
3. **Database as read model**: Admin UI reads from local DB, not GitHub directly

## Security

- All GitHub credentials exist ONLY in `/api`
- Never exposed to browser code
- Webhook signature verification required
- Token caching with automatic refresh
- Safe logging (no secrets logged)
- Idempotent webhook processing

## Local Development

For webhook testing, use an HTTPS tunnel:

```bash
# Using ngrok or similar
ngrok http 3000

# Then set the webhook URL in GitHub App settings:
# https://your-tunnel.ngrok.io/api/v1/integrations/github/webhook
```

## Running Migrations

```bash
cd api
npm run db:migrate:github
```
