import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import {
  GitBranch,
  GitPullRequest,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Workflow,
  Tag,
  Users,
  Activity,
} from 'lucide-react'

interface GitHubHealth {
  repositories: number
  openPullRequests: number
  openIssues: number
  workflowRuns: {
    successful: number
    failed: number
    running: number
    cancelled: number
  }
  ciSuccessRate: number
  recentReleases: Array<{
    repository_name: string
    tag_name: string
    release_name: string
    published_at_github: string
    html_url: string
  }>
}

interface GitHubStatus {
  connected: boolean
  organization: string
  organizationName: string
  lastCheckedAt: string
  error?: string
}

interface Activity {
  type: string
  title: string
  number: number | string
  state: string
  merged?: boolean
  author_login: string
  html_url: string
  timestamp: string
  repository_name: string
}

export default function GitHubOverviewPage() {
  const [health, setHealth] = useState<GitHubHealth | null>(null)
  const [status, setStatus] = useState<GitHubStatus | null>(null)
  const [activity, setActivity] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [healthData, statusData, activityData] = await Promise.allSettled([
        api.getGitHubHealth(),
        api.getGitHubStatus(),
        api.getGitHubActivity(15),
      ])

      if (healthData.status === 'fulfilled') setHealth(healthData.value)
      if (statusData.status === 'fulfilled') setStatus(statusData.value)
      if (activityData.status === 'fulfilled') setActivity(activityData.value)
    } catch (error) {
      console.error('Failed to load GitHub data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await api.syncGitHub()
      await loadData()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) return <GitHubOverviewSkeleton />

  const totalWorkflows = health
    ? health.workflowRuns.successful + health.workflowRuns.failed + health.workflowRuns.running + health.workflowRuns.cancelled
    : 0

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">GitHub Engineering</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              status?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              {status?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="page-subtitle">{status?.organizationName || 'Fira Tech Solutions'}</p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="btn-primary"
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Synchronizing...' : 'Sync Now'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Repositories"
          value={health?.repositories || 0}
          icon={GitBranch}
          color="blue"
          href="/github/repositories"
        />
        <StatCard
          label="Open PRs"
          value={health?.openPullRequests || 0}
          icon={GitPullRequest}
          color="purple"
          href="/github/pull-requests"
        />
        <StatCard
          label="Open Issues"
          value={health?.openIssues || 0}
          icon={AlertCircle}
          color="orange"
          href="/github/issues"
        />
        <StatCard
          label="CI/CD Health"
          value={`${health?.ciSuccessRate || 100}%`}
          icon={Workflow}
          color={health && health.ciSuccessRate < 90 ? 'red' : 'green'}
          href="/github/workflows"
        />
        <StatCard
          label="Team Members"
          value={health?.workflowRuns ? (health.workflowRuns.successful + health.workflowRuns.failed) : 0}
          icon={Users}
          color="teal"
          href="/github/members"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Recent Activity</h2>
              <Link to="/github/activity" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-content">
              {activity.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activity.slice(0, 8).map((item, i) => (
                    <ActivityItem key={i} activity={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workflow Health */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Workflow Health</h2>
              <Link to="/github/workflows" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-content">
              {totalWorkflows === 0 ? (
                <p className="text-sm text-surface-500 text-center py-8">No workflow runs in the last 30 days</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  <WorkflowStat label="Successful" count={health?.workflowRuns.successful || 0} color="green" total={totalWorkflows} />
                  <WorkflowStat label="Failed" count={health?.workflowRuns.failed || 0} color="red" total={totalWorkflows} />
                  <WorkflowStat label="Running" count={health?.workflowRuns.running || 0} color="blue" total={totalWorkflows} />
                  <WorkflowStat label="Cancelled" count={health?.workflowRuns.cancelled || 0} color="gray" total={totalWorkflows} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Releases */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Recent Releases</h2>
              <Link to="/github/releases" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-content">
              {!health?.recentReleases?.length ? (
                <p className="text-sm text-surface-500 text-center py-8">No releases</p>
              ) : (
                <div className="space-y-3">
                  {health.recentReleases.map((release, i) => (
                    <a
                      key={i}
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-green-50">
                        <Tag size={14} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{release.release_name || release.tag_name}</p>
                        <p className="text-xs text-surface-500">{release.repository_name} · {release.tag_name}</p>
                      </div>
                      <ExternalLink size={14} className="text-surface-400 mt-0.5 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-surface-900">Quick Links</h2>
            </div>
            <div className="card-content space-y-2">
              <Link to="/github/repositories" className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <GitBranch size={16} className="text-surface-400" />
                <span className="text-sm text-surface-700">Repositories</span>
              </Link>
              <Link to="/github/issues" className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <AlertCircle size={16} className="text-surface-400" />
                <span className="text-sm text-surface-700">Issues</span>
              </Link>
              <Link to="/github/pull-requests" className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <GitPullRequest size={16} className="text-surface-400" />
                <span className="text-sm text-surface-700">Pull Requests</span>
              </Link>
              <Link to="/github/members" className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <Users size={16} className="text-surface-400" />
                <span className="text-sm text-surface-700">Team Members</span>
              </Link>
              <Link to="/github/activity" className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors">
                <Activity size={16} className="text-surface-400" />
                <span className="text-sm text-surface-700">Activity Timeline</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string
  value: number | string
  icon: React.ComponentType<any>
  color: string
  href: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
  }

  return (
    <Link to={href} className="stat-card group">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <ArrowRight size={14} className="text-surface-300 group-hover:text-surface-500 transition-colors" />
      </div>
      <p className="text-2xl font-semibold text-surface-900">{value}</p>
      <p className="text-sm text-surface-500 mt-1">{label}</p>
    </Link>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  const iconMap: Record<string, React.ComponentType<any>> = {
    pull_request: GitPullRequest,
    issue: AlertCircle,
    release: Tag,
    workflow: Workflow,
  }
  const Icon = iconMap[activity.type] || Activity

  const stateColors: Record<string, string> = {
    open: 'text-green-600',
    closed: 'text-surface-500',
    merged: 'text-purple-600',
    published: 'text-green-600',
    success: 'text-green-600',
    failure: 'text-red-600',
  }

  return (
    <a
      href={activity.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors"
    >
      <div className="p-1.5 rounded-lg bg-surface-100 mt-0.5">
        <Icon size={14} className={stateColors[activity.state] || 'text-surface-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-700">
          <span className="font-medium">{activity.type === 'pull_request' ? 'PR' : activity.type === 'issue' ? 'Issue' : activity.type === 'release' ? 'Release' : 'Run'} #{activity.number}</span>
          {' '}
          <span className="truncate">{activity.title}</span>
        </p>
        <p className="text-xs text-surface-400 mt-0.5">
          {activity.repository_name} · {activity.author_login} · {getRelativeTime(activity.timestamp)}
        </p>
      </div>
    </a>
  )
}

function WorkflowStat({ label, count, color, total }: {
  label: string
  count: number
  color: string
  total: number
}) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-surface-500',
  }
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="text-center">
      <p className={`text-2xl font-semibold ${colorClasses[color]}`}>{count}</p>
      <p className="text-xs text-surface-500 mt-1">{label}</p>
      <p className="text-xs text-surface-400">{pct}%</p>
    </div>
  )
}

function GitHubOverviewSkeleton() {
  return (
    <div className="page-container">
      <div className="mb-6">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="h-4 w-32 skeleton rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="stat-card">
            <div className="h-10 w-10 skeleton rounded-lg mb-3" />
            <div className="h-8 w-16 skeleton rounded mb-2" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-content space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 skeleton rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 skeleton rounded mb-1" />
                  <div className="h-3 w-32 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-content space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 skeleton rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-32 skeleton rounded mb-1" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
