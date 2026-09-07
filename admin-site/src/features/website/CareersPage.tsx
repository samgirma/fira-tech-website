import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, getRelativeTime, cn } from '../../lib/utils'
import {
  Briefcase,
  Plus,
  Search,
  Users,
  MapPin,
  Building2,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  FileText,
  Mail,
  Phone,
  ExternalLink,
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
  created_at?: string
}

interface JobApplication {
  id: string
  job_id: string
  job_title?: string
  name: string
  email: string
  phone?: string
  resume_url?: string
  cover_letter?: string
  status?: string
  created_at: string
}

export default function CareersPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [viewingApplication, setViewingApplication] = useState<JobApplication | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [jobsRes, appsRes] = await Promise.allSettled([
        api.getJobs(),
        api.getJobApplications(),
      ])

      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value || [])
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value || [])
    } catch (err) {
      console.error('Failed to load careers data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      setTogglingId(id)
      await api.toggleJobActive(id)
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, active: !j.active } : j))
      )
    } catch (err) {
      console.error('Failed to toggle job active:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return
    try {
      setDeletingId(id)
      await api.deleteJob(id)
      await loadData()
    } catch (err) {
      console.error('Failed to delete job:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveJob = async (data: any) => {
    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, data)
      } else {
        await api.createJob(data)
      }
      setShowModal(false)
      setEditingJob(null)
      await loadData()
    } catch (err) {
      console.error('Failed to save job:', err)
      alert('Failed to save job listing.')
    }
  }

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredApps = applications.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Careers & Talent Pipeline</h1>
          <p className="page-subtitle">
            Manage engineering and architectural job listings and review candidate submissions
          </p>
        </div>

        {activeTab === 'jobs' && (
          <button
            className="btn-primary text-xs h-9 px-3"
            onClick={() => {
              setEditingJob(null)
              setShowModal(true)
            }}
          >
            <Plus size={15} />
            <span>Post New Role</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('jobs')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'jobs'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Briefcase size={15} />
          <span>Open Roles ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'applicants'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <Users size={15} />
          <span>Applicant Inbox ({applications.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="card p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={activeTab === 'jobs' ? 'Search open roles...' : 'Search applicants...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
      ) : activeTab === 'jobs' ? (
        filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="card flex flex-col justify-between overflow-hidden group hover:border-brand-300 dark:hover:border-brand-700 transition-all"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                      {job.department || 'Engineering'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingJob(job)
                          setShowModal(true)
                        }}
                        className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={deletingId === job.id}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-surface-400 hover:text-red-600"
                      >
                        {deletingId === job.id ? (
                          <Loader2 size={13} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-2xs text-surface-500">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                      </span>
                    )}
                    {job.remote && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Remote
                      </span>
                    )}
                    <span className="px-1.5 py-0.2 rounded bg-surface-100 dark:bg-surface-800 text-surface-600">
                      {job.type}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>

                <div className="p-3.5 bg-surface-50/50 dark:bg-surface-800/40 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-2xs">
                  <button
                    onClick={() => handleToggleActive(job.id)}
                    disabled={togglingId === job.id}
                    className="flex items-center gap-1 font-semibold text-surface-700 dark:text-surface-300"
                  >
                    {job.active ? (
                      <>
                        <ToggleRight size={20} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Accepting Applicants</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} className="text-surface-400" />
                        <span className="text-surface-400">Closed / Inactive</span>
                      </>
                    )}
                  </button>
                  <span className="text-surface-400">
                    {formatDate(job.createdAt || job.created_at || new Date().toISOString())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card py-16 text-center text-xs text-surface-400">
            No open roles found.
          </div>
        )
      ) : (
        /* Applicant Inbox */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">
                      {app.name}
                    </td>

                    <td className="py-3 px-4 text-surface-700 dark:text-surface-300 font-medium">
                      {app.job_title || 'Engineering Role'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 text-surface-600 dark:text-surface-400">
                        <a href={`mailto:${app.email}`} className="hover:text-brand-600 flex items-center gap-1">
                          <Mail size={12} /> {app.email}
                        </a>
                        {app.phone && (
                          <a href={`tel:${app.phone}`} className="hover:text-brand-600 flex items-center gap-1">
                            <Phone size={12} /> {app.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-surface-400">
                      {getRelativeTime(app.created_at)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.resume_url && (
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline text-2xs h-7 px-2.5 inline-flex items-center gap-1"
                          >
                            <ExternalLink size={11} /> Resume
                          </a>
                        )}
                        {app.cover_letter && (
                          <button
                            onClick={() => setViewingApplication(app)}
                            className="btn-outline text-2xs h-7 px-2.5 inline-flex items-center gap-1"
                          >
                            <FileText size={11} /> Cover Letter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-surface-400">
                      No applications received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {viewingApplication && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
              <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
                Application: {viewingApplication.name} ({viewingApplication.job_title})
              </h3>
              <button onClick={() => setViewingApplication(null)} className="p-1 text-surface-400 hover:text-surface-600">
                <X size={16} />
              </button>
            </div>
            <div>
              <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500 block mb-1">
                Candidate Statement / Cover Letter
              </span>
              <p className="text-xs text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">
                {viewingApplication.cover_letter}
              </p>
            </div>
            <div className="pt-2 text-right">
              <button onClick={() => setViewingApplication(null)} className="btn-primary text-xs h-8 px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Create/Edit Modal */}
      {showModal && (
        <JobModal
          job={editingJob || undefined}
          onSave={handleSaveJob}
          onClose={() => {
            setShowModal(false)
            setEditingJob(null)
          }}
        />
      )}
    </div>
  )
}

function JobModal({
  job,
  onSave,
  onClose,
}: {
  job?: Job
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(job?.title || '')
  const [department, setDepartment] = useState(job?.department || 'Engineering')
  const [location, setLocation] = useState(job?.location || 'Addis Ababa / Remote')
  const [type, setType] = useState<JobType>(job?.type || 'FULL_TIME')
  const [experience, setExperience] = useState<ExperienceLevel>(job?.experience || 'SENIOR')
  const [remote, setRemote] = useState(job?.remote ?? true)
  const [description, setDescription] = useState(job?.description || '')
  const [active, setActive] = useState(job?.active ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      await onSave({
        title,
        department,
        location,
        type,
        experience,
        remote,
        description,
        active,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
            {job ? 'Edit Role Posting' : 'Post New Engineering Role'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Principal Systems Architect"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Core Systems, AI Engineering"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Addis Ababa / Remote"
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as JobType)}
                className="input w-full"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="input w-full"
              >
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Principal / Lead</option>
                <option value="MID">Mid Level</option>
                <option value="ENTRY">Junior / Entry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Role Description & Technical Responsibilities
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key responsibilities, stack proficiencies, and expectations..."
              className="input w-full resize-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-surface-700 dark:text-surface-300 font-medium">
                Remote Friendly
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-surface-700 dark:text-surface-300 font-medium">
                Active & Accepting Applications
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {job ? 'Update Role' : 'Publish Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
