import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime } from '../../lib/utils'
import { ExternalLink, Workflow, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

interface WorkflowRun {
  id: string
  github_id: string
  name: string
  run_number: number
  branch: string
  status: string
  conclusion: string | null
  event: string
  html_url: string
  repository_name: string
  run_attempt: number
  created_at_github: string
  updated_at_github: string
  completed_at_github: string | null
}

export default function GitHubWorkflowsPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [repos, setRepos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [repoFilter, setRepoFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [runsData, reposData] = await Promise.all([
        api.getGitHubWorkflows(),
        api.getGitHubRepositories(),
      ])
      setRuns(runsData)
      setRepos(reposData)
    } catch (error) { console.error(error) }
    finally { setIsLoading(false) }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getGitHubWorkflows({ repositoryId: repoFilter || undefined, status: statusFilter || undefined })
        setRuns(data)
      } catch (error) { console.error(error) }
    }
    if (!isLoading) load()
  }, [repoFilter, statusFilter])

  const getConclusionIcon = (conclusion: string | null) => {
    switch (conclusion) {
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />
      case 'failure': return <XCircle size={16} className="text-red-500" />
      case 'cancelled': return <AlertCircle size={16} className="text-surface-400" />
      default: return <Clock size={16} className="text-blue-500" />
    }
  }

  const getConclusionColor = (conclusion: string | null) => {
    switch (conclusion) {
      case 'success': return 'badge-success'
      case 'failure': return 'badge-danger'
      case 'cancelled': return 'badge-neutral'
      default: return 'badge-info'
    }
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Workflows</h1>
          <p className="page-subtitle">{runs.length} CI/CD runs</p>
        </div>
        <button onClick={loadData} className="btn-secondary"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={repoFilter} onChange={(e) => setRepoFilter(e.target.value)} className="input w-auto">
          <option value="">All repositories</option>
          {repos.map(repo => <option key={repo.id} value={repo.id}>{repo.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      {isLoading ? (
        <div className="card"><div className="card-content space-y-4">{[1, 2, 3].map(i => <div key={i} className="flex items-center gap-4"><div className="h-5 w-5 skeleton rounded" /><div className="h-4 w-48 skeleton rounded" /></div>)}</div></div>
      ) : runs.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <Workflow size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No workflow runs</h3>
            <p className="text-sm text-surface-500 mt-1">No CI/CD runs found</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Workflow</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Repository</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Branch</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Event</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Run #</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider px-6 py-3">Completed</th>
                  <th className="w-10 px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {runs.map(run => (
                  <tr key={run.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-3">{getConclusionIcon(run.conclusion)}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-surface-900">{run.name}</p>
                      <span className={`badge ${getConclusionColor(run.conclusion)} mt-1`}>{run.conclusion || run.status}</span>
                    </td>
                    <td className="px-6 py-3"><span className="text-sm text-surface-600">{run.repository_name}</span></td>
                    <td className="px-6 py-3"><span className="text-sm text-surface-600">{run.branch}</span></td>
                    <td className="px-6 py-3"><span className="badge badge-neutral">{run.event}</span></td>
                    <td className="px-6 py-3"><span className="text-sm text-surface-500">#{run.run_number}</span></td>
                    <td className="px-6 py-3"><span className="text-xs text-surface-400">{run.completed_at_github ? getRelativeTime(run.completed_at_github) : '—'}</span></td>
                    <td className="px-6 py-3"><a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-600"><ExternalLink size={14} /></a></td>
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
