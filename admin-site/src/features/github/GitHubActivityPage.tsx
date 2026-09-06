import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import { GitPullRequest, AlertCircle, Tag, Workflow, RefreshCw, Activity } from 'lucide-react'

interface ActivityItem {
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

export default function GitHubActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data = await api.getGitHubActivity(50)
      setActivity(data)
    } catch (error) { console.error(error) }
    finally { setIsLoading(false) }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'pull_request': return <GitPullRequest size={16} className="text-purple-500" />
      case 'issue': return <AlertCircle size={16} className="text-green-500" />
      case 'release': return <Tag size={16} className="text-blue-500" />
      case 'workflow': return <Workflow size={16} className="text-orange-500" />
      default: return <Activity size={16} className="text-surface-500" />
    }
  }

  const getBadge = (item: ActivityItem) => {
    if (item.type === 'pull_request' && item.merged) return <span className="badge bg-purple-100 text-purple-800">Merged</span>
    if (item.type === 'pull_request') return <span className={`badge ${item.state === 'open' ? 'badge-success' : 'badge-neutral'}`}>{item.state}</span>
    if (item.type === 'issue') return <span className={`badge ${item.state === 'open' ? 'badge-success' : 'badge-neutral'}`}>{item.state}</span>
    if (item.type === 'release') return <span className="badge badge-success">{item.state}</span>
    if (item.type === 'workflow') return <span className={`badge ${item.state === 'success' ? 'badge-success' : item.state === 'failure' ? 'badge-danger' : 'badge-info'}`}>{item.state}</span>
    return null
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Activity Timeline</h1>
          <p className="page-subtitle">Recent engineering activity across all repositories</p>
        </div>
        <button onClick={loadData} className="btn-secondary"><RefreshCw size={16} /> Refresh</button>
      </div>

      {isLoading ? (
        <div className="card"><div className="card-content space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center gap-4"><div className="h-8 w-8 skeleton rounded-lg" /><div className="flex-1"><div className="h-4 w-64 skeleton rounded mb-1" /><div className="h-3 w-32 skeleton rounded" /></div></div>)}</div></div>
      ) : activity.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <Activity size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No activity</h3>
            <p className="text-sm text-surface-500 mt-1">No recent engineering activity found</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-content">
            <div className="space-y-1">
              {activity.map((item, i) => (
                <a
                  key={i}
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-surface-100 mt-0.5 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-surface-400 uppercase">{item.type === 'pull_request' ? 'PR' : item.type === 'issue' ? 'Issue' : item.type === 'release' ? 'Release' : 'Run'}</span>
                      <span className="text-sm font-medium text-surface-900">#{item.number} {item.title}</span>
                      {getBadge(item)}
                    </div>
                    <p className="text-xs text-surface-400 mt-1">
                      {item.repository_name} · {item.author_login} · {getRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
