import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  X,
  ListTodo,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from 'lucide-react'

type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

interface Task {
  id: string
  title: string
  projectId?: string
  project_name?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
}

interface Project {
  id: string
  name: string
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  todo: { label: 'To Do', color: 'text-surface-600', bg: 'bg-surface-100', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100', icon: Loader2 },
  blocked: { label: 'Blocked', color: 'text-red-700', bg: 'bg-red-100', icon: AlertTriangle },
  done: { label: 'Done', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-surface-600', bg: 'bg-surface-100' },
  medium: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' },
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' },
}

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'blocked', 'done']

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [tasksData, projectsData] = await Promise.all([
        api.getTasks(),
        api.getProjects(),
      ])
      setTasks(tasksData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createTask(data)
    await loadData()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateTask(id, data)
    await loadData()
    setEditingTask(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    setDeletingId(id)
    try {
      await api.deleteTask(id)
      await loadData()
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await api.patchTaskStatus(id, status)
    await loadData()
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || task.status === statusFilter)
  )

  const taskCounts = statusOrder.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status).length
      return acc
    },
    {} as Record<TaskStatus, number>
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage tasks across all your projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search tasks..."
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
            {statusOrder.map((status) => (
              <option key={status} value={status}>{statusConfig[status].label}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statusOrder.map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={cn(
                'card p-4 text-left transition-all hover:shadow-medium',
                statusFilter === status && 'ring-2 ring-brand-500'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
                  <Icon size={18} className={config.color} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-surface-900">{taskCounts[status]}</p>
                  <p className="text-xs text-surface-500">{config.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Tasks Table */}
      {!isLoading && filteredTasks.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <p className="font-medium text-surface-900">{task.title}</p>
                    </td>
                    <td>
                      {task.project_name ? (
                        <span className="text-sm text-surface-600">{task.project_name}</span>
                      ) : (
                        <span className="text-sm text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className={cn('badge cursor-pointer border-0', statusConfig[task.status].bg, statusConfig[task.status].color)}
                      >
                        {statusOrder.map((s) => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={cn('badge', priorityConfig[task.priority].bg, priorityConfig[task.priority].color)}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </td>
                    <td>
                      {task.dueDate ? (
                        <span className={cn(
                          'text-sm',
                          new Date(task.dueDate) < new Date() && task.status !== 'done'
                            ? 'text-red-600 font-medium'
                            : 'text-surface-600'
                        )}>
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-sm text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 hover:bg-surface-100 rounded"
                        >
                          <Edit2 size={14} className="text-surface-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={deletingId === task.id}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          {deletingId === task.id ? (
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

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <span className="ml-2 text-surface-500">Loading tasks...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tasks.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <ListTodo size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No tasks yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Create your first task to start organizing work and tracking progress.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-2" />
            <p className="text-surface-500">No tasks match your filters</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          projects={projects}
          onSubmit={(data) => editingTask ? handleUpdate(editingTask.id, data) : handleCreate(data)}
          onClose={() => { setShowCreateModal(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

function TaskForm({ task, projects, onSubmit, onClose }: {
  task?: Task
  projects: Project[]
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: task?.title || '',
    projectId: task?.projectId || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate?.split('T')[0] || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        projectId: form.projectId || undefined,
        dueDate: form.dueDate || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">{task ? 'Edit Task' : 'New Task'}</h2>
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
            <label className="block text-sm font-medium text-surface-700 mb-1">Project</label>
            <select
              className="input w-full"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
              <select
                className="input w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                {statusOrder.map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Priority</label>
              <select
                className="input w-full"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Due Date</label>
            <input
              type="date"
              className="input w-full"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
