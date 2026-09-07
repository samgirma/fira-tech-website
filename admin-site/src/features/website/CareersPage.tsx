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
  Send,
  CheckCircle2,
  History,
  Clock,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
  cv_url?: string
  resume_url?: string
  cover_letter?: string
  status?: string
  score?: number
  emails_count?: number
  last_emailed_at?: string
  created_at: string
}

const STATUS_COLORS: Record<string, { label: string; badge: string }> = {
  applied: { label: 'Applied', badge: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-700' },
  screening: { label: 'Screening', badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  interview: { label: 'Interview', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  technical: { label: 'Technical', badge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  offer: { label: 'Offer', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  hired: { label: 'Hired', badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700' },
  rejected: { label: 'Archived', badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
}

const EMAIL_TEMPLATES = {
  interview: {
    key: 'interview',
    label: 'Interview Invitation',
    subject: (job: string) => `Invitation to Interview: ${job} at Fira Tech Solutions`,
    body: (name: string, job: string) =>
`Dear ${name},

Thank you for applying for the ${job} position at Fira Tech Solutions. We reviewed your background and resume, and were very impressed with your experience.

We would love to invite you for a 45-minute architectural interview and introductory conversation with Samuel Girma (Founder & Principal Architect). We'll discuss your past projects, dive into our engineering philosophy, and explore how you can contribute to our core team.

Could you please let us know your availability over the coming days? We can accommodate:
- Tuesday to Thursday, between 2:00 PM and 6:00 PM EAT

We look forward to speaking with you!

Warm regards,
Samuel Girma
Founder & Principal Architect
Fira Tech Solutions
https://firatech.systems`,
    suggestedStatus: 'interview',
  },
  acknowledged: {
    key: 'acknowledged',
    label: 'Application Received',
    subject: (job: string) => `Update on your application for ${job} — Fira Tech Solutions`,
    body: (name: string, job: string) =>
`Dear ${name},

Thank you for taking the time to apply for the ${job} position at Fira Tech Solutions.

We have received your application and resume. Our team is currently reviewing submissions for this role. We assess each applicant's background and project history thoroughly.

You can expect an update from us within the next 3 to 5 business days regarding next steps in the review process.

Best regards,
Samuel Girma
Founder & Principal Architect
Fira Tech Solutions
https://firatech.systems`,
    suggestedStatus: 'screening',
  },
  technical: {
    key: 'technical',
    label: 'Technical Discussion',
    subject: (job: string) => `Next Stage: Technical Discussion — Fira Tech Solutions`,
    body: (name: string, job: string) =>
`Dear ${name},

Following our initial review of your application for ${job}, we would like to invite you to the technical architecture discussion stage.

At Fira Tech, we prioritize hands-on problem solving, clean system design, and sovereign digital architecture. During this session, we will discuss architecture scenarios, high-concurrency systems, and review code structure.

Please let us know a few convenient times this week for a 60-minute technical session.

Best regards,
Samuel Girma
Founder & Principal Architect
Fira Tech Solutions`,
    suggestedStatus: 'technical',
  },
  offer: {
    key: 'offer',
    label: 'Offer Discussion',
    subject: (job: string) => `Congratulations: Offer Discussion for ${job} at Fira Tech Solutions`,
    body: (name: string, job: string) =>
`Dear ${name},

We are thrilled with the outcome of your interview process and would love to extend an offer for you to join Fira Tech Solutions as our ${job}!

We would like to schedule a quick call to walk you through our offer package, compensation structure, and start date.

Please let us know when you are free for a brief call today or tomorrow.

Warm regards,
Samuel Girma
Founder & Principal Architect
Fira Tech Solutions`,
    suggestedStatus: 'offer',
  },
  rejection: {
    key: 'rejection',
    label: 'Respectful Status Update',
    subject: (job: string) => `Regarding your application for ${job} at Fira Tech Solutions`,
    body: (name: string, job: string) =>
`Dear ${name},

Thank you for taking the time to share your background and portfolio with us for the ${job} role at Fira Tech Solutions.

After careful consideration, we have decided to proceed with another candidate whose current experience aligns more closely with our immediate project requirements.

However, your profile and skills made a strong impression on us, and with your permission, we would love to keep your resume on file as our team continues to expand.

We wish you every success in your career journey.

Sincerely,
Samuel Girma
Founder & Principal Architect
Fira Tech Solutions`,
    suggestedStatus: 'rejected',
  },
  custom: {
    key: 'custom',
    label: 'Custom Message',
    subject: (job: string) => `Message from Fira Tech Solutions regarding ${job}`,
    body: (name: string, _job: string) =>
`Dear ${name},



Warm regards,
Samuel Girma
Founder & Principal Architect
Fira Tech Solutions
https://firatech.systems`,
    suggestedStatus: '',
  },
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
  const [emailingCandidate, setEmailingCandidate] = useState<JobApplication | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, newStatus)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      )
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update candidate status.')
    }
  }

  const handleEmailSent = (appId: string, newStatus?: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: newStatus || a.status,
              emails_count: (a.emails_count || 0) + 1,
              last_emailed_at: new Date().toISOString(),
            }
          : a
      )
    )
  }

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
                  <th className="py-3 px-4">Stage / Status</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Outreach</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-surface-900 dark:text-surface-100">
                        {app.name}
                      </p>
                      <p className="text-3xs text-surface-400">
                        Applied {getRelativeTime(app.created_at)}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-surface-700 dark:text-surface-300 font-medium">
                      {app.job_title || 'Engineering Role'}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={app.status || 'applied'}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={cn(
                          'text-3xs font-semibold px-2 py-1 rounded-md border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500',
                          STATUS_COLORS[app.status || 'applied']?.badge || STATUS_COLORS.applied.badge
                        )}
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="technical">Technical</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Archived</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 text-surface-600 dark:text-surface-400">
                        <a href={`mailto:${app.email}`} className="hover:text-brand-600 flex items-center gap-1 text-2xs">
                          <Mail size={11} /> {app.email}
                        </a>
                        {app.phone && (
                          <a href={`tel:${app.phone}`} className="hover:text-brand-600 flex items-center gap-1 text-3xs text-surface-400">
                            <Phone size={10} /> {app.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {(app.emails_count || 0) > 0 ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-3xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} className="shrink-0" />
                          <span>{app.emails_count} Sent</span>
                          {app.last_emailed_at && (
                            <span className="text-surface-400">({getRelativeTime(app.last_emailed_at)})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-surface-400 text-3xs">Not contacted</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(app.cv_url || app.resume_url) && (
                          <a
                            href={
                              (app.cv_url || app.resume_url)!.startsWith('http')
                                ? (app.cv_url || app.resume_url)!
                                : `${API_BASE_URL}${app.cv_url || app.resume_url}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline text-2xs h-7 px-2.5 inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/30"
                            title="Open candidate resume"
                          >
                            <ExternalLink size={11} /> Resume
                          </a>
                        )}

                        {app.cover_letter && (
                          <button
                            onClick={() => setViewingApplication(app)}
                            className="btn-outline text-2xs h-7 px-2.5 inline-flex items-center gap-1"
                            title="View cover letter"
                          >
                            <FileText size={11} /> Statement
                          </button>
                        )}

                        <button
                          onClick={() => setEmailingCandidate(app)}
                          className="btn-primary text-2xs h-7 px-2.5 inline-flex items-center gap-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-xs font-semibold"
                          title="Send professional outreach email"
                        >
                          <Mail size={11} /> Reach Out
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-surface-400">
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

      {/* Candidate Outreach Email Modal */}
      {emailingCandidate && (
        <CandidateEmailModal
          candidate={emailingCandidate}
          onClose={() => setEmailingCandidate(null)}
          onEmailSent={handleEmailSent}
        />
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

interface CandidateEmailModalProps {
  candidate: JobApplication
  onClose: () => void
  onEmailSent: (appId: string, newStatus?: string) => void
}

function CandidateEmailModal({
  candidate,
  onClose,
  onEmailSent,
}: CandidateEmailModalProps) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('interview')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [newStatus, setNewStatus] = useState(candidate.status || 'interview')
  const [isSending, setIsSending] = useState(false)
  const [activeView, setActiveView] = useState<'compose' | 'history'>('compose')
  const [historyList, setHistoryList] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const jobTitle = candidate.job_title || 'Software Engineering Role'

  useEffect(() => {
    applyTemplate('interview')
    fetchEmailHistory()
  }, [candidate])

  const fetchEmailHistory = async () => {
    try {
      setLoadingHistory(true)
      const data = await api.getApplicationEmails(candidate.id)
      setHistoryList(data || [])
    } catch (err) {
      console.error('Failed to load email history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const applyTemplate = (key: string) => {
    setSelectedTemplateKey(key)
    const tpl = (EMAIL_TEMPLATES as any)[key]
    if (tpl) {
      setSubject(tpl.subject(jobTitle))
      setBody(tpl.body(candidate.name, jobTitle))
      if (tpl.suggestedStatus) {
        setNewStatus(tpl.suggestedStatus)
      }
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return

    try {
      setIsSending(true)
      await api.sendApplicantEmail(candidate.id, {
        subject: subject.trim(),
        body: body.trim(),
        template: selectedTemplateKey,
        newStatus: newStatus || undefined,
      })
      setSentSuccess(true)
      onEmailSent(candidate.id, newStatus)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: any) {
      console.error('Error sending email:', err)
      alert(err.message || 'Failed to dispatch email.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between bg-surface-50/70 dark:bg-surface-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100 flex items-center gap-2">
                <span>Reach Out to {candidate.name}</span>
                <span className="text-3xs px-2 py-0.5 rounded-full font-semibold bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                  {candidate.job_title || 'Applicant'}
                </span>
              </h3>
              <p className="text-2xs text-surface-500">
                To: <span className="font-medium text-surface-700 dark:text-surface-300">{candidate.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 p-0.5 text-2xs">
              <button
                type="button"
                onClick={() => setActiveView('compose')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-medium transition-colors',
                  activeView === 'compose'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-xs'
                    : 'text-surface-500 hover:text-surface-700'
                )}
              >
                Compose
              </button>
              <button
                type="button"
                onClick={() => setActiveView('history')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1',
                  activeView === 'history'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-xs'
                    : 'text-surface-500 hover:text-surface-700'
                )}
              >
                <History size={11} />
                <span>History ({historyList.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {sentSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">
                Outreach Message Dispatched
              </h4>
              <p className="text-xs text-surface-500 max-w-sm mx-auto">
                Your message has been sent to {candidate.name} ({candidate.email}) with Fira Tech signature styling.
              </p>
            </div>
          ) : activeView === 'compose' ? (
            <form id="candidate-email-form" onSubmit={handleSend} className="space-y-4 text-xs">
              {/* Template Selector Bar */}
              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Choose Professional Template:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(EMAIL_TEMPLATES).map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      onClick={() => applyTemplate(tpl.key)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-2xs font-medium border transition-all',
                        selectedTemplateKey === tpl.key
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs'
                          : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
                      )}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Invitation to Interview: Software Engineer at Fira Tech"
                  className="input w-full font-medium"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-surface-600 dark:text-surface-400 font-medium">
                    Message Body *
                  </label>
                  <span className="text-3xs text-surface-400">
                    Fira Tech sovereign signature attached automatically
                  </span>
                </div>
                <textarea
                  rows={9}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  className="input w-full resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Status Updater */}
              <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-surface-800 dark:text-surface-200 text-2xs">
                    Candidate Hiring Stage
                  </p>
                  <p className="text-3xs text-surface-500">
                    Automatically update candidate status when sending this message.
                  </p>
                </div>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input w-full sm:w-44 text-2xs py-1"
                >
                  <option value="applied">Leave as Applied</option>
                  <option value="screening">Move to Screening</option>
                  <option value="interview">Move to Interview</option>
                  <option value="technical">Move to Technical</option>
                  <option value="offer">Move to Offer</option>
                  <option value="hired">Mark as Hired</option>
                  <option value="rejected">Move to Archived</option>
                </select>
              </div>
            </form>
          ) : (
            /* History View */
            <div className="space-y-3 text-xs">
              {loadingHistory ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-surface-400" />
                </div>
              ) : historyList.length > 0 ? (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700 space-y-2"
                  >
                    <div className="flex items-center justify-between text-2xs">
                      <span className="font-semibold text-surface-900 dark:text-surface-100">
                        {item.subject}
                      </span>
                      <span className="text-3xs text-surface-400 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(item.sent_at)} ({getRelativeTime(item.sent_at)})
                      </span>
                    </div>
                    <p className="text-xs text-surface-600 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">
                      {item.body}
                    </p>
                    <div className="text-3xs text-surface-400 pt-1 border-t border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                      <span>Template: {item.template || 'custom'}</span>
                      <span>Dispatched by: {item.sender_name || 'Admin'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-surface-400 text-xs">
                  No outreach emails have been sent to {candidate.name} yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!sentSuccess && activeView === 'compose' && (
          <div className="p-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="btn-outline text-xs h-8 px-3.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="candidate-email-form"
              disabled={isSending || !subject.trim() || !body.trim()}
              className="btn-primary text-xs h-8 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {isSending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              <span>{isSending ? 'Dispatching...' : 'Send Message'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
