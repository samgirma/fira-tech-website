import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Package,
  Loader2,
  Trash2,
  Edit2,
  Lightbulb,
  Map,
  Hammer,
  FlaskConical,
  Rocket,
  Pause,
  Archive,
} from 'lucide-react'

type ProductStatus = 'idea' | 'planning' | 'building' | 'beta' | 'live' | 'paused' | 'archived'

interface Product {
  id: string
  name: string
  description?: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string; icon: typeof Package }> = {
  idea: { label: 'Idea', color: 'text-purple-700', bg: 'bg-purple-100', icon: Lightbulb },
  planning: { label: 'Planning', color: 'text-blue-700', bg: 'bg-blue-100', icon: Map },
  building: { label: 'Building', color: 'text-orange-700', bg: 'bg-orange-100', icon: Hammer },
  beta: { label: 'Beta', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: FlaskConical },
  live: { label: 'Live', color: 'text-green-700', bg: 'bg-green-100', icon: Rocket },
  paused: { label: 'Paused', color: 'text-surface-600', bg: 'bg-surface-100', icon: Pause },
  archived: { label: 'Archived', color: 'text-surface-500', bg: 'bg-surface-100', icon: Archive },
}

const statusOrder: ProductStatus[] = ['idea', 'planning', 'building', 'beta', 'live', 'paused', 'archived']

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || product.status === statusFilter)
  )

  const statusCounts = statusOrder.reduce(
    (acc, status) => {
      acc[status] = products.filter((p) => p.status === status).length
      return acc
    },
    {} as Record<ProductStatus, number>
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search products..."
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
            New Product
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        {statusOrder.map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={cn(
                'card p-3 text-left transition-all hover:shadow-medium',
                statusFilter === status && 'ring-2 ring-brand-500'
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
                  <Icon size={16} className={config.color} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-surface-900">{statusCounts[status]}</p>
                  <p className="text-xs text-surface-500">{config.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <span className="ml-2 text-surface-500">Loading products...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Package size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No products yet. Create your first product.</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Start building your product portfolio by adding your first product idea.
            </p>
            <button className="btn-primary mt-4" disabled>
              <Plus size={16} />
              New Product
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const config = statusConfig[product.status]
            const Icon = config.icon
            return (
              <div key={product.id} className="card hover:shadow-medium transition-shadow">
                <div className="card-content">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-900 truncate">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-surface-500 mt-1 line-clamp-2">{product.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-surface-100 rounded">
                        <Edit2 size={14} className="text-surface-400" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded">
                        <Trash2 size={14} className="text-surface-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <span className={cn('badge', config.bg, config.color)}>
                      <Icon size={12} className="mr-1" />
                      {config.label}
                    </span>
                    <span className="text-xs text-surface-400">{formatDate(product.createdAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No Results State */}
      {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <Search size={24} className="text-surface-300 mb-2" />
            <p className="text-surface-500">No products match your filters</p>
          </div>
        </div>
      )}
    </div>
  )
}
