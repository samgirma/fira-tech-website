import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate } from '../../lib/utils'
import {
  Search,
  FileText,
  Loader2,
  Mail,
  Download,
} from 'lucide-react'

interface Application {
  id: string
  name: string
  email: string
  phone?: string
  jobId: string
  jobTitle?: string
  resumeUrl?: string
  coverLetter?: string
  createdAt: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      const data = await api.getApplications()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">Review job applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <span className="ml-2 text-surface-500">Loading applications...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && applications.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <FileText size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No applications received yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Applications from job seekers will appear here once they apply to your listings.
            </p>
          </div>
        </div>
      )}

      {/* Applications Table */}
      {!isLoading && filteredApplications.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Applied For</th>
                  <th>Resume</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <p className="font-medium text-surface-900">{app.name}</p>
                    </td>
                    <td>
                      <span className="text-sm text-surface-600 flex items-center gap-1">
                        <Mail size={12} />
                        {app.email}
                      </span>
                    </td>
                    <td>
                      {app.phone ? (
                        <span className="text-sm text-surface-600">{app.phone}</span>
                      ) : (
                        <span className="text-sm text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      {app.jobTitle ? (
                        <span className="badge bg-surface-100 text-surface-700">{app.jobTitle}</span>
                      ) : (
                        <span className="text-sm text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm"
                        >
                          <Download size={12} />
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-surface-400">No resume</span>
                      )}
                    </td>
                    <td>
                      <span className="text-sm text-surface-500">{formatDate(app.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && applications.length > 0 && filteredApplications.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-2" />
            <p className="text-surface-500">No applications match your search</p>
          </div>
        </div>
      )}
    </div>
  )
}
