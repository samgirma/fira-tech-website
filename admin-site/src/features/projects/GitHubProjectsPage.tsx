import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime, cn } from '../../lib/utils'
import {
  GitBranch,
  GitPullRequest,
  AlertCircle,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  Lock,
  Globe,
  Star,
  GitFork,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'

export default function GitHubProjectsPage() {
  const [activeTab, setActiveTab] = useState<'repos' | 'prs' | 'issues' | 'workflows'>('repos')
  const [status, setStatus] = useState<any>(null)
  const [repos, setRepos] = useState<any[]>([])
  const [prs, setPrs] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadGitHubData()
  }, [])

  const loadGitHubData = async () => {
    try {
      setIsLoading(true)
      const [statusRes, reposRes, prsRes, issuesRes, workflowsRes] = await Promise.allSettled([
        api.getGitHubStatus(),
        api.getGitHubRepositories(),
        api.getGitHubPullRequests(),
        api.getGitHubIssues(),
        api.getGitHubWorkflows(),
      ])

      if (statusRes.status === 'fulfilled') setStatus(statusRes.value)
      if (reposRes.status === 'fulfilled') setRepos(reposRes.value || [])
      if (prsRes.status === 'fulfilled') setPrs(prsRes.value || [])
      if (issuesRes.status === 'fulfilled') setIssues(issuesRes.value || [])
      if (workflowsRes.status === 'fulfilled') setWorkflows(workflowsRes.value || [])
    } catch (err) {
      console.error('Failed to load GitHub data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setIsSyncing(true)
      await api.syncGitHub()
      await loadGitHubData()
      alert('GitHub organization synchronization completed successfully!')
    } catch (err) {
      console.error('Failed to sync github:', err)
      alert('GitHub sync failed. Please verify GitHub App credentials.')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">GitHub Organization</h1>
            <span className="text-2xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              {status?.organization || 'Fira-Tech-Solutions'} Connected
            </span>
          </div>
          <p className="page-subtitle">
            Centralized code repositories, open pull requests, issues, and automated CI/CD pipeline runs
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="btn-primary text-xs h-9 px-3 shrink-0 inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={cn(isSyncing && 'animate-spin')} />
          <span>{isSyncing ? 'Syncing...' : 'Sync GitHub Repos'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('repos')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'repos'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <GitBranch size={15} />
          <span>Repositories ({repos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prs')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'prs'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <GitPullRequest size={15} />
          <span>Pull Requests ({prs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'issues'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <AlertCircle size={15} />
          <span>Issues ({issues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'workflows'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <PlayCircle size={15} />
          <span>CI/CD Workflows ({workflows.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
      ) : activeTab === 'repos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="card p-4 hover:border-brand-300 dark:hover:border-brand-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-sm text-surface-900 dark:text-surface-100 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1.5 truncate"
                  >
                    <span className="truncate">{repo.name}</span>
                    <ExternalLink size={12} className="text-surface-400 shrink-0" />
                  </a>
                  <span className="text-3xs px-2 py-0.5 rounded-full font-semibold bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 flex items-center gap-1 shrink-0">
                    {repo.private ? <Lock size={10} /> : <Globe size={10} />}
                    {repo.private ? 'Private' : 'Public'}
                  </span>
                </div>

                <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">
                  {repo.description || 'No description provided.'}
                </p>

                {repo.language && (
                  <span className="text-2xs px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium inline-block mb-3">
                    {repo.language}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-2xs text-surface-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-amber-500" />
                    {repo.open_issues_count || 0} issues
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-gold-500" />
                    {repo.stargazers_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={12} />
                    {repo.forks_count || 0}
                  </span>
                </div>
                <span>{repo.updated_at ? getRelativeTime(repo.updated_at) : 'recently'}</span>
              </div>
            </div>
          ))}
          {repos.length === 0 && (
            <div className="col-span-3 text-center py-16 text-surface-400 text-xs">
              No repositories found. Click "Sync GitHub Repos" to fetch your organization's codebases.
            </div>
          )}
        </div>
      ) : activeTab === 'prs' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Pull Request</th>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {prs.map((pr) => (
                  <tr key={pr.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4">
                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-surface-900 dark:text-surface-100 hover:text-brand-600 flex items-center gap-1.5"
                      >
                        <span>#{pr.number} {pr.title}</span>
                        <ExternalLink size={11} className="text-surface-400" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                      {pr.repository_name || 'Repository'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-2xs px-2 py-0.5 rounded-full font-bold uppercase',
                        pr.state === 'open' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                        'bg-surface-100 dark:bg-surface-800 text-surface-600'
                      )}>
                        {pr.state}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                      {pr.author_username || 'Contributor'}
                    </td>
                    <td className="py-3 px-4 text-surface-400">
                      {pr.created_at ? getRelativeTime(pr.created_at) : '—'}
                    </td>
                  </tr>
                ))}
                {prs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-surface-400">
                      No pull requests recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'issues' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Issue</th>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4">
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-surface-900 dark:text-surface-100 hover:text-brand-600 flex items-center gap-1.5"
                      >
                        <span>#{issue.number} {issue.title}</span>
                        <ExternalLink size={11} className="text-surface-400" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                      {issue.repository_name || 'Repository'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-2xs px-2 py-0.5 rounded-full font-bold uppercase',
                        issue.state === 'open' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        'bg-surface-100 dark:bg-surface-800 text-surface-600'
                      )}>
                        {issue.state}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-surface-400">
                      {issue.created_at ? getRelativeTime(issue.created_at) : '—'}
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-surface-400">
                      No issues recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Workflow Name</th>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {workflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">
                      {wf.name || 'CI Build'}
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                      {wf.repository_name || 'Repository'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'text-2xs px-2 py-0.5 rounded-full font-bold uppercase inline-flex items-center gap-1',
                        wf.conclusion === 'success' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        wf.conclusion === 'failure' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      )}>
                        {wf.conclusion === 'success' ? <CheckCircle2 size={11} /> :
                         wf.conclusion === 'failure' ? <XCircle size={11} /> :
                         <Loader2 size={11} className="animate-spin" />}
                        {wf.conclusion || wf.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400 font-mono text-2xs">
                      {wf.head_branch || 'main'}
                    </td>
                    <td className="py-3 px-4 text-surface-400">
                      {wf.run_started_at ? getRelativeTime(wf.run_started_at) : 'recently'}
                    </td>
                  </tr>
                ))}
                {workflows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-surface-400">
                      No automated workflow runs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
