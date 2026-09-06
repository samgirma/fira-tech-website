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
  DollarSign,
} from 'lucide-react'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  customerId?: string
  customerName?: string
  projectId?: string
  projectName?: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  notes?: string
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-surface-700', bg: 'bg-surface-100' },
  sent: { label: 'Sent', color: 'text-blue-700', bg: 'bg-blue-100' },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-surface-700', bg: 'bg-surface-100' },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Invoice | null>(null)
  const [updatingStatusItem, setUpdatingStatusItem] = useState<Invoice | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const data = await api.getInvoices()
      setInvoices(data)
    } catch (error) {
      console.error('Failed to load invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createInvoice(data)
    await loadInvoices()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateInvoice(id, data)
    await loadInvoices()
    setEditingItem(null)
  }

  const handleUpdateStatus = async (id: string, status: InvoiceStatus) => {
    await api.updateInvoice(id, { status })
    await loadInvoices()
    setUpdatingStatusItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return
    setDeletingId(id)
    try {
      await api.updateInvoice(id, { _delete: true })
      await loadInvoices()
    } finally {
      setDeletingId(null)
    }
  }

  const outstandingTotal = invoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const overdueTotal = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const filteredInvoices = invoices.filter(
    (item) =>
      statusFilter === 'all' || item.status === statusFilter
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage and track your invoices</p>
        </div>
        <div className="flex items-center gap-3">
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
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-content flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <DollarSign size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">Outstanding</p>
              <p className="text-2xl font-bold text-surface-900">{formatCurrency(outstandingTotal)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <DollarSign size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-surface-500">Overdue</p>
              <p className="text-2xl font-bold text-surface-900">{formatCurrency(overdueTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-surface-400" />
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredInvoices.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount (ETB)</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((item) => {
                  const status = statusConfig[item.status]
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="font-medium text-surface-900">{item.invoiceNumber}</span>
                      </td>
                      <td>
                        {item.customerName ? (
                          <span className="text-surface-600">{item.customerName}</span>
                        ) : (
                          <span className="text-surface-400">-</span>
                        )}
                      </td>
                      <td>
                        <span className="font-medium text-surface-900">{formatCurrency(item.amount)}</span>
                      </td>
                      <td>
                        <span className="text-surface-500">{formatDate(item.issueDate)}</span>
                      </td>
                      <td>
                        <span className="text-surface-500">{formatDate(item.dueDate)}</span>
                      </td>
                      <td>
                        <span className={cn('badge', status.bg, status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setUpdatingStatusItem(item)}
                            className="p-1 hover:bg-surface-100 rounded"
                            title="Update status"
                          >
                            <DollarSign size={14} className="text-surface-400" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 hover:bg-surface-100 rounded"
                          >
                            <Edit2 size={14} className="text-surface-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            {deletingId === item.id ? (
                              <Loader2 size={14} className="text-red-400 animate-spin" />
                            ) : (
                              <Trash2 size={14} className="text-surface-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && invoices.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No invoices yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Create your first invoice to start tracking payments.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Invoice
            </button>
          </div>
        </div>
      )}

      {/* No filter results */}
      {!isLoading && invoices.length > 0 && filteredInvoices.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-3" />
            <p className="text-surface-500">No invoices match the selected filter</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <InvoiceForm
          invoice={editingItem || undefined}
          onSubmit={(data) =>
            editingItem ? handleUpdate(editingItem.id, data) : handleCreate(data)
          }
          onClose={() => {
            setShowCreateModal(false)
            setEditingItem(null)
          }}
        />
      )}

      {/* Status Update Modal */}
      {updatingStatusItem && (
        <StatusUpdateModal
          invoice={updatingStatusItem}
          onUpdate={(status) => handleUpdateStatus(updatingStatusItem.id, status)}
          onClose={() => setUpdatingStatusItem(null)}
        />
      )}
    </div>
  )
}

function InvoiceForm({
  invoice,
  onSubmit,
  onClose,
}: {
  invoice?: Invoice
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    amount: invoice?.amount?.toString() || '',
    customerId: invoice?.customerId || '',
    projectId: invoice?.projectId || '',
    issueDate: invoice?.issueDate?.split('T')[0] || '',
    dueDate: invoice?.dueDate?.split('T')[0] || '',
    notes: invoice?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        amount: Number(form.amount),
        customerId: form.customerId || undefined,
        projectId: form.projectId || undefined,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        notes: form.notes || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">
            {invoice ? 'Edit Invoice' : 'New Invoice'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Amount (ETB) *</label>
            <input
              type="number"
              required
              className="input w-full"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Customer ID</label>
              <input
                type="text"
                className="input w-full"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Project ID</label>
              <input
                type="text"
                className="input w-full"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                className="input w-full"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                className="input w-full"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Notes</label>
            <textarea
              className="input w-full h-20"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : invoice ? (
                'Save Changes'
              ) : (
                'Create Invoice'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StatusUpdateModal({
  invoice,
  onUpdate,
  onClose,
}: {
  invoice: Invoice
  onUpdate: (status: InvoiceStatus) => void
  onClose: () => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>(invoice.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">Update Status</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-surface-600">
            Update status for invoice <span className="font-medium">{invoice.invoiceNumber}</span>
          </p>
          <div className="space-y-2">
            {Object.entries(statusConfig).map(([key, config]) => (
              <label
                key={key}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedStatus === key
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-200 hover:bg-surface-50'
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={key}
                  checked={selectedStatus === key}
                  onChange={() => setSelectedStatus(key as InvoiceStatus)}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className={cn('badge', config.bg, config.color)}>{config.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onUpdate(selectedStatus)}
              className="btn-primary"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
