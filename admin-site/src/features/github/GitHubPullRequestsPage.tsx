import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import {
  Search,
  ExternalLink,
  GitPullRequest,
  RefreshCw,
  CheckCircle2,
  Circle,
  GitMerge,
} from 'lucide-react'

interface PullRequest {
  id: string
  github_id: string
  number: number
  title: string
  state: string
  merged: boolean | null
  html_url: string
  repository_name: string
  repository_full_name: string
  author_login: string
  head_branch: string | null
  base_branch: string | null
  created_at_github: string
  updated_at_github: string
  merged_at: string | null
}

export default function GitHubPullRequestsPage() {
  const [prs, setPrs] = useState<PullRequest[]>([])
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
      const [prsData, reposData] = await Promise.all([
        api.getGitHubPullRequests({ state: stateFilter }),
        api.getGitHubRepositories(),
      ])
      setPrs(prsData)
      setRepos(reposData)
    } catch (error) {
      console.error('Failed to load PRs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadFiltered = async () => {
      try {
        const data = await api.getGitHubPullRequests({
          state: stateFilter,
          repositoryId: repoFilter || undefined,
        })
        setPrs(data)
      } catch (error) {
        console.error(error)
      }
    }
    if (!isLoading) loadFiltered()
  }, [stateFilter, repoFilter])

  const filteredPrs = prs.filter(pr => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return pr.title.toLowerCase().includes(q) ||
        String(pr.number).includes(q) ||
        pr.author_login?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Pull Requests</h1>
          <p className="page-subtitle">{prs.length} pull requests across all repositories</p>
        </div>
        <button onClick={loadData} className="btn-secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Search pull requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10" />
        </div>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="input w-auto">
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
        <select value={repoFilter} onChange={(e) => setRepoFilter(e.target.value)} className="input w-auto">
          <option value="">All repositories</option>
          {repos.map(repo => <option key={repo.id} value={repo.id}>{repo.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="card">
          <div className="card-content space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center gap-4"><div className="h-5 w-5 skeleton rounded" /><div className="h-4 w-64 skeleton rounded" /></div>)}
          </div>
        </div>
      ) : filteredPrs.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <GitPullRequest size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No pull requests found</h3>
            <p className="text-sm text-surface-500 mt-1">No pull requests match your filters</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Pull Request</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Repository</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Branch</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Author</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Updated</th>
                  <th className="w-10 px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredPrs.map(pr => (
                  <tr key={pr.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {pr.merged ? <GitMerge size={16} className="text-purple-500" /> : pr.state === 'open' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-surface-400" />}
                        <p className="text-sm font-medium text-surface-900">#{pr.number} {pr.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3"><span className="text-sm text-surface-600">{pr.repository_name}</span></td>
                    <td className="px-6 py-3">
                      <span className={`badge ${pr.merged ? 'bg-purple-100 text-purple-800' : pr.state === 'open' ? 'badge-success' : 'badge-neutral'}`}>
                        {pr.merged ? 'Merged' : pr.state}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-xs text-surface-500">
                        {pr.head_branch} → {pr.base_branch}
                      </div>
                    </td>
                    <td className="px-6 py-3"><span className="text-sm text-surface-600">{pr.author_login}</span></td>
                    <td className="px-6 py-3"><span className="text-xs text-surface-400">{getRelativeTime(pr.updated_at_github)}</span></td>
                    <td className="px-6 py-3">
                      <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-600"><ExternalLink size={14} /></a>
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
