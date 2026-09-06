import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { getRelativeTime, cn } from '../../lib/utils'
import { Shield, Loader2, Filter } from 'lucide-react'

interface AuditEntry {
  id: string
  action: string
  entity_type?: string
  entity_id?: string
  details?: any
  ip_address?: string
  user_name?: string
  user_email?: string
  created_at: string
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-surface-100 text-surface-600',
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState('')

  useEffect(() => {
    loadAudit()
  }, [entityFilter])

  const loadAudit = async () => {
    try {
      setIsLoading(true)
      const data = await api.getAuditLog({
        entity_type: entityFilter || undefined,
        limit: 100,
      })
      setEntries(data)
    } catch (error) {
      console.error('Failed to load audit log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Track all system activity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="input pl-9 w-48"
            >
              <option value="">All entities</option>
              <option value="lead">Leads</option>
              <option value="customer">Customers</option>
              <option value="project">Projects</option>
              <option value="task">Tasks</option>
              <option value="blog">Blogs</option>
              <option value="job">Jobs</option>
              <option value="invoice">Invoices</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-surface-400 animate-spin" />
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <Shield size={24} className="text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No audit entries</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Activity will be recorded here as you use the system.
            </p>
          </div>
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User</th>
                  <th>Details</th>
                  <th>IP</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className={cn('badge text-2xs font-semibold', actionColors[entry.action] || 'bg-surface-100 text-surface-600')}>
                        {entry.action}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-surface-900 capitalize">{entry.entity_type || '-'}</p>
                        {entry.entity_id && (
                          <p className="text-xs text-surface-400 font-mono">{entry.entity_id.slice(0, 8)}...</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-surface-700">{entry.user_name || entry.user_email || 'System'}</p>
                    </td>
                    <td>
                      {entry.details ? (
                        <p className="text-xs text-surface-500 max-w-xs truncate">
                          {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
                        </p>
                      ) : (
                        <span className="text-surface-300">-</span>
                      )}
                    </td>
                    <td className="text-xs text-surface-400 font-mono">{entry.ip_address || '-'}</td>
                    <td className="text-xs text-surface-500">{getRelativeTime(entry.created_at)}</td>
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
