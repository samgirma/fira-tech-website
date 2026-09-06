import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, formatCurrency, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Building2,
  DollarSign,
  X,
  Loader2,
  Trash2,
  Edit2,
} from 'lucide-react'

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'

interface Lead {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  serviceInterested?: string
  source?: string
  estimatedValue?: number
  status: LeadStatus
  lastContact?: string
  nextAction?: string
  createdAt: string
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-100' },
  contacted: { label: 'Contacted', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  qualified: { label: 'Qualified', color: 'text-green-700', bg: 'bg-green-100' },
  proposal: { label: 'Proposal', color: 'text-purple-700', bg: 'bg-purple-100' },
  negotiation: { label: 'Negotiation', color: 'text-orange-700', bg: 'bg-orange-100' },
  won: { label: 'Won', color: 'text-green-700', bg: 'bg-green-100' },
  lost: { label: 'Lost', color: 'text-red-700', bg: 'bg-red-100' },
}

const pipelineStages: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setIsLoading(true)
      const data = await api.getLeads()
      setLeads(data)
    } catch (error) {
      console.error('Failed to load leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createLead(data)
    await loadLeads()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateLead(id, data)
    await loadLeads()
    setEditingLead(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    setDeletingId(id)
    try {
      await api.deleteLead(id)
      await loadLeads()
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await api.updateLead(id, { status })
    await loadLeads()
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Track and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
          <div className="flex bg-surface-100 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                view === 'kanban' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600'
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                view === 'table' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600'
              )}
            >
              Table
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {pipelineStages.map((stage) => {
          const count = leads.filter((l) => l.status === stage).length
          const value = leads
            .filter((l) => l.status === stage)
            .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
          return (
            <div key={stage} className="text-center p-3 rounded-lg bg-white border border-surface-200">
              <p className="text-2xl font-semibold text-surface-900">{count}</p>
              <p className="text-xs text-surface-500 mt-1">{statusConfig[stage].label}</p>
              {value > 0 && (
                <p className="text-xs text-surface-400 mt-1">{formatCurrency(value)}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage)
            return (
              <div key={stage} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-2 h-2 rounded-full', statusConfig[stage].bg)} />
                  <h3 className="text-sm font-medium text-surface-700">{statusConfig[stage].label}</h3>
                  <span className="text-xs text-surface-400">({stageLeads.length})</span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={handleStatusChange}
                      onEdit={setEditingLead}
                      onDelete={handleDelete}
                      isDeleting={deletingId === lead.id}
                    />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-surface-200 rounded-lg text-center">
                      <p className="text-sm text-surface-400">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Last Contact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div>
                        <p className="font-medium text-surface-900">{lead.name}</p>
                        <p className="text-xs text-surface-500">{lead.email}</p>
                      </div>
                    </td>
                    <td>{lead.company || '-'}</td>
                    <td>{lead.serviceInterested || '-'}</td>
                    <td>
                      <span className={cn('badge', statusConfig[lead.status].bg, statusConfig[lead.status].color)}>
                        {statusConfig[lead.status].label}
                      </span>
                    </td>
                    <td>{lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '-'}</td>
                    <td>{lead.lastContact ? formatDate(lead.lastContact) : '-'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-1 hover:bg-surface-100 rounded"
                        >
                          <Edit2 size={14} className="text-surface-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          {deletingId === lead.id ? (
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

      {/* Empty State */}
      {!isLoading && leads.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">Your pipeline is empty</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Add your first lead to start tracking opportunities and managing your sales pipeline.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Lead
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingLead) && (
        <LeadForm
          lead={editingLead || undefined}
          onSubmit={(data) => editingLead ? handleUpdate(editingLead.id, data) : handleCreate(data)}
          onClose={() => { setShowCreateModal(false); setEditingLead(null) }}
        />
      )}
    </div>
  )
}

function LeadCard({ lead, onStatusChange, onEdit, onDelete, isDeleting }: {
  lead: Lead
  onStatusChange: (id: string, status: LeadStatus) => void
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const nextStatus = (current: LeadStatus): LeadStatus | null => {
    const idx = pipelineStages.indexOf(current)
    return idx < pipelineStages.length - 1 ? pipelineStages[idx + 1] : null
  }

  const next = nextStatus(lead.status)

  return (
    <div className="card p-3 hover:shadow-medium transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900 truncate">{lead.name}</p>
          {lead.company && (
            <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
              <Building2 size={12} />
              {lead.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(lead)} className="p-1 hover:bg-surface-100 rounded">
            <Edit2 size={12} className="text-surface-400" />
          </button>
          <button
            onClick={() => onDelete(lead.id)}
            disabled={isDeleting}
            className="p-1 hover:bg-red-50 rounded"
          >
            {isDeleting ? (
              <Loader2 size={12} className="text-red-400 animate-spin" />
            ) : (
              <Trash2 size={12} className="text-surface-400" />
            )}
          </button>
        </div>
      </div>
      {lead.serviceInterested && (
        <p className="text-xs text-surface-600 mb-2">{lead.serviceInterested}</p>
      )}
      <div className="flex items-center justify-between">
        {lead.estimatedValue && (
          <span className="text-xs font-medium text-surface-700">
            {formatCurrency(lead.estimatedValue)}
          </span>
        )}
        {next && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(lead.id, next)
            }}
            className="text-2xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Move to {statusConfig[next].label}
          </button>
        )}
      </div>
    </div>
  )
}

function LeadForm({ lead, onSubmit, onClose }: {
  lead?: Lead
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: lead?.name || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    serviceInterested: lead?.serviceInterested || '',
    source: lead?.source || '',
    estimatedValue: lead?.estimatedValue?.toString() || '',
    status: lead?.status || 'new',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">{lead ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
            <input type="text" required className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Company</label>
              <input type="text" className="input w-full" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
              <input type="email" className="input w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Phone</label>
              <input type="text" className="input w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Source</label>
              <input type="text" className="input w-full" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Service Interested In</label>
              <input type="text" className="input w-full" value={form.serviceInterested} onChange={(e) => setForm({ ...form, serviceInterested: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Estimated Value (ETB)</label>
              <input type="number" className="input w-full" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
            <select className="input w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}>
              {pipelineStages.map((s) => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : lead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
