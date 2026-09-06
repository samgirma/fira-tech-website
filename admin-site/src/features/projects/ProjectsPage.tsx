import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  Users,
  X,
  Loader2,
  Trash2,
  Edit2,
} from 'lucide-react'

type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'at-risk' | 'completed' | 'cancelled'

interface Project {
  id: string
  name: string
  customerId?: string
  clientName?: string
  description?: string
  category?: string
  status: ProjectStatus
  progress: number
  startDate?: string
  deadline?: string
  budget?: number
  technologies?: string[]
  priority?: string
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  planning: { label: 'Planning', color: 'text-surface-700', bg: 'bg-surface-100' },
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-100' },
  'on-hold': { label: 'On Hold', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  'at-risk': { label: 'At Risk', color: 'text-orange-700', bg: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-blue-700', bg: 'bg-blue-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
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
    if (!confirm('Delete this project?')) return
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
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your active projects and track progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={setEditingProject}
            onDelete={handleDelete}
            isDeleting={deletingId === project.id}
          />
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <FolderKanban size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No projects yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Create your first project to start tracking progress, deadlines, and deliverables.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Project
            </button>
          </div>
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
  const status = statusConfig[project.status]

  return (
    <div className="card hover:shadow-medium transition-shadow">
      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-surface-900 truncate">{project.name}</h3>
            {project.clientName && (
              <p className="text-sm text-surface-500 flex items-center gap-1 mt-0.5">
                <Users size={14} />
                {project.clientName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(project)} className="p-1 hover:bg-surface-100 rounded">
              <Edit2 size={14} className="text-surface-400" />
            </button>
            <button onClick={() => onDelete(project.id)} disabled={isDeleting} className="p-1 hover:bg-red-50 rounded">
              {isDeleting ? <Loader2 size={14} className="text-red-400 animate-spin" /> : <Trash2 size={14} className="text-surface-400" />}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className={cn('badge', status.bg, status.color)}>{status.label}</span>
            <span className="text-sm font-medium text-surface-700">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                project.status === 'completed' ? 'bg-green-500' :
                project.status === 'at-risk' ? 'bg-orange-500' :
                'bg-brand-500'
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-2xs">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-2xs">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          {project.deadline && (
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(project.deadline)}
            </span>
          )}
          {project.budget && (
            <span className="text-xs text-surface-500">
              Budget: {project.budget.toLocaleString()} ETB
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectForm({ project, onSubmit, onClose }: {
  project?: Project
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    category: project?.category || '',
    status: project?.status || 'planning',
    progress: project?.progress?.toString() || '0',
    startDate: project?.startDate?.split('T')[0] || '',
    deadline: project?.deadline?.split('T')[0] || '',
    budget: project?.budget?.toString() || '',
    technologies: project?.technologies?.join(', ') || '',
    priority: project?.priority || 'medium',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        progress: Number(form.progress),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
            <input type="text" required className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea className="input w-full h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
              <input type="text" className="input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
              <select className="input w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Progress %</label>
              <input type="number" min="0" max="100" className="input w-full" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Priority</label>
              <select className="input w-full" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Budget (ETB)</label>
              <input type="number" className="input w-full" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Start Date</label>
              <input type="date" className="input w-full" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Deadline</label>
              <input type="date" className="input w-full" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Technologies (comma separated)</label>
            <input type="text" className="input w-full" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
