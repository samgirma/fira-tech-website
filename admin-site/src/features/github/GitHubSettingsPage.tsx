import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { RefreshCw, CheckCircle2, XCircle, Shield, Database, Webhook } from 'lucide-react'

interface GitHubStatus {
  connected: boolean
  provider: string
  organization: string
  organizationName: string
  installationId: string
  avatarUrl: string
  lastCheckedAt: string
  error?: string
}

export default function GitHubSettingsPage() {
  const [status, setStatus] = useState<GitHubStatus | null>(null)
  const [health, setHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [statusData, healthData] = await Promise.allSettled([
        api.getGitHubStatus(),
        api.getGitHubHealth(),
      ])
      if (statusData.status === 'fulfilled') setStatus(statusData.value)
      if (healthData.status === 'fulfilled') setHealth(healthData.value)
    } catch (error) { console.error(error) }
    finally { setIsLoading(false) }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    try {
      const result = await api.syncGitHub()
      setSyncResult(result)
      await loadData()
    } catch (error) { console.error(error) }
    finally { setIsSyncing(false) }
  }

  if (isLoading) return <div className="page-container"><div className="card"><div className="card-content space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-12 skeleton rounded" />)}</div></div></div>

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">GitHub Settings</h1>
          <p className="page-subtitle">Integration status and configuration</p>
        </div>
        <button onClick={handleSync} disabled={isSyncing} className="btn-primary">
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-surface-900">Connection</h2></div>
          <div className="card-content space-y-4">
            <div className="flex items-center gap-3">
              {status?.connected ? <CheckCircle2 size={24} className="text-green-500" /> : <XCircle size={24} className="text-red-500" />}
              <div>
                <p className="font-medium text-surface-900">{status?.connected ? 'GitHub Connected' : 'GitHub Disconnected'}</p>
                <p className="text-sm text-surface-500">{status?.error || 'Integration is active'}</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <InfoRow label="Organization" value={status?.organizationName || '—'} />
              <InfoRow label="Installation ID" value={status?.installationId ? `****${status.installationId.slice(-4)}` : '—'} />
              <InfoRow label="Last checked" value={status?.lastCheckedAt ? new Date(status.lastCheckedAt).toLocaleString() : '—'} />
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-surface-900">Synchronization</h2></div>
          <div className="card-content space-y-4">
            <div className="space-y-3">
              <InfoRow label="Repositories" value={String(health?.repositories || 0)} />
              <InfoRow label="Open Pull Requests" value={String(health?.openPullRequests || 0)} />
              <InfoRow label="Open Issues" value={String(health?.openIssues || 0)} />
              <InfoRow label="CI Success Rate" value={`${health?.ciSuccessRate || 100}%`} />
            </div>
            {syncResult && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Sync completed</p>
                <p className="text-xs text-green-600 mt-1">
                  {syncResult.completedAt && `Completed at ${new Date(syncResult.completedAt).toLocaleTimeString()}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-surface-900">Security</h2></div>
          <div className="card-content space-y-3">
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
              <Shield size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-surface-900">Webhook signature verification</p>
                <p className="text-xs text-surface-500">Enabled — all webhook payloads are verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
              <Database size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-surface-900">Credentials stored server-side only</p>
                <p className="text-xs text-surface-500">GitHub secrets never leave the API server</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
              <Webhook size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-surface-900">Idempotent webhook processing</p>
                <p className="text-xs text-surface-500">Duplicate events are safely ignored</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <div className="card-header"><h2 className="text-lg font-semibold text-surface-900">About</h2></div>
          <div className="card-content">
            <p className="text-sm text-surface-600 leading-relaxed">
              GitHub integration connects your engineering activity to Fira Command.
              Repository data, pull requests, issues, releases, and CI/CD workflows
              are synchronized and displayed in the engineering section.
            </p>
            <p className="text-sm text-surface-600 mt-3">
              Webhooks provide real-time updates, while periodic synchronization
              ensures data consistency. All GitHub credentials are stored securely
              on the server and never exposed to the browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-surface-500">{label}</span>
      <span className="text-sm font-medium text-surface-900">{value}</span>
    </div>
  )
}
