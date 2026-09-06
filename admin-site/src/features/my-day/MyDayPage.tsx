import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { api } from '../../services/api'
import { getGreeting, formatDate, cn } from '../../lib/utils'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Plus,
  Loader2,
  ListTodo,
} from 'lucide-react'

interface Task {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low' | 'critical'
  status: 'todo' | 'in-progress' | 'blocked' | 'done'
  due_date?: string
  project_name?: string
}

export default function MyDayPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const data = await api.getTodayTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setSaving(true)
    try {
      await api.createTask({ title: newTaskTitle.trim(), priority: newTaskPriority })
      setNewTaskTitle('')
      setShowAddTask(false)
      await loadTasks()
    } finally {
      setSaving(false)
    }
  }

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      await api.patchTaskStatus(task.id, newStatus)
      await loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const highPriority = tasks.filter((t) => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'done')
  const mediumPriority = tasks.filter((t) => t.priority === 'medium' && t.status !== 'done')
  const lowPriority = tasks.filter((t) => t.priority === 'low' && t.status !== 'done')
  const completed = tasks.filter((t) => t.status === 'done')

  return (
    <div className="page-container max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-surface-900">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Founder'}
        </h1>
        <p className="text-surface-500 mt-1">{formatDate(new Date())}</p>
        <p className="text-surface-600 mt-2">
          {tasks.length === 0
            ? 'No tasks for today. Add one to get started.'
            : `You have ${highPriority.length} high-priority item${highPriority.length !== 1 ? 's' : ''} today.`
          }
        </p>
      </div>

      {/* Today's Tasks */}
      <div className="card mb-6">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" />
            <h2 className="font-semibold text-surface-900">Today</h2>
            <span className="text-sm text-surface-400">({tasks.length} tasks)</span>
          </div>
          <button className="btn-ghost text-sm" onClick={() => setShowAddTask(true)}>
            <Plus size={16} />
            Add task
          </button>
        </div>
        <div className="card-content">
          {/* Add task inline form */}
          {showAddTask && (
            <form onSubmit={handleAddTask} className="flex items-center gap-3 p-3 mb-4 bg-surface-50 rounded-lg border border-surface-200">
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                className="flex-1 bg-transparent outline-none text-sm"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="text-xs bg-white border border-surface-200 rounded px-2 py-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit" disabled={saving} className="btn-primary text-sm py-1">
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
              </button>
              <button type="button" onClick={() => setShowAddTask(false)} className="btn-ghost text-sm py-1">
                Cancel
              </button>
            </form>
          )}

          {tasks.length === 0 && !isLoading && (
            <div className="flex flex-col items-center py-12">
              <ListTodo size={32} className="text-surface-300 mb-3" />
              <p className="text-surface-500">No tasks for today</p>
              <button onClick={() => setShowAddTask(true)} className="btn-ghost text-sm mt-2">
                <Plus size={14} /> Add your first task
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-surface-400 animate-spin" />
            </div>
          )}

          {highPriority.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">
                High Priority
              </h3>
              <div className="space-y-2">
                {highPriority.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            </div>
          )}

          {mediumPriority.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-3">
                Medium Priority
              </h3>
              <div className="space-y-2">
                {mediumPriority.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            </div>
          )}

          {lowPriority.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
                Optional
              </h3>
              <div className="space-y-2">
                {lowPriority.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">
                Completed ({completed.length})
              </h3>
              <div className="space-y-2">
                {completed.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const priorityConfig = {
    critical: { label: 'Critical', class: 'bg-red-100 text-red-700' },
    high: { label: 'High', class: 'bg-red-100 text-red-700' },
    medium: { label: 'Med', class: 'bg-yellow-100 text-yellow-700' },
    low: { label: 'Low', class: 'bg-surface-100 text-surface-600' },
  }

  const isDone = task.status === 'done'

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
        isDone
          ? 'bg-surface-50 border-surface-100'
          : 'bg-white border-surface-200 hover:border-surface-300'
      )}
    >
      <button
        onClick={() => onToggle(task)}
        className={cn(
          'flex-shrink-0 transition-colors',
          isDone ? 'text-green-500' : 'text-surface-300 hover:text-surface-400'
        )}
      >
        {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            isDone ? 'text-surface-400 line-through' : 'text-surface-900'
          )}
        >
          {task.title}
        </p>
        {task.project_name && (
          <p className="text-xs text-surface-500 mt-0.5">{task.project_name}</p>
        )}
      </div>
      <span className={cn('px-2 py-0.5 rounded text-2xs font-medium', priorityConfig[task.priority]?.class)}>
        {priorityConfig[task.priority]?.label || task.priority}
      </span>
    </div>
  )
}
