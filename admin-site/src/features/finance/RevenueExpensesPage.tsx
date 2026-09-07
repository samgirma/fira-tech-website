import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, formatCurrency, cn } from '../../lib/utils'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Loader2,
  X,
  Receipt,
  Calendar,
  Layers,
} from 'lucide-react'

export default function RevenueExpensesPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses'>('revenue')
  const [revenue, setRevenue] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [revRes, expRes, clientsRes, projectsRes] = await Promise.allSettled([
        api.getRevenue(),
        api.getExpenses(),
        api.getClients(),
        api.getProjects(),
      ])

      if (revRes.status === 'fulfilled') setRevenue(revRes.value || [])
      if (expRes.status === 'fulfilled') setExpenses(expRes.value || [])
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value || [])
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value || [])
    } catch (err) {
      console.error('Failed to load ledger data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEntry = async (data: any) => {
    try {
      if (activeTab === 'revenue') {
        await api.createRevenue(data)
      } else {
        await api.createExpense(data)
      }
      setShowModal(false)
      await loadData()
    } catch (err) {
      console.error('Failed to add entry:', err)
      alert('Failed to save entry.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${activeTab} entry?`)) return
    try {
      setDeletingId(id)
      if (activeTab === 'revenue') {
        await api.deleteRevenue(id)
      } else {
        await api.deleteExpense(id)
      }
      await loadData()
    } catch (err) {
      console.error('Failed to delete entry:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const totalRev = revenue.reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const netIncome = totalRev - totalExp

  const currentList = activeTab === 'revenue' ? revenue : expenses
  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.source && item.source.toLowerCase().includes(q)) ||
      (item.vendor && item.vendor.toLowerCase().includes(q)) ||
      (item.client_name && item.client_name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Financial Ledger</h1>
          <p className="page-subtitle">
            Itemized cash inflow and operational business expenditures
          </p>
        </div>

        <button
          className="btn-primary text-xs h-9 px-3"
          onClick={() => setShowModal(true)}
        >
          <Plus size={15} />
          <span>Add {activeTab === 'revenue' ? 'Revenue' : 'Expense'}</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between text-2xs font-semibold uppercase text-surface-500">
            <span>Total Inflow</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRev)}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-2xs font-semibold uppercase text-surface-500">
            <span>Total Outflow</span>
            <TrendingDown size={16} className="text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalExp)}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-2xs font-semibold uppercase text-surface-500">
            <span>Net Operating Margin</span>
            <DollarSign size={16} className="text-brand-500" />
          </div>
          <div className={cn(
            'text-xl font-bold mt-1',
            netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            {formatCurrency(netIncome)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('revenue')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'revenue'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <TrendingUp size={15} />
          <span>Revenue Receipts ({revenue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'expenses'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <TrendingDown size={15} />
          <span>Operating Expenses ({expenses.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="card p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">{activeTab === 'revenue' ? 'Client / Source' : 'Vendor'}</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                    <td className="py-3 px-4 font-semibold text-surface-900 dark:text-surface-100">
                      {item.description || (activeTab === 'revenue' ? 'Client Payment' : 'Operational Expense')}
                    </td>

                    <td className={cn(
                      'py-3 px-4 font-bold',
                      activeTab === 'revenue' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}>
                      {activeTab === 'revenue' ? '+' : '-'}{formatCurrency(item.amount)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-2xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium capitalize">
                        {item.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                      {activeTab === 'revenue'
                        ? item.client_name || item.source || 'Direct Client'
                        : item.vendor || 'Supplier'}
                    </td>

                    <td className="py-3 px-4 text-surface-500">
                      {formatDate(item.date || item.created_at || new Date().toISOString())}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-surface-400 hover:text-red-600"
                        title="Delete entry"
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={13} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-surface-400">
                      No {activeTab} entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <LedgerModal
          type={activeTab}
          clients={clients}
          projects={projects}
          onSave={handleAddEntry}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function LedgerModal({
  type,
  clients,
  projects,
  onSave,
  onClose,
}: {
  type: 'revenue' | 'expenses'
  clients: any[]
  projects: any[]
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(type === 'revenue' ? 'Contract Sprint' : 'Cloud Infrastructure')
  const [sourceOrVendor, setSourceOrVendor] = useState('')
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    try {
      setIsSubmitting(true)
      if (type === 'revenue') {
        await onSave({
          description: description || undefined,
          amount: Number(amount),
          category,
          source: sourceOrVendor || undefined,
          clientId: clientId || undefined,
          projectId: projectId || undefined,
          date,
        })
      } else {
        await onSave({
          description: description || undefined,
          amount: Number(amount),
          category,
          vendor: sourceOrVendor || undefined,
          date,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
            {type === 'revenue' ? 'Record Revenue Receipt' : 'Record Operating Expense'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'revenue' ? 'e.g. Milestone 2 Sprint Delivery' : 'e.g. AWS Cloud Cluster & RDS'}
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              {type === 'revenue' ? 'Source / Payer' : 'Vendor / Service Provider'}
            </label>
            <input
              type="text"
              value={sourceOrVendor}
              onChange={(e) => setSourceOrVendor(e.target.value)}
              placeholder={type === 'revenue' ? 'e.g. BROS Technology' : 'e.g. Amazon Web Services'}
              className="input w-full"
            />
          </div>

          {type === 'revenue' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Client Account
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Direct Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                  Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Linked Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
