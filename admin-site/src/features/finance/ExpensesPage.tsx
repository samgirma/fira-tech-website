import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, formatCurrency } from '../../lib/utils'
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  X,
  DollarSign,
} from 'lucide-react'

interface Expense {
  id: string
  amount: number
  description?: string
  category: string
  vendor?: string
  date: string
  projectId?: string
  projectName?: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setIsLoading(true)
      const data = await api.getExpenses()
      setExpenses(data)
    } catch (error) {
      console.error('Failed to load expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createExpense(data)
    await loadExpenses()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.createExpense({ id, ...data })
    await loadExpenses()
    setEditingItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    setDeletingId(id)
    try {
      await api.createExpense({ id, _delete: true })
      await loadExpenses()
    } finally {
      setDeletingId(null)
    }
  }

  const categories = Array.from(new Set(expenses.map((e) => e.category))).filter(Boolean)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const filteredExpenses = expenses.filter(
    (item) =>
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter === 'all' || item.category === categoryFilter)
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track and manage your business expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Expense
          </button>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="card mb-6">
        <div className="card-content flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <DollarSign size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Total Expenses</p>
            <p className="text-2xl font-bold text-surface-900">{formatCurrency(totalExpenses)}</p>
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
      {!isLoading && filteredExpenses.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount (ETB)</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Project</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((item) => (
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
                      <span className="badge bg-surface-100 text-surface-700">{item.category}</span>
                    </td>
                    <td>
                      {item.vendor ? (
                        <span className="text-surface-600">{item.vendor}</span>
                      ) : (
                        <span className="text-surface-400">-</span>
                      )}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && expenses.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No expenses yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Add your first expense to start tracking business costs.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Expense
            </button>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && expenses.length > 0 && filteredExpenses.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-3" />
            <p className="text-surface-500">No expenses match your search</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <ExpenseForm
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

function ExpenseForm({
  item,
  onSubmit,
  onClose,
}: {
  item?: Expense
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    amount: item?.amount?.toString() || '',
    description: item?.description || '',
    category: item?.category || '',
    vendor: item?.vendor || '',
    date: item?.date?.split('T')[0] || '',
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
        category: form.category,
        vendor: form.vendor || undefined,
        date: form.date,
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
            {item ? 'Edit Expense' : 'New Expense'}
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
              <label className="block text-sm font-medium text-surface-700 mb-1">Category *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Vendor</label>
              <input
                type="text"
                className="input w-full"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              />
            </div>
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
                'Create Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
