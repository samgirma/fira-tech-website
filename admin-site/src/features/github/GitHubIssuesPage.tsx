import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import {
  Search,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
} from 'lucide-react'

interface Issue {
  id: string
  github_id: string
  number: number
  title: string
  state: string
  state_reason: string | null
  html_url: string
  repository_name: string
  repository_full_name: string
  author_login: string
  assignee_login: string | null
  labels: string[]
  milestone: string | null
  comments_count: number
  created_at_github: string
  updated_at_github: string
}

export default function GitHubIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [repos, setRepos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('open')
  const [repoFilter, setRepoFilter] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [issuesData, reposData] = await Promise.all([
        api.getGitHubIssues({ state: stateFilter }),
        api.getGitHubRepositories(),
      ])
      setIssues(issuesData)
      setRepos(reposData)
    } catch (error) {
      console.error('Failed to load issues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadFiltered = async () => {
      try {
        const data = await api.getGitHubIssues({
          state: stateFilter,
          repositoryId: repoFilter || undefined,
        })
        setIssues(data)
      } catch (error) {
        console.error(error)
      }
    }
    if (!isLoading) loadFiltered()
  }, [stateFilter, repoFilter])

  const filteredIssues = issues.filter(issue => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return issue.title.toLowerCase().includes(q) ||
        String(issue.number).includes(q) ||
        issue.author_login?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Issues</h1>
          <p className="page-subtitle">{issues.length} issues across all repositories</p>
        </div>
        <button onClick={loadData} className="btn-secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
        <select
          value={repoFilter}
          onChange={(e) => setRepoFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">All repositories</option>
          {repos.map(repo => (
            <option key={repo.id} value={repo.id}>{repo.name}</option>
          ))}
        </select>
      </div>

      {/* Issues Table */}
      {isLoading ? (
        <div className="card">
          <div className="card-content space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-5 w-5 skeleton rounded" />
                <div className="h-4 w-64 skeleton rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <AlertCircle size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No issues found</h3>
            <p className="text-sm text-surface-500 mt-1">No issues match your filters</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Issue</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Repository</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Labels</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Author</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Updated</th>
                  <th className="w-10 px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredIssues.map(issue => (
                  <tr key={issue.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {issue.state === 'open' ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <Circle size={16} className="text-surface-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-surface-900">#{issue.number} {issue.title}</p>
                          {issue.milestone && (
                            <p className="text-xs text-surface-400 mt-0.5">Milestone: {issue.milestone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-surface-600">{issue.repository_name}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`badge ${issue.state === 'open' ? 'badge-success' : 'badge-neutral'}`}>
                        {issue.state}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {issue.labels?.slice(0, 3).map((label, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs font-medium bg-surface-100 text-surface-600 rounded-full">
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-surface-600">{issue.author_login}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs text-surface-400">{getRelativeTime(issue.updated_at_github)}</span>
                    </td>
                    <td className="px-6 py-3">
                      <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-600">
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
