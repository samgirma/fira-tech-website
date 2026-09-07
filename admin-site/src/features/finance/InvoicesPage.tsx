import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, formatCurrency, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  X,
  Receipt,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

interface Invoice {
  id: string
  invoice_number?: string
  invoiceNumber?: string
  amount: number
  client_id?: string
  clientId?: string
  client_name?: string
  customerName?: string
  client_company?: string
  project_id?: string
  projectId?: string
  project_name?: string
  projectName?: string
  issue_date?: string
  issueDate?: string
  due_date?: string
  dueDate?: string
  status: InvoiceStatus
  notes?: string
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-surface-700 dark:text-surface-300', bg: 'bg-surface-100 dark:bg-surface-800' },
  sent: { label: 'Sent / Pending', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/60' },
  paid: { label: 'Paid', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  overdue: { label: 'Overdue', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/60' },
  cancelled: { label: 'Cancelled', color: 'text-surface-600 dark:text-surface-400', bg: 'bg-surface-100 dark:bg-surface-800' },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Invoice | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [invRes, clientsRes, projectsRes] = await Promise.allSettled([
        api.getInvoices(),
        api.getClients(),
        api.getProjects(),
      ])

      if (invRes.status === 'fulfilled') setInvoices(invRes.value || [])
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value || [])
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value || [])
    } catch (error) {
      console.error('Failed to load invoices data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createInvoice(data)
    await loadData()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateInvoice(id, data)
    await loadData()
    setEditingItem(null)
  }

  const handleUpdateStatus = async (id: string, status: InvoiceStatus) => {
    await api.updateInvoice(id, { status })
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    setDeletingId(id)
    try {
      await api.deleteInvoice(id)
      await loadData()
    } catch (err) {
      console.error('Failed to delete invoice:', err)
      alert('Failed to delete invoice.')
    } finally {
      setDeletingId(null)
    }
  }

  const outstandingTotal = invoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  const paidTotal = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  const overdueTotal = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

  const filteredInvoices = invoices.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Enterprise Invoices & Billing</h1>
          <p className="page-subtitle">Track project contracts, client billing milestones, and payment receipts</p>
        </div>

        <button
          className="btn-primary text-xs h-9 px-3"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={15} />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Snapshot Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Collected Revenue
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(paidTotal)}
          </div>
        </div>

        <div className="card p-4">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Outstanding / Awaiting Payment
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(outstandingTotal)}
          </div>
        </div>

        <div className="card p-4">
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-500">
            Overdue Balance
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(overdueTotal)}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input text-xs h-8"
          >
            <option value="all">All Invoices ({invoices.length})</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent / Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client & Project</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filteredInvoices.map((inv) => {
                  const status = statusConfig[inv.status] || statusConfig.draft
                  const invNum = inv.invoice_number || inv.invoiceNumber || `INV-${inv.id.slice(0, 6)}`
                  const clientName = inv.client_name || inv.customerName || 'Direct Client'
                  const projName = inv.project_name || inv.projectName

                  return (
                    <tr key={inv.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-surface-900 dark:text-surface-100">
                        {invNum}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-surface-900 dark:text-surface-100">
                          {clientName}
                        </div>
                        {projName && (
                          <div className="text-2xs text-surface-500">
                            Project: {projName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-surface-900 dark:text-surface-100">
                        {formatCurrency(inv.amount)}
                      </td>

                      <td className="py-3 px-4 text-surface-500">
                        {formatDate(inv.issue_date || inv.issueDate || new Date().toISOString())}
                      </td>

                      <td className="py-3 px-4 text-surface-500">
                        {inv.due_date || inv.dueDate ? formatDate(inv.due_date || inv.dueDate!) : '—'}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={inv.status}
                          onChange={(e) => handleUpdateStatus(inv.id, e.target.value as InvoiceStatus)}
                          className={cn(
                            'px-2 py-0.5 rounded-full text-2xs font-semibold cursor-pointer border-0',
                            status.bg,
                            status.color
                          )}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent / Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingItem(inv)}
                            className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded text-surface-400 hover:text-surface-700"
                            title="Edit Invoice"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            disabled={deletingId === inv.id}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-surface-400 hover:text-red-600"
                            title="Delete Invoice"
                          >
                            {deletingId === inv.id ? (
                              <Loader2 size={13} className="animate-spin text-red-500" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-surface-400">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingItem) && (
        <InvoiceModal
          invoice={editingItem || undefined}
          clients={clients}
          projects={projects}
          onSave={(data) => editingItem ? handleUpdate(editingItem.id, data) : handleCreate(data)}
          onClose={() => {
            setShowCreateModal(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

function InvoiceModal({
  invoice,
  clients,
  projects,
  onSave,
  onClose,
}: {
  invoice?: Invoice
  clients: any[]
  projects: any[]
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.invoice_number || invoice?.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`
  )
  const [clientId, setClientId] = useState(invoice?.client_id || invoice?.clientId || '')
  const [projectId, setProjectId] = useState(invoice?.project_id || invoice?.projectId || '')
  const [amount, setAmount] = useState(invoice?.amount ? String(invoice.amount) : '')
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status || 'draft')
  const [issueDate, setIssueDate] = useState(
    invoice?.issue_date?.split('T')[0] || invoice?.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0]
  )
  const [dueDate, setDueDate] = useState(
    invoice?.due_date?.split('T')[0] || invoice?.dueDate?.split('T')[0] || ''
  )
  const [notes, setNotes] = useState(invoice?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    try {
      setIsSubmitting(true)
      await onSave({
        invoiceNumber,
        clientId: clientId || undefined,
        projectId: projectId || undefined,
        amount: Number(amount),
        status,
        issueDate,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="input w-full font-mono"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input w-full"
              >
                <option value="">Select Client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Linked Deliverable
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="input w-full"
              >
                <option value="">Select Project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="input w-full"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent / Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Payment Terms & Scope Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% milestone deliverable upon staging deployment..."
              className="input w-full resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {invoice ? 'Save Invoice' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
