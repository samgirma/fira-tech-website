import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import { ExternalLink, Tag, RefreshCw } from 'lucide-react'

interface Release {
  id: string
  github_id: string
  tag_name: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  html_url: string
  repository_name: string
  repository_full_name: string
  author_login: string
  published_at_github: string
  created_at_github: string
}

export default function GitHubReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [repos, setRepos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [repoFilter, setRepoFilter] = useState<string>('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [releasesData, reposData] = await Promise.all([
        api.getGitHubReleases(),
        api.getGitHubRepositories(),
      ])
      setReleases(releasesData)
      setRepos(reposData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getGitHubReleases({ repositoryId: repoFilter || undefined })
        setReleases(data)
      } catch (error) { console.error(error) }
    }
    if (!isLoading) load()
  }, [repoFilter])

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Releases</h1>
          <p className="page-subtitle">{releases.length} releases across all repositories</p>
        </div>
        <button onClick={loadData} className="btn-secondary"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="mb-6">
        <select value={repoFilter} onChange={(e) => setRepoFilter(e.target.value)} className="input w-auto">
          <option value="">All repositories</option>
          {repos.map(repo => <option key={repo.id} value={repo.id}>{repo.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="card"><div className="card-content"><div className="h-4 w-48 skeleton rounded" /><div className="h-3 w-32 skeleton rounded mt-2" /></div></div>)}
        </div>
      ) : releases.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <Tag size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No releases</h3>
            <p className="text-sm text-surface-500 mt-1">No releases found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map(release => (
            <div key={release.id} className="card hover:shadow-medium transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-50 mt-0.5">
                      <Tag size={18} className="text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-surface-900">{release.name || release.tag_name}</h3>
                        <span className="badge badge-neutral">{release.tag_name}</span>
                        {release.prerelease && <span className="badge badge-warning">Pre-release</span>}
                        {release.draft && <span className="badge badge-info">Draft</span>}
                      </div>
                      <p className="text-sm text-surface-500 mt-1">{release.repository_name} · {release.author_login}</p>
                      {release.body && <p className="text-sm text-surface-600 mt-2 line-clamp-2">{release.body}</p>}
                      <p className="text-xs text-surface-400 mt-2">Published {getRelativeTime(release.published_at_github)}</p>
                    </div>
                  </div>
                  <a href={release.html_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors shrink-0">
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
