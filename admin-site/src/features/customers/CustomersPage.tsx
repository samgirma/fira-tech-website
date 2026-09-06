import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate } from '../../lib/utils'
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  X,
  Users,
  Mail,
  Phone,
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  projectsCount?: number
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const data = await api.getCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    await api.createCustomer(data)
    await loadCustomers()
    setShowCreateModal(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await api.updateCustomer(id, data)
    await loadCustomers()
    setEditingCustomer(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    setDeletingId(id)
    try {
      await api.deleteCustomer(id)
      await loadCustomers()
    } finally {
      setDeletingId(null)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            New Customer
          </button>
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
      {!isLoading && filteredCustomers.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Projects</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-brand-600" />
                        </div>
                        <span className="font-medium text-surface-900">{customer.name}</span>
                      </div>
                    </td>
                    <td>
                      {customer.email ? (
                        <span className="flex items-center gap-1.5 text-surface-600">
                          <Mail size={14} className="text-surface-400" />
                          {customer.email}
                        </span>
                      ) : (
                        <span className="text-surface-400">-</span>
                      )}
                    </td>
                    <td>
                      {customer.phone ? (
                        <span className="flex items-center gap-1.5 text-surface-600">
                          <Phone size={14} className="text-surface-400" />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-surface-400">-</span>
                      )}
                    </td>
                    <td>{customer.company || <span className="text-surface-400">-</span>}</td>
                    <td>
                      <span className="badge bg-surface-100 text-surface-700">
                        {customer.projectsCount ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="text-surface-500">{formatDate(customer.created_at)}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="p-1 hover:bg-surface-100 rounded"
                        >
                          <Edit2 size={14} className="text-surface-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          {deletingId === customer.id ? (
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
      {!isLoading && customers.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Users size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No customers yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Add your first customer to start managing your customer relationships.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create Customer
            </button>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && customers.length > 0 && filteredCustomers.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-3" />
            <p className="text-surface-500">No customers match your search</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCustomer) && (
        <CustomerForm
          customer={editingCustomer || undefined}
          onSubmit={(data) =>
            editingCustomer
              ? handleUpdate(editingCustomer.id, data)
              : handleCreate(data)
          }
          onClose={() => {
            setShowCreateModal(false)
            setEditingCustomer(null)
          }}
        />
      )}
    </div>
  )
}

function CustomerForm({
  customer,
  onSubmit,
  onClose,
}: {
  customer?: Customer
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        address: form.address || undefined,
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
            {customer ? 'Edit Customer' : 'New Customer'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name *</label>
            <input
              type="text"
              required
              className="input w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
              <input
                type="email"
                className="input w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Phone</label>
              <input
                type="text"
                className="input w-full"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Company</label>
            <input
              type="text"
              className="input w-full"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Address</label>
            <input
              type="text"
              className="input w-full"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
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
              ) : customer ? (
                'Save Changes'
              ) : (
                'Create Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
