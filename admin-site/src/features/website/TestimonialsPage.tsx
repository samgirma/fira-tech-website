import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  MessageSquareQuote,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Building2,
} from 'lucide-react'

export interface Testimonial {
  id: string
  customer_name: string
  position?: string
  company?: string
  content: string
  rating: number
  photo_url?: string
  featured: boolean
  published: boolean
  created_at?: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      setIsLoading(true)
      const data = await api.getTestimonials()
      setTestimonials(data || [])
    } catch (err) {
      console.error('Failed to load testimonials:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    try {
      setDeletingId(id)
      await api.deleteTestimonial(id)
      await loadTestimonials()
    } catch (err) {
      console.error('Failed to delete testimonial:', err)
      alert('Failed to delete testimonial.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.updateTestimonial(editingItem.id, data)
      } else {
        await api.createTestimonial(data)
      }
      setShowModal(false)
      setEditingItem(null)
      await loadTestimonials()
    } catch (err) {
      console.error('Failed to save testimonial:', err)
      alert('Failed to save testimonial.')
    }
  }

  const handleTogglePublish = async (item: Testimonial) => {
    try {
      await api.updateTestimonial(item.id, { published: !item.published })
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, published: !item.published } : t))
      )
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  const filtered = testimonials.filter(
    (t) =>
      t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.company && t.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Client Testimonials & Endorsements</h1>
          <p className="page-subtitle">
            Authentic client feedback, executive reviews, and trust endorsements for the public site
          </p>
        </div>

        <button
          className="btn-primary text-xs h-9 px-3"
          onClick={() => {
            setEditingItem(null)
            setShowModal(true)
          }}
        >
          <Plus size={15} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card flex flex-col justify-between overflow-hidden group hover:border-brand-300 dark:hover:border-brand-700 transition-all"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                      {item.customer_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-surface-900 dark:text-surface-100">
                        {item.customer_name}
                      </h4>
                      <div className="text-3xs text-surface-500 dark:text-surface-400">
                        {item.position && <span>{item.position}</span>}
                        {item.company && <span> • {item.company}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setShowModal(true)
                      }}
                      className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-surface-400 hover:text-red-600"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={13} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 text-gold-500">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs text-surface-600 dark:text-surface-300 italic leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              {/* Footer */}
              <div className="p-3.5 bg-surface-50/50 dark:bg-surface-800/40 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-2xs">
                <button
                  onClick={() => handleTogglePublish(item)}
                  className="font-semibold hover:opacity-80 transition-opacity"
                >
                  {item.published ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Published
                    </span>
                  ) : (
                    <span className="text-surface-400 flex items-center gap-1">
                      <XCircle size={12} /> Draft
                    </span>
                  )}
                </button>

                {item.featured && (
                  <span className="flex items-center gap-0.5 text-gold-500 font-semibold">
                    <Star size={11} fill="currentColor" /> Homepage Featured
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center mx-auto mb-3 text-brand-600">
            <MessageSquareQuote size={26} />
          </div>
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
            No testimonials yet
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-sm mx-auto">
            Collect and showcase partner testimonials to establish enterprise trust.
          </p>
          <button
            className="btn-primary mt-4 text-xs h-9 px-4 inline-flex items-center gap-1.5"
            onClick={() => {
              setEditingItem(null)
              setShowModal(true)
            }}
          >
            <Plus size={15} />
            Add Testimonial
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TestimonialModal
          item={editingItem || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

function TestimonialModal({
  item,
  onSave,
  onClose,
}: {
  item?: Testimonial
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [clientName, setClientName] = useState(item?.customer_name || '')
  const [clientTitle, setClientTitle] = useState(item?.position || '')
  const [clientCompany, setClientCompany] = useState(item?.company || '')
  const [content, setContent] = useState(item?.content || '')
  const [rating, setRating] = useState(item?.rating || 5)
  const [isFeatured, setIsFeatured] = useState(item?.featured || false)
  const [isPublished, setIsPublished] = useState(item?.published ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !content.trim()) return

    try {
      setIsSubmitting(true)
      await onSave({
        customer_name: clientName,
        position: clientTitle || undefined,
        company: clientCompany || undefined,
        content,
        rating: Number(rating),
        featured: isFeatured,
        published: isPublished,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
            {item ? 'Edit Testimonial' : 'Add Testimonial'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Client / Executive Name *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Dr. Ermias Kebede"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={clientTitle}
                onChange={(e) => setClientTitle(e.target.value)}
                placeholder="e.g. Chief Technology Officer"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="e.g. BROS Technology"
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Rating (Stars)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="input w-full"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
              <option value={3}>⭐⭐⭐ (3 Stars)</option>
            </select>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Endorsement Quote *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Fira Tech delivered our sovereign architecture ahead of schedule with remarkable rigor..."
              className="input w-full resize-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-surface-700 dark:text-surface-300 font-medium">
                Published to Public Site
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-surface-700 dark:text-surface-300 font-medium">
                Featured on Homepage
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {item ? 'Update Testimonial' : 'Save Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
