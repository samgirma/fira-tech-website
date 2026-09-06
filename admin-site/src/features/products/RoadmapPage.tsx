import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Map,
  Loader2,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react'

type RoadmapStatus = 'planned' | 'in-progress' | 'completed'

interface RoadmapItem {
  id: string
  title: string
  description?: string
  status: RoadmapStatus
  targetDate?: string
  createdAt: string
}

const statusConfig: Record<RoadmapStatus, { label: string; color: string; bg: string }> = {
  planned: { label: 'Planned', color: 'text-blue-700', bg: 'bg-blue-100' },
  'in-progress': { label: 'In Progress', color: 'text-orange-700', bg: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
}

const statusOrder: RoadmapStatus[] = ['planned', 'in-progress', 'completed']

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoadmapStatus | 'all'>('all')

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const data = await api.getRoadmapItems()
      setItems(data)
    } catch (error) {
      console.error('Failed to load roadmap items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || item.status === statusFilter)
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Product Roadmap</h1>
          <p className="page-subtitle">Track product development timeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search roadmap..."
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
            {statusOrder.map((status) => (
              <option key={status} value={status}>{statusConfig[status].label}</option>
            ))}
          </select>
          <button className="btn-primary" disabled>
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <span className="ml-2 text-surface-500">Loading roadmap...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Map size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No roadmap items yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Plan your product development timeline by adding roadmap items.
            </p>
            <button className="btn-primary mt-4" disabled>
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Roadmap Timeline */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="space-y-4">
          {statusOrder.map((status) => {
            const statusItems = filteredItems.filter((item) => item.status === status)
            if (statusItems.length === 0) return null
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-2 h-2 rounded-full', statusConfig[status].bg)} />
                  <h3 className="text-sm font-medium text-surface-700">{statusConfig[status].label}</h3>
                  <span className="text-xs text-surface-400">({statusItems.length})</span>
                </div>
                <div className="space-y-2">
                  {statusItems.map((item) => (
                    <div key={item.id} className="card hover:shadow-medium transition-shadow">
                      <div className="card-content flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-surface-900">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-surface-500 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          {item.targetDate && (
                            <span className="text-xs text-surface-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(item.targetDate)}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <button className="p-1 hover:bg-surface-100 rounded">
                              <Edit2 size={14} className="text-surface-400" />
                            </button>
                            <button className="p-1 hover:bg-red-50 rounded">
                              <Trash2 size={14} className="text-surface-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No Results State */}
      {!isLoading && items.length > 0 && filteredItems.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-2" />
            <p className="text-surface-500">No roadmap items match your filters</p>
          </div>
        </div>
      )}
    </div>
  )
}
