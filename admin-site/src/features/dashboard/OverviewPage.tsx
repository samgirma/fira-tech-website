import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { api } from '../../services/api'
import { getGreeting, formatDate, formatCurrency, getRelativeTime, cn } from '../../lib/utils'
import {
  Users,
  FolderKanban,
  Inbox,
  DollarSign,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react'

export default function OverviewPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [finance, setFinance] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const [leadsData, projectsData, tasksData, messagesData, financeData] = await Promise.allSettled([
        api.getLeads(),
        api.getProjects(),
        api.getTodayTasks(),
        api.getContactMessages(),
        api.getFinanceOverview(),
      ])

      if (leadsData.status === 'fulfilled') setLeads(leadsData.value)
      if (projectsData.status === 'fulfilled') setProjects(projectsData.value)
      if (tasksData.status === 'fulfilled') setTasks(tasksData.value)
      if (messagesData.status === 'fulfilled') setMessages(messagesData.value)
      if (financeData.status === 'fulfilled') setFinance(financeData.value)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const unreadMessages = messages.filter((m: any) => !m.is_read).length
  const activeProjects = projects.filter((p: any) => p.status === 'active').length
  const highPriorityTasks = tasks.filter((t: any) => (t.priority === 'high' || t.priority === 'critical') && t.status !== 'done')
  const newLeads = leads.filter((l: any) => l.status === 'new')
  const totalRevenue = finance?.totalRevenue || 0
  const totalExpenses = finance?.totalExpenses || 0

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-surface-900">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Founder'}
        </h1>
        <p className="text-surface-500 mt-1">{formatDate(new Date())}</p>
        <p className="text-surface-600 mt-2">
          {newLeads.length > 0
            ? `You have ${newLeads.length} new lead${newLeads.length !== 1 ? 's' : ''} and ${highPriorityTasks.length} high-priority task${highPriorityTasks.length !== 1 ? 's' : ''}.`
            : highPriorityTasks.length > 0
            ? `You have ${highPriorityTasks.length} high-priority task${highPriorityTasks.length !== 1 ? 's' : ''} today.`
            : 'Your pipeline is looking good.'
          }
        </p>
      </div>

      {/* Business Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="New Leads"
          value={String(newLeads.length)}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active Projects"
          value={String(activeProjects)}
          icon={FolderKanban}
          color="purple"
        />
        <StatCard
          label="Pending Requests"
          value={String(unreadMessages)}
          icon={Inbox}
          color="orange"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Priorities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Priorities */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-surface-900">Today's Priorities</h2>
            </div>
            <div className="card-content space-y-3">
              {highPriorityTasks.length > 0 && highPriorityTasks.slice(0, 4).map((task: any) => (
                <PriorityItem
                  key={task.id}
                  icon={AlertCircle}
                  color="red"
                  title={task.title}
                  subtitle={task.project_name || 'No project'}
                  action="View"
                  href="/tasks"
                />
              ))}
              {newLeads.length > 0 && newLeads.slice(0, 2).map((lead: any) => (
                <PriorityItem
                  key={lead.id}
                  icon={Users}
                  color="blue"
                  title={`Follow up: ${lead.name}`}
                  subtitle={lead.company || lead.serviceInterested || 'New lead'}
                  action="View lead"
                  href="/business/leads"
                />
              ))}
              {unreadMessages > 0 && (
                <PriorityItem
                  icon={FileText}
                  color="yellow"
                  title={`${unreadMessages} unread message${unreadMessages !== 1 ? 's' : ''}`}
                  subtitle="Contact requests"
                  action="View"
                  href="/business/requests"
                />
              )}
              {highPriorityTasks.length === 0 && newLeads.length === 0 && unreadMessages === 0 && (
                <div className="text-center py-8 text-surface-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2" />
                  <p className="text-sm">All caught up! No urgent items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Health */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900">Project Health</h2>
              <a href="/projects" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </a>
            </div>
            <div className="card-content">
              {projects.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-4">No projects yet</p>
              ) : (
                <div className="space-y-4">
                  {projects.filter((p: any) => p.status !== 'cancelled').slice(0, 4).map((project: any) => (
                    <ProjectRow
                      key={project.id}
                      name={project.name}
                      client={project.clientName || project.customerName || ''}
                      progress={project.progress || 0}
                      status={project.status}
                      deadline={project.deadline}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Quick Stats */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-surface-900">Recent Activity</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {leads.slice(0, 3).map((lead: any) => (
                  <div key={lead.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-sm text-surface-700">New lead: {lead.name}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {getRelativeTime(lead.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {messages.slice(0, 2).map((msg: any) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                    <div>
                      <p className="text-sm text-surface-700">Message from {msg.name}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {getRelativeTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && messages.length === 0 && (
                  <p className="text-sm text-surface-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card bg-gradient-to-br from-brand-50 to-white">
            <div className="card-header border-brand-100">
              <h2 className="text-lg font-semibold text-surface-900">Financial Summary</h2>
            </div>
            <div className="card-content space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-600">Revenue</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-600">Expenses</span>
                <span className="text-sm font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-brand-100">
                <span className="text-sm font-medium text-surface-900">Net</span>
                <span className={cn('text-sm font-semibold', totalRevenue - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatCurrency(totalRevenue - totalExpenses)}
                </span>
              </div>
              {finance?.outstandingInvoices > 0 && (
                <div className="p-3 bg-white rounded-lg border border-brand-100">
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Outstanding</p>
                  <p className="text-sm text-surface-700 mt-1">
                    {formatCurrency(finance.outstandingInvoices)} in unpaid invoices
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: string
  icon: React.ComponentType<any>
  color: 'green' | 'blue' | 'purple' | 'orange'
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-surface-900">{value}</p>
      <p className="text-sm text-surface-500 mt-1">{label}</p>
    </div>
  )
}

function PriorityItem({ icon: Icon, color, title, subtitle, action, href }: {
  icon: React.ComponentType<any>
  color: 'red' | 'yellow' | 'blue' | 'purple'
  title: string
  subtitle: string
  action: string
  href: string
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50 transition-colors">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 truncate">{title}</p>
        <p className="text-xs text-surface-500">{subtitle}</p>
      </div>
      <a href={href} className="text-sm text-brand-600 hover:text-brand-700 font-medium whitespace-nowrap">
        {action}
      </a>
    </div>
  )
}

function ProjectRow({ name, client, progress, status, deadline }: {
  name: string
  client: string
  progress: number
  status: string
  deadline?: string
}) {
  const statusConfig: Record<string, { label: string; class: string }> = {
    planning: { label: 'Planning', class: 'bg-surface-100 text-surface-600' },
    active: { label: 'Active', class: 'bg-green-100 text-green-700' },
    'on-hold': { label: 'On Hold', class: 'bg-yellow-100 text-yellow-700' },
    'at-risk': { label: 'At Risk', class: 'bg-orange-100 text-orange-700' },
    completed: { label: 'Completed', class: 'bg-blue-100 text-blue-700' },
  }

  const config = statusConfig[status] || statusConfig.planning

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-surface-900 truncate">{name}</p>
          <span className={cn('badge text-2xs', config.class)}>{config.label}</span>
        </div>
        {client && <p className="text-xs text-surface-500 mt-0.5">{client}</p>}
      </div>
      <div className="w-24">
        <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full',
              status === 'completed' ? 'bg-green-500' :
              status === 'at-risk' ? 'bg-orange-500' :
              'bg-brand-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {deadline && (
        <div className="text-xs text-surface-500 w-16 text-right">{formatDate(deadline)}</div>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="h-4 w-32 skeleton rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="h-10 w-10 skeleton rounded-lg mb-3" />
            <div className="h-8 w-24 skeleton rounded mb-2" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-content space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 skeleton rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 skeleton rounded mb-2" />
                  <div className="h-3 w-32 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-content space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-2 w-2 skeleton rounded-full mt-2" />
                <div className="flex-1">
                  <div className="h-4 w-40 skeleton rounded mb-1" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
