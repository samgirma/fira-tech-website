import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Briefcase,
  Loader2,
  Trash2,
  Edit2,
  X,
  MapPin,
  Building2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'

interface Job {
  id: string
  title: string
  description?: string
  department?: string
  location?: string
  type: JobType
  experience: ExperienceLevel
  remote: boolean
  active: boolean
  createdAt: string
}

const typeConfig: Record<JobType, { label: string; color: string; bg: string }> = {
  FULL_TIME: { label: 'Full Time', color: 'text-green-700', bg: 'bg-green-100' },
  PART_TIME: { label: 'Part Time', color: 'text-blue-700', bg: 'bg-blue-100' },
  CONTRACT: { label: 'Contract', color: 'text-orange-700', bg: 'bg-orange-100' },
  INTERNSHIP: { label: 'Internship', color: 'text-purple-700', bg: 'bg-purple-100' },
}

const experienceConfig: Record<ExperienceLevel, { label: string; color: string; bg: string }> = {
  ENTRY: { label: 'Entry', color: 'text-surface-600', bg: 'bg-surface-100' },
  MID: { label: 'Mid', color: 'text-blue-700', bg: 'bg-blue-100' },
  SENIOR: { label: 'Senior', color: 'text-orange-700', bg: 'bg-orange-100' },
  LEAD: { label: 'Lead', color: 'text-red-700', bg: 'bg-red-100' },
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setIsLoading(true)
      const data = await api.getJobs()
      setJobs(data)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createJob(data)
    await loadJobs()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateJob(id, data)
    await loadJobs()
    setEditingJob(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job listing?')) return
    setDeletingId(id)
    try {
      await api.deleteJob(id)
      await loadJobs()
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (id: string) => {
    setTogglingId(id)
    try {
      await api.toggleJob(id)
      await loadJobs()
    } finally {
      setTogglingId(null)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Careers</h1>
          <p className="page-subtitle">Manage job listings and openings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Job
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <span className="ml-2 text-surface-500">Loading jobs...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Briefcase size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No job listings yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Create your first job listing to start attracting talent.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              New Job
            </button>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Experience</th>
                  <th>Remote</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div>
                        <p className="font-medium text-surface-900">{job.title}</p>
                        {job.description && (
                          <p className="text-xs text-surface-500 mt-0.5 truncate max-w-xs">{job.description}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      {job.department ? (
                        <span className="text-sm text-surface-600 flex items-center gap-1">
                          <Building2 size={12} />
                          {job.department}
                        </span>
                      ) : (
                        <span className="text-sm text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      {job.location ? (
                        <span className="text-sm text-surface-600 flex items-center gap-1">
                          <MapPin size={12} />
                          {job.location}
                        </span>
                      ) : (
                        <span className="text-sm text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      <span className={cn('badge', typeConfig[job.type].bg, typeConfig[job.type].color)}>
                        {typeConfig[job.type].label}
                      </span>
                    </td>
                    <td>
                      <span className={cn('badge', experienceConfig[job.experience].bg, experienceConfig[job.experience].color)}>
                        {experienceConfig[job.experience].label}
                      </span>
                    </td>
                    <td>
                      {job.remote ? (
                        <span className="badge bg-green-100 text-green-700">Remote</span>
                      ) : (
                        <span className="badge bg-surface-100 text-surface-600">On-site</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(job.id)}
                        disabled={togglingId === job.id}
                        className="p-1 hover:bg-surface-100 rounded"
                      >
                        {togglingId === job.id ? (
                          <Loader2 size={18} className="text-surface-400 animate-spin" />
                        ) : job.active ? (
                          <ToggleRight size={18} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={18} className="text-surface-400" />
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingJob(job)}
                          className="p-1 hover:bg-surface-100 rounded"
                        >
                          <Edit2 size={14} className="text-surface-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={deletingId === job.id}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          {deletingId === job.id ? (
                            <Loader2 size={14} className="text-red-400 animate-spin" />
                          ) : (
                            <Trash2 size={14} className="text-surface-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-2" />
            <p className="text-surface-500">No jobs match your search</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingJob) && (
        <JobForm
          job={editingJob || undefined}
          onSubmit={(data) => editingJob ? handleUpdate(editingJob.id, data) : handleCreate(data)}
          onClose={() => { setShowCreateModal(false); setEditingJob(null) }}
        />
      )}
    </div>
  )
}

function JobForm({ job, onSubmit, onClose }: {
  job?: Job
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: job?.title || '',
    description: job?.description || '',
    department: job?.department || '',
    location: job?.location || '',
    type: job?.type || 'FULL_TIME',
    experience: job?.experience || 'MID',
    remote: job?.remote ?? false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">{job ? 'Edit Job' : 'New Job'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
            <input
              type="text"
              required
              className="input w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea
              className="input w-full h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Department</label>
              <input
                type="text"
                className="input w-full"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Location</label>
              <input
                type="text"
                className="input w-full"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
              <select
                className="input w-full"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as JobType })}
              >
                {Object.entries(typeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Experience</label>
              <select
                className="input w-full"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value as ExperienceLevel })}
              >
                {Object.entries(experienceConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.checked })}
                className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-surface-700">Remote friendly</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : job ? 'Save Changes' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
