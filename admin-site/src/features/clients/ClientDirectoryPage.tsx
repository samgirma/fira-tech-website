import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatCurrency, formatDate, cn } from '../../lib/utils'
import {
  Search,
  Plus,
  Mail,
  Phone,
  Building2,
  Edit2,
  Trash2,
  X,
  Loader2,
  FolderPlus,
  Kanban,
  FileText,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Client } from './PipelinePage'

const STAGE_CONFIG: Record<string, { label: string; class: string }> = {
  new: { label: 'New Lead', class: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  contacted: { label: 'Contacted', class: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  proposal_sent: { label: 'Proposal Sent', class: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  won: { label: 'Won / Signed', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  active: { label: 'Active Retainer', class: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
  archived: { label: 'Archived', class: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
}

export default function ClientDirectoryPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingNotesClient, setViewingNotesClient] = useState<Client | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      const data = await api.getClients()
      setClients(data)
    } catch (err) {
      console.error('Failed to load clients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this client?')) return
    try {
      setDeletingId(id)
      await api.deleteClient(id)
      await loadClients()
    } catch (err) {
      console.error('Failed to delete client:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, data)
      } else {
        await api.createClient(data)
      }
      setShowModal(false)
      setEditingClient(null)
      await loadClients()
    } catch (err) {
      console.error('Failed to save client:', err)
      alert('Failed to save client.')
    }
  }

  const handleStageChange = async (clientId: string, newStage: string) => {
    try {
      await api.updateClient(clientId, { stage: newStage })
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, stage: newStage as any } : c))
      )
    } catch (err) {
      console.error('Failed to update client stage:', err)
    }
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.service_interested && c.service_interested.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStage = stageFilter === 'all' || c.stage === stageFilter

    return matchesSearch && matchesStage
  })

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Client Directory</h1>
          <p className="page-subtitle">
            All customer accounts, stakeholders, contacts, and relationship records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/clients/pipeline" className="btn-outline text-xs h-9 px-3">
            <Kanban size={15} className="mr-1.5" />
            <span>Kanban Pipeline</span>
          </Link>
          <button
            onClick={() => {
              setEditingClient(null)
              setShowModal(true)
            }}
            className="btn-primary text-xs h-9 px-3"
          >
            <Plus size={15} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 font-medium whitespace-nowrap">
            Filter Stage:
          </span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="input text-xs h-9"
          >
            <option value="all">All Stages ({clients.length})</option>
            <option value="new">New Lead</option>
            <option value="contacted">Contacted</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="won">Won / Signed</option>
            <option value="active">Active Retainer</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Client & Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Estimated Value</th>
                <th className="py-3 px-4">Service Scope</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredClients.map((client) => {
                const stageConf = STAGE_CONFIG[client.stage] || STAGE_CONFIG.new
                return (
                  <tr
                    key={client.id}
                    className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-surface-900 dark:text-surface-100">
                        {client.name}
                      </div>
                      {client.company && (
                        <div className="text-surface-500 flex items-center gap-1 mt-0.5">
                          <Building2 size={11} />
                          <span>{client.company}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="flex items-center gap-1 text-surface-700 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          <Mail size={12} className="text-surface-400" />
                          <span>{client.email}</span>
                        </a>
                      ) : (
                        <span className="text-surface-400">—</span>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1 text-surface-500 mt-0.5">
                          <Phone size={11} className="text-surface-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={client.stage}
                        onChange={(e) => handleStageChange(client.id, e.target.value)}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-2xs font-semibold cursor-pointer border-0',
                          stageConf.class
                        )}
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="won">Won / Signed</option>
                        <option value="active">Active Retainer</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">
                      {client.estimated_value ? formatCurrency(client.estimated_value) : '—'}
                    </td>

                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                      {client.service_interested || 'Website Inquiry'}
                    </td>

                    <td className="py-3 px-4 text-surface-500">
                      {formatDate(client.created_at)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {client.notes && (
                          <button
                            onClick={() => setViewingNotesClient(client)}
                            className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded text-surface-400 hover:text-surface-700"
                            title="View Requirements / Notes"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingClient(client)
                            setShowModal(true)
                          }}
                          className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded text-surface-400 hover:text-surface-700"
                          title="Edit Client"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingId === client.id}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-surface-400 hover:text-red-600"
                          title="Delete Client"
                        >
                          {deletingId === client.id ? (
                            <Loader2 size={14} className="animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-400">
                    No clients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Drawer / Modal */}
      {viewingNotesClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
              <h3 className="font-bold text-sm text-surface-900 dark:text-surface-100">
                Notes for {viewingNotesClient.name}
              </h3>
              <button
                onClick={() => setViewingNotesClient(null)}
                className="p-1 rounded text-surface-400 hover:text-surface-700"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">
              {viewingNotesClient.notes}
            </p>
            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingNotesClient(null)}
                className="btn-primary text-xs h-8 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Edit/Create Modal */}
      {showModal && (
        <ClientModal
          client={editingClient || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
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
  const [serviceInterested, setServiceInterested] = useState(client?.service_interested || '')
  const [notes, setNotes] = useState(client?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

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
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="text-base font-bold text-surface-900 dark:text-surface-100">
            {client ? 'Edit Client' : 'Add New Client'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="input w-full"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="won">Won / Signed</option>
                <option value="active">Active Retainer</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Estimated Value ($)
              </label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Service Interested
            </label>
            <input
              type="text"
              value={serviceInterested}
              onChange={(e) => setServiceInterested(e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
