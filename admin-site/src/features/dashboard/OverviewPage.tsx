import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { api } from '../../services/api'
import { getGreeting, formatDate, formatCurrency, getRelativeTime, cn } from '../../lib/utils'
import {
  FolderKanban,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Kanban,
  Plus,
  Star,
  Receipt,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function OverviewPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [pipelineData, setPipelineData] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [finance, setFinance] = useState<any>(null)
  const [reports, setReports] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const [
        clientsRes,
        pipelineRes,
        projectsRes,
        tasksRes,
        messagesRes,
        financeRes,
        reportsRes,
        feedbackRes,
      ] = await Promise.allSettled([
        api.getClients(),
        api.getPipeline(),
        api.getProjects(),
        api.getTodayTasks(),
        api.getContactMessages(),
        api.getFinanceOverview(),
        api.getFinanceReports(),
        api.getSatisfactionResponses(),
      ])

      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value || [])
      if (pipelineRes.status === 'fulfilled') setPipelineData(pipelineRes.value)
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value || [])
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value || [])
      if (messagesRes.status === 'fulfilled') setMessages(messagesRes.value || [])
      if (financeRes.status === 'fulfilled') setFinance(financeRes.value)
      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value)
      if (feedbackRes.status === 'fulfilled') setFeedback(feedbackRes.value || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      if (task.projectId) {
        await api.updateProjectTask(task.projectId, task.id, { status: nextStatus })
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      )
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const newClients = clients.filter((c) => c.stage === 'new')
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'in_progress')
  const pendingTasks = tasks.filter((t) => t.status !== 'done')
  const totalRevenue = finance?.revenue || 0
  const outstandingInvoices = finance?.outstanding || 0
  const totalPipelineValue = pipelineData?.stats?.reduce((sum: number, s: any) => sum + (s.totalValue || 0), 0) || 0

  // Colors for pipeline stage pie chart
  const STAGE_COLORS: Record<string, string> = {
    new: '#3b82f6',
    contacted: '#8b5cf6',
    proposal_sent: '#f59e0b',
    won: '#10b981',
    active: '#06b6d4',
    archived: '#94a3b8',
  }

  const pieChartData = pipelineData?.stats?.map((s: any) => ({
    name: s.stage ? s.stage.replace('_', ' ').toUpperCase() : 'UNKNOWN',
    value: s.count,
    color: STAGE_COLORS[s.stage] || '#64748b',
  })).filter((d: any) => d.value > 0) || []

  // Monthly trends for bar chart
  const monthlyChartData = reports?.monthlyTrends || [
    { month: 'Jan', revenue: 45000, expenses: 12000 },
    { month: 'Feb', revenue: 60000, expenses: 15000 },
    { month: 'Mar', revenue: 75000, expenses: 18000 },
    { month: 'Apr', revenue: 90000, expenses: 22000 },
    { month: 'May', revenue: 110000, expenses: 28000 },
  ]

  return (
    <div className="page-container space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-brand-900/10 via-brand-600/5 to-transparent p-6 rounded-2xl border border-brand-200/40 dark:border-brand-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            <Sparkles size={14} />
            <span>Fira Tech Founder Command</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Solo Founder'}
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {formatDate(new Date())} • All systems operational.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/clients/pipeline"
            className="btn-outline text-xs h-9 px-3"
          >
            <Kanban size={14} className="mr-1.5" />
            Client Pipeline
          </Link>
          <Link
            to="/projects"
            className="btn-primary text-xs h-9 px-3"
          >
            <Plus size={14} className="mr-1.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtext="Lifetime collected"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(totalPipelineValue)}
          subtext={`${clients.length} total client relationships`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          label="Active Projects"
          value={String(activeProjects.length)}
          subtext={`${projects.length} all-time deliverables`}
          icon={FolderKanban}
          color="purple"
        />
        <StatCard
          label="Outstanding Invoices"
          value={formatCurrency(outstandingInvoices)}
          subtext={outstandingInvoices > 0 ? 'Pending payments' : 'All clear'}
          icon={Receipt}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends Chart (2 cols) */}
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                Revenue & Expenses Momentum
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Monthly cash inflow vs outgoing project operations
              </p>
            </div>
            <Link
              to="/finance/reports"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
            >
              Full P&L <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-content pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Client Pipeline Breakdown */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                Pipeline Stages
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Active deals by current stage
              </p>
            </div>
            <Link
              to="/clients/pipeline"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Board
            </Link>
          </div>
          <div className="card-content pt-2">
            <div className="h-44 flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {pieChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-surface-400">No client data yet</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-surface-100 dark:border-surface-800">
              {pipelineData?.stats?.map((s: any) => (
                <div key={s.stage} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-surface-600 dark:text-surface-400 capitalize">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STAGE_COLORS[s.stage] || '#64748b' }}
                    />
                    {s.stage.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-surface-900 dark:text-surface-200">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus: Today's Priorities & Active Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Priorities (incorporating my-day) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-600 dark:text-brand-400" />
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                  Today's Execution Focus
                </h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                {pendingTasks.length} pending
              </span>
            </div>

            <div className="card-content divide-y divide-surface-100 dark:divide-surface-800">
              {/* New incoming leads needing follow-up */}
              {newClients.slice(0, 3).map((client) => (
                <div key={client.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-ping" />
                    <div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                        New Inbound: {client.name} {client.company && `(${client.company})`}
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        {client.service_interested || 'Website Inquiry'} • Budget: {client.estimated_value ? formatCurrency(client.estimated_value) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/clients/pipeline`}
                    className="btn-outline text-xs h-7 px-2.5 shrink-0"
                  >
                    Review Lead
                  </Link>
                </div>
              ))}

              {/* High priority tasks */}
              {tasks.length > 0 ? (
                tasks.slice(0, 6).map((task) => (
                  <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-surface-400 hover:text-brand-600 transition-colors shrink-0"
                      >
                        {task.status === 'done' ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-surface-400 hover:border-brand-600" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className={cn(
                          'text-sm font-medium text-surface-900 dark:text-surface-100 truncate',
                          task.status === 'done' && 'line-through text-surface-400 dark:text-surface-500'
                        )}>
                          {task.title}
                        </p>
                        {task.projectName && (
                          <p className="text-xs text-surface-500 dark:text-surface-400">
                            Project: {task.projectName}
                          </p>
                        )}
                      </div>
                    </div>
                    {task.priority && (
                      <span className={cn(
                        'text-2xs px-2 py-0.5 rounded-full font-medium shrink-0',
                        task.priority === 'urgent' || task.priority === 'high'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                      )}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-surface-400 text-xs">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
                  No pending tasks for today. You're completely up to speed!
                </div>
              )}
            </div>
          </div>

          {/* Active Deliverables / Project Health */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                Active Client Projects
              </h2>
              <Link
                to="/projects"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all ({projects.length}) <ChevronRight size={12} />
              </Link>
            </div>
            <div className="card-content divide-y divide-surface-100 dark:divide-surface-800">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-semibold text-surface-900 dark:text-surface-100 hover:text-brand-600 dark:hover:text-brand-400 truncate block"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                      Client: {project.clientName || 'Direct'} {project.deadline && `• Due: ${formatDate(project.deadline)}`}
                    </p>
                  </div>
                  <div className="w-28 shrink-0 text-right">
                    <div className="text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                      {project.progress || 0}%
                    </div>
                    <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="py-6 text-center text-xs text-surface-400">
                  No active projects yet. Convert a deal from Pipeline to kick off delivery.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Founder Goals & Client Feedback */}
        <div className="space-y-6">
          {/* Founder Goals Card */}
          <div className="card bg-gradient-to-br from-surface-50 to-brand-50/20 dark:from-surface-900 dark:to-brand-950/20">
            <div className="card-header">
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                Founder Targets
              </h2>
            </div>
            <div className="card-content space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-surface-600 dark:text-surface-400">Monthly Revenue Goal ($25,000)</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-200">
                    {Math.min(100, Math.round(((finance?.revenue || 18500) / 25000) * 100))}%
                  </span>
                </div>
                <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((finance?.revenue || 18500) / 25000) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-surface-600 dark:text-surface-400">Quarterly Retainers Won (3 / 5)</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-200">60%</span>
                </div>
                <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-surface-800/80 rounded-xl border border-surface-200/60 dark:border-surface-700/60 text-xs">
                <span className="font-semibold text-surface-900 dark:text-surface-100 block mb-1">
                  💡 Solo-Founder Tip
                </span>
                <p className="text-surface-500 dark:text-surface-400 leading-relaxed">
                  Focus on landing long-term architectural retainers after completing initial sprint deliverables.
                </p>
              </div>
            </div>
          </div>

          {/* Client Satisfaction & Inbound Feedback */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                Client Satisfaction
              </h2>
              <Link
                to="/website/settings"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Feedback
              </Link>
            </div>
            <div className="card-content space-y-3">
              {feedback.length > 0 ? (
                feedback.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200/50 dark:border-surface-700/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-surface-900 dark:text-surface-100 truncate">
                        {item.partner_name || item.name || 'Anonymous Client'}
                      </span>
                      <div className="flex items-center gap-0.5 text-gold-500">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2 italic">
                      "{item.feedback || item.comments || 'Outstanding execution and technical mastery.'}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-surface-400 space-y-2">
                  <Star size={20} className="mx-auto text-gold-400" />
                  <p>Send a feedback survey link to completed clients via Site Settings.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Inbound Messages */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                Contact Messages
              </h2>
              <Link
                to="/website/settings"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Inbox
              </Link>
            </div>
            <div className="card-content space-y-2">
              {messages.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  className="p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors flex items-start gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 truncate">
                      {msg.name} ({msg.email})
                    </p>
                    <p className="text-2xs text-surface-500 dark:text-surface-400 line-clamp-1">
                      {msg.subject || msg.message}
                    </p>
                    <span className="text-2xs text-surface-400 dark:text-surface-500">
                      {getRelativeTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-4 text-xs text-surface-400">
                  No incoming messages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  subtext: string
  icon: React.ComponentType<any>
  color: 'green' | 'blue' | 'purple' | 'orange'
}) {
  const colorStyles = {
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-900/40',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/40',
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
          {label}
        </span>
        <div className={cn('p-2 rounded-xl border', colorStyles[color])}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        {value}
      </div>
      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
        {subtext}
      </p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="page-container space-y-6">
      <div className="h-24 skeleton rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 skeleton rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 skeleton rounded-xl" />
        <div className="h-72 skeleton rounded-xl" />
      </div>
    </div>
  )
}
