import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { formatCurrency, getRelativeTime, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  DollarSign,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  FolderPlus,
  X,
  Loader2,
  Clock,
} from 'lucide-react'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  stage: 'new' | 'contacted' | 'proposal_sent' | 'won' | 'active' | 'archived'
  estimated_value?: number
  source?: string
  service_interested?: string
  notes?: string
  created_at: string
  updated_at?: string
}

const STAGES = [
  { id: 'new', label: 'New Lead', color: 'border-blue-500/80 bg-blue-50/30 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300' },
  { id: 'contacted', label: 'Contacted', color: 'border-purple-500/80 bg-purple-50/30 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'border-amber-500/80 bg-amber-50/30 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' },
  { id: 'won', label: 'Won / Signed', color: 'border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' },
  { id: 'active', label: 'Active Retainer', color: 'border-cyan-500/80 bg-cyan-50/30 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300' },
  { id: 'archived', label: 'Archived / Lost', color: 'border-slate-400/80 bg-slate-50/30 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400' },
]

export default function PipelinePage() {
  const [searchParams] = useSearchParams()
  const [pipeline, setPipeline] = useState<Record<string, Client[]>>({})
  const [stats, setStats] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [convertingClient, setConvertingClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadPipeline()
    if (searchParams.get('new') === 'true') {
      setShowCreateModal(true)
    }
  }, [searchParams])

  const loadPipeline = async () => {
    try {
      setIsLoading(true)
      const data = await api.getPipeline()
      setPipeline(data.stages || {})
      setStats(data.stats || [])
      setTotalCount(data.totalCount || 0)
    } catch (err) {
      console.error('Failed to load pipeline:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStageChange = async (client: Client, newStage: string) => {
    // Optimistic UI update
    const currentStage = client.stage
    if (currentStage === newStage) return

    setPipeline((prev) => {
      const sourceList = (prev[currentStage] || []).filter((c) => c.id !== client.id)
      const targetList = [...(prev[newStage] || []), { ...client, stage: newStage as any }]
      return {
        ...prev,
        [currentStage]: sourceList,
        [newStage]: targetList,
      }
    })

    try {
      await api.updateClient(client.id, { stage: newStage })
      loadPipeline()
    } catch (err) {
      console.error('Failed to move stage:', err)
      loadPipeline()
    }
  }

  const handleSaveClient = async (data: Partial<Client>) => {
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, data)
      } else {
        await api.createClient(data)
      }
      setShowCreateModal(false)
      setEditingClient(null)
      loadPipeline()
    } catch (err) {
      console.error('Failed to save client:', err)
      alert('Failed to save client. Please check input.')
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return
    try {
      setDeletingId(id)
      await api.deleteClient(id)
      loadPipeline()
    } catch (err) {
      console.error('Failed to delete client:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleConvertToProject = async (client: Client) => {
    try {
      await api.createProject({
        name: `${client.company || client.name} Build`,
        customerId: client.id,
        clientName: client.company || client.name,
        budget: client.estimated_value || 0,
        status: 'active',
        progress: 0,
        description: client.notes || `Deliverable for ${client.name}`,
      })
      alert(`Project successfully initialized for ${client.name}!`)
      setConvertingClient(null)
    } catch (err) {
      console.error('Failed to initialize project:', err)
      alert('Failed to initialize project.')
    }
  }

  const filterClients = (list: Client[] = []) => {
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.service_interested && c.service_interested.toLowerCase().includes(q))
    )
  }

  const totalValue = stats.reduce((sum, s) => sum + (s.totalValue || 0), 0)

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Client Pipeline</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-semibold">
              {totalCount} Total
            </span>
          </div>
          <p className="page-subtitle">
            Track founder inquiries from first touch to signed contracts and active builds • Pipeline Value: {formatCurrency(totalValue)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-52 sm:w-64 text-xs h-9"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs h-9 px-3"
          >
            <Plus size={15} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {STAGES.map((stage, stageIdx) => {
          const stageClients = filterClients(pipeline[stage.id] || [])
          const stageStats = stats.find((s) => s.stage === stage.id)
          const stageTotal = stageStats?.totalValue || 0

          return (
            <div
              key={stage.id}
              className="w-80 shrink-0 flex flex-col bg-surface-100/70 dark:bg-surface-900/60 rounded-xl border border-surface-200 dark:border-surface-800 max-h-[calc(100vh-220px)]"
            >
              {/* Stage Header */}
              <div className={cn('p-3.5 border-t-2 rounded-t-xl flex items-center justify-between border-b border-surface-200 dark:border-surface-800', stage.color)}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-surface-900 dark:text-surface-100 uppercase tracking-wide">
                    {stage.label}
                  </span>
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-surface-800 font-bold text-surface-700 dark:text-surface-300">
                    {stageClients.length}
                  </span>
                </div>
                <span className="text-2xs font-semibold text-surface-600 dark:text-surface-400">
                  {stageTotal > 0 ? formatCurrency(stageTotal) : '—'}
                </span>
              </div>

              {/* Cards Column */}
              <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
                {stageClients.length === 0 ? (
                  <div className="h-28 border border-dashed border-surface-300 dark:border-surface-700 rounded-lg flex items-center justify-center text-2xs text-surface-400">
                    No clients in stage
                  </div>
                ) : (
                  stageClients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white dark:bg-surface-800/90 rounded-lg p-3.5 border border-surface-200/80 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                      {/* Top row: Name & Quick stage shift */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-surface-900 dark:text-surface-100 truncate">
                            {client.name}
                          </h4>
                          {client.company && (
                            <div className="flex items-center gap-1 text-2xs text-surface-500 dark:text-surface-400 mt-0.5 truncate">
                              <Building2 size={11} />
                              <span className="truncate">{client.company}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions menu */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingClient(client)}
                            className="p-1 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                            title="Edit Client"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-1 rounded text-surface-400 hover:text-red-600"
                            title="Delete Client"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Service & Budget badge */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        {client.service_interested && (
                          <span className="text-2xs px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-medium">
                            {client.service_interested}
                          </span>
                        )}
                        {client.estimated_value !== undefined && client.estimated_value > 0 && (
                          <span className="text-2xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                            <DollarSign size={10} />
                            {client.estimated_value.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Contact shortcuts */}
                      <div className="mt-2.5 pt-2 border-t border-surface-100 dark:border-surface-700/60 flex items-center justify-between text-2xs text-surface-400">
                        <div className="flex items-center gap-2">
                          {client.email && (
                            <a
                              href={`mailto:${client.email}`}
                              className="hover:text-brand-600 dark:hover:text-brand-400"
                              title={client.email}
                            >
                              <Mail size={12} />
                            </a>
                          )}
                          {client.phone && (
                            <a
                              href={`tel:${client.phone}`}
                              className="hover:text-brand-600 dark:hover:text-brand-400"
                              title={client.phone}
                            >
                              <Phone size={12} />
                            </a>
                          )}
                          <span className="text-3xs text-surface-400">
                            {getRelativeTime(client.created_at)}
                          </span>
                        </div>

                        {/* Stage Transition Steppers */}
                        <div className="flex items-center gap-0.5">
                          {stageIdx > 0 && (
                            <button
                              onClick={() => handleStageChange(client, STAGES[stageIdx - 1].id)}
                              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                              title={`Move back to ${STAGES[stageIdx - 1].label}`}
                            >
                              <ChevronLeft size={13} />
                            </button>
                          )}
                          {stageIdx < STAGES.length - 1 && (
                            <button
                              onClick={() => handleStageChange(client, STAGES[stageIdx + 1].id)}
                              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                              title={`Move forward to ${STAGES[stageIdx + 1].label}`}
                            >
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Won action: Convert to project button */}
                      {(stage.id === 'won' || stage.id === 'active') && (
                        <button
                          onClick={() => handleConvertToProject(client)}
                          className="mt-2.5 w-full py-1 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/80 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 text-2xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <FolderPlus size={12} />
                          <span>Initialize Project Deliverable</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Client Modal (Create or Edit) */}
      {(showCreateModal || editingClient) && (
        <ClientModal
          client={editingClient || undefined}
          onSave={handleSaveClient}
          onClose={() => {
            setShowCreateModal(false)
            setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}

function ClientModal({
  client,
  onSave,
  onClose,
}: {
  client?: Client
  onSave: (data: Partial<Client>) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(client?.name || '')
  const [email, setEmail] = useState(client?.email || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [company, setCompany] = useState(client?.company || '')
  const [stage, setStage] = useState(client?.stage || 'new')
  const [estimatedValue, setEstimatedValue] = useState(client?.estimated_value ? String(client.estimated_value) : '')
  const [serviceInterested, setServiceInterested] = useState(client?.service_interested || 'Full-Stack Architecture')
  const [notes, setNotes] = useState(client?.notes || '')
  const [source, setSource] = useState(client?.source || 'website')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Client name is required')
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        name,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        stage: stage as any,
        estimated_value: estimatedValue ? Number(estimatedValue) : 0,
        service_interested: serviceInterested || undefined,
        notes: notes || undefined,
        source,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
            {client ? 'Edit Client Relationship' : 'Create New Client'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Dynamics"
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 ..."
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="input w-full"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Estimated Value ($ USD)
              </label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="25000"
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Service / Scope
              </label>
              <input
                type="text"
                value={serviceInterested}
                onChange={(e) => setServiceInterested(e.target.value)}
                placeholder="e.g. AI-Powered FinTech Core"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Inbound Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="website, referral, linkedin"
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Founder Notes / Technical Requirements
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key project requirements, stakeholder timeline, budget flexibility..."
              className="input w-full resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline text-xs h-9 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs h-9 px-4"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {client ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
