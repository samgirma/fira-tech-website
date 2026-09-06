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

type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

interface Revenue {
  id: string
  amount: number
  description?: string
  category?: string
  date: string
  paymentStatus: PaymentStatus
  customerId?: string
  customerName?: string
  projectId?: string
  projectName?: string
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-surface-700', bg: 'bg-surface-100' },
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<Revenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Revenue | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadRevenue()
  }, [])

  const loadRevenue = async () => {
    try {
      setIsLoading(true)
      const data = await api.getRevenue()
      setRevenue(data)
    } catch (error) {
      console.error('Failed to load revenue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createRevenue(data)
    await loadRevenue()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.createRevenue({ id, ...data })
    await loadRevenue()
    setEditingItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this revenue entry?')) return
    setDeletingId(id)
    try {
      await api.createRevenue({ id, _delete: true })
      await loadRevenue()
    } finally {
      setDeletingId(null)
    }
  }

  const totalRevenue = revenue
    .filter((r) => r.paymentStatus !== 'cancelled')
    .reduce((sum, r) => sum + r.amount, 0)

  const filteredRevenue = revenue.filter(
    (item) =>
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || item.paymentStatus === statusFilter)
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Revenue</h1>
          <p className="page-subtitle">Track and manage your income</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search revenue..."
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
            {Object.entries(paymentStatusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Revenue
          </button>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="card mb-6">
        <div className="card-content flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Total Revenue</p>
            <p className="text-2xl font-bold text-surface-900">{formatCurrency(totalRevenue)}</p>
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
      {!isLoading && filteredRevenue.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount (ETB)</th>
                  <th>Category</th>
                  <th>Payment Status</th>
                  <th>Project</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredRevenue.map((item) => {
                  const status = paymentStatusConfig[item.paymentStatus]
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="text-surface-500">{formatDate(item.date)}</span>
                      </td>
                      <td>
                        <span className="font-medium text-surface-900">{item.description || '-'}</span>
                      </td>
                      <td>
                        <span className="font-medium text-surface-900">{formatCurrency(item.amount)}</span>
                      </td>
                      <td>
                        {item.category ? (
                          <span className="badge bg-surface-100 text-surface-700">{item.category}</span>
                        ) : (
                          <span className="text-surface-400">-</span>
                        )}
                      </td>
                      <td>
                        <span className={cn('badge', status.bg, status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {item.projectName ? (
                          <span className="text-surface-600">{item.projectName}</span>
                        ) : (
                          <span className="text-surface-400">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
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
      {!isLoading && revenue.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No revenue entries yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Add your first revenue entry to start tracking income.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Revenue Entry
            </button>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && revenue.length > 0 && filteredRevenue.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-3" />
            <p className="text-surface-500">No revenue entries match your search</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <RevenueForm
          item={editingItem || undefined}
          onSubmit={(data) =>
            editingItem ? handleUpdate(editingItem.id, data) : handleCreate(data)
          }
          onClose={() => {
            setShowCreateModal(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

function RevenueForm({
  item,
  onSubmit,
  onClose,
}: {
  item?: Revenue
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    amount: item?.amount?.toString() || '',
    description: item?.description || '',
    category: item?.category || '',
    date: item?.date?.split('T')[0] || '',
    payment_status: item?.paymentStatus || 'pending',
    customerId: item?.customerId || '',
    projectId: item?.projectId || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        amount: Number(form.amount),
        description: form.description || undefined,
        category: form.category || undefined,
        date: form.date,
        payment_status: form.payment_status,
        customerId: form.customerId || undefined,
        projectId: form.projectId || undefined,
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
            {item ? 'Edit Revenue' : 'New Revenue'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Date *</label>
              <input
                type="date"
                required
                className="input w-full"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <input
              type="text"
              className="input w-full"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
              <input
                type="text"
                className="input w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Payment Status</label>
              <select
                className="input w-full"
                value={form.payment_status}
                onChange={(e) => setForm({ ...form, payment_status: e.target.value as PaymentStatus })}
              >
                {Object.entries(paymentStatusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : item ? (
                'Save Changes'
              ) : (
                'Create Revenue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
