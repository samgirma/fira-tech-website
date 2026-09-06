import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import {
  Search,
  ExternalLink,
  GitBranch,
  Lock,
  Archive,
  Star,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

interface Repository {
  id: string
  github_id: string
  name: string
  full_name: string
  description: string | null
  private: boolean
  archived: boolean
  default_branch: string
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at_github: string
}

export default function GitHubRepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadRepos()
  }, [])

  const loadRepos = async () => {
    try {
      const data = await api.getGitHubRepositories()
      setRepos(data)
    } catch (error) {
      console.error('Failed to load repos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRepos = repos.filter(repo => {
    if (!showArchived && repo.archived) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return repo.name.toLowerCase().includes(q) ||
        repo.description?.toLowerCase().includes(q) ||
        repo.language?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Repositories</h1>
          <p className="page-subtitle">{repos.length} repositories in your organization</p>
        </div>
        <button onClick={loadRepos} className="btn-secondary">
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
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-600">Show archived</span>
        </label>
      </div>

      {/* Repository List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card">
              <div className="card-content flex items-center gap-4">
                <div className="h-10 w-10 skeleton rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 skeleton rounded mb-2" />
                  <div className="h-3 w-64 skeleton rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <GitBranch size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No repositories found</h3>
            <p className="text-sm text-surface-500 mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRepos.map(repo => (
            <div key={repo.id} className="card hover:shadow-medium transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-surface-100 mt-0.5">
                      <GitBranch size={18} className="text-surface-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-surface-900">{repo.name}</h3>
                        {repo.private && <Lock size={14} className="text-surface-400" />}
                        {repo.archived && <Archive size={14} className="text-surface-400" />}
                      </div>
                      <p className="text-sm text-surface-500 mt-0.5">{repo.description || 'No description'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                        {repo.language && <span className="flex items-center gap-1">{repo.language}</span>}
                        <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazers_count}</span>
                        <span className="flex items-center gap-1"><AlertCircle size={12} /> {repo.open_issues_count} issues</span>
                        <span>Updated {getRelativeTime(repo.pushed_at_github)}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors shrink-0"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
