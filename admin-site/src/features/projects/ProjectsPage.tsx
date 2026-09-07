import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { formatDate, formatCurrency, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  Building2,
  X,
  Loader2,
  Trash2,
  Edit2,
  ArrowRight,
  GitBranch,
} from 'lucide-react'

type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'at-risk' | 'completed' | 'cancelled'

interface Project {
  id: string
  name: string
  client_id?: string
  client_name?: string
  client_company?: string
  customer_id?: string
  description?: string
  category?: string
  status: ProjectStatus
  progress: number
  start_date?: string
  deadline?: string
  budget?: number
  technologies?: string[]
  priority?: string
  github_repo_name?: string
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  planning: { label: 'Planning', color: 'text-surface-700 dark:text-surface-300', bg: 'bg-surface-100 dark:bg-surface-800' },
  active: { label: 'Active', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  'on-hold': { label: 'On Hold', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  'at-risk': { label: 'At Risk', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/60' },
  completed: { label: 'Completed', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/60' },
  cancelled: { label: 'Cancelled', color: 'text-surface-600 dark:text-surface-400', bg: 'bg-surface-100 dark:bg-surface-800' },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createProject(data)
    await loadProjects()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateProject(id, data)
    await loadProjects()
    setEditingProject(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    setDeletingId(id)
    try {
      await api.deleteProject(id)
      await loadProjects()
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || project.status === statusFilter)
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Client Deliverables & Projects</h1>
          <p className="page-subtitle">
            Sprint milestones, tasks, and GitHub repositories for active contracts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects/github"
            className="btn-outline text-xs h-9 px-3"
          >
            <GitBranch size={15} className="mr-1.5" />
            <span>GitHub Organization</span>
          </Link>
          <button
            className="btn-primary text-xs h-9 px-3"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={15} />
            <span>New Deliverable</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 font-medium whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input text-xs h-9"
          >
            <option value="all">All Projects ({projects.length})</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-44 skeleton rounded-xl" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setEditingProject(p)}
              onDelete={handleDelete}
              isDeleting={deletingId === project.id}
            />
          ))}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center mx-auto mb-3 text-brand-600">
            <FolderKanban size={26} />
          </div>
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
            No projects found
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-sm mx-auto">
            Create your first project deliverable or convert an inbound deal from your client pipeline.
          </p>
          <button
            className="btn-primary mt-4 text-xs h-9 px-4 inline-flex items-center gap-1.5"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={15} />
            Create Deliverable
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProject) && (
        <ProjectForm
          project={editingProject || undefined}
          onSubmit={(data) => editingProject ? handleUpdate(editingProject.id, data) : handleCreate(data)}
          onClose={() => { setShowCreateModal(false); setEditingProject(null) }}
        />
      )}
    </div>
  )
}

function ProjectCard({ project, onEdit, onDelete, isDeleting }: {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const status = statusConfig[project.status] || statusConfig.planning

  return (
    <div className="card hover:border-brand-300 dark:hover:border-brand-700 transition-all flex flex-col justify-between p-4 group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <Link
              to={`/projects/${project.id}`}
              className="font-bold text-sm text-surface-900 dark:text-surface-100 hover:text-brand-600 dark:hover:text-brand-400 truncate block"
            >
              {project.name}
            </Link>
            {project.client_name && (
              <div className="flex items-center gap-1 text-2xs text-surface-500 dark:text-surface-400 mt-0.5">
                <Building2 size={11} />
                <span>{project.client_name} {project.client_company && `(${project.client_company})`}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded text-surface-400 hover:text-surface-600"
              title="Edit Project"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              disabled={isDeleting}
              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-surface-400 hover:text-red-600"
              title="Delete Project"
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin text-red-500" /> : <Trash2 size={13} />}
            </button>
          </div>
        </div>

        {/* Status & Progress Bar */}
        <div className="my-3">
          <div className="flex items-center justify-between text-2xs mb-1">
            <span className={cn('px-2 py-0.5 rounded-full font-bold uppercase tracking-wider', status.bg, status.color)}>
              {status.label}
            </span>
            <span className="font-bold text-surface-700 dark:text-surface-300">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                project.status === 'completed' ? 'bg-blue-500' :
                project.status === 'at-risk' ? 'bg-rose-500' :
                'bg-brand-600'
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Linked GitHub indicator */}
        {project.github_repo_name && (
          <div className="flex items-center gap-1.5 text-2xs text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/60 px-2 py-1 rounded-md mb-2">
            <GitBranch size={12} className="text-brand-500 shrink-0" />
            <span className="truncate">{project.github_repo_name}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-2xs text-surface-500">
        <div className="flex items-center gap-2">
          {project.deadline && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(project.deadline)}
            </span>
          )}
          {project.budget && (
            <span className="font-semibold text-surface-800 dark:text-surface-200">
              {formatCurrency(project.budget)}
            </span>
          )}
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5"
        >
          Details <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  )
}

function ProjectForm({ project, onSubmit, onClose }: {
  project?: Project
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [clients, setClients] = useState<any[]>([])
  const [form, setForm] = useState({
    name: project?.name || '',
    clientId: project?.client_id || project?.customer_id || '',
    description: project?.description || '',
    category: project?.category || 'Full-Stack Architecture',
    status: project?.status || 'planning',
    progress: project?.progress?.toString() || '0',
    startDate: project?.start_date?.split('T')[0] || '',
    deadline: project?.deadline?.split('T')[0] || '',
    budget: project?.budget?.toString() || '',
    technologies: project?.technologies?.join(', ') || 'React, TypeScript, Tailwind, Node.js',
    priority: project?.priority || 'medium',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getClients().then(setClients).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name: form.name,
        clientId: form.clientId || undefined,
        description: form.description || undefined,
        category: form.category,
        status: form.status,
        progress: Number(form.progress),
        priority: form.priority,
        budget: form.budget ? Number(form.budget) : undefined,
        technologies: form.technologies ? form.technologies.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        startDate: form.startDate || undefined,
        deadline: form.deadline || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-2xl w-full max-w-lg border border-surface-200 dark:border-surface-800 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
          <h2 className="text-base font-bold text-surface-900 dark:text-surface-100">
            {project ? 'Edit Project Deliverable' : 'New Project Deliverable'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded text-surface-400"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Project Name *</label>
            <input type="text" required className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Client Account</label>
              <select
                className="input w-full"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">Direct / Internal</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Category</label>
              <input type="text" className="input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Status</label>
              <select className="input w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Priority</label>
              <select className="input w-full" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Budget ($ USD)</label>
              <input type="number" className="input w-full" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Start Date</label>
              <input type="date" className="input w-full" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Deadline</label>
              <input type="date" className="input w-full" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Technologies (comma separated)</label>
            <input type="text" className="input w-full" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          </div>

          <div>
            <label className="block font-medium text-surface-600 dark:text-surface-400 mb-1">Scope Description</label>
            <textarea className="input w-full h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-xs h-9 px-4">
              {saving && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {project ? 'Save Changes' : 'Create Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
