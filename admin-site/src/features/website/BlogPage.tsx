import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  X,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react'

interface Blog {
  id: string
  title: string
  content: string
  category?: string
  author?: string
  published: boolean
  createdAt: string
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    try {
      setIsLoading(true)
      const data = await api.getBlogs()
      setBlogs(data)
    } catch (error) {
      console.error('Failed to load blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return
    setDeletingId(id)
    try {
      await api.deleteBlog(id)
      await loadBlogs()
    } finally {
      setDeletingId(null)
    }
  }

  const handleCreate = async (data: { title: string; content: string; category?: string; published: boolean }) => {
    await api.createBlog(data)
    await loadBlogs()
    setShowCreateForm(false)
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Blog</h1>
          <p className="page-subtitle">Create and manage your blog posts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-64"
            />
          </div>
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="card-content flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-500" />
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredBlogs.length > 0 && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-brand-600" />
                        </div>
                        <p className="font-medium text-surface-900">{blog.title}</p>
                      </div>
                    </td>
                    <td>
                      {blog.category ? (
                        <span className="badge bg-surface-100 text-surface-700">{blog.category}</span>
                      ) : (
                        <span className="text-surface-400">-</span>
                      )}
                    </td>
                    <td className="text-surface-600">{blog.author || '-'}</td>
                    <td>
                      <span
                        className={cn(
                          'badge',
                          blog.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        )}
                      >
                        {blog.published ? (
                          <Eye size={12} className="mr-1" />
                        ) : (
                          <EyeOff size={12} className="mr-1" />
                        )}
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="text-surface-500 text-sm">{formatDate(blog.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deletingId === blog.id}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        {deletingId === blog.id ? (
                          <Loader2 size={14} className="text-red-400 animate-spin" />
                        ) : (
                          <Trash2 size={14} className="text-surface-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && blogs.length === 0 && (
        <div className="card">
          <div className="card-content flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <FileText size={24} className="text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900">No blog posts yet</h3>
            <p className="text-surface-500 mt-2 text-center max-w-md">
              Start sharing your thoughts and expertise. Create your first blog post.
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowCreateForm(true)}>
              <Plus size={16} />
              Create Post
            </button>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <BlogForm onSubmit={handleCreate} onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  )
}

function BlogForm({
  onSubmit,
  onClose,
}: {
  onSubmit: (data: { title: string; content: string; category?: string; published: boolean }) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    published: false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        title: form.title,
        content: form.content,
        category: form.category || undefined,
        published: form.published,
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
          <h2 className="text-lg font-semibold text-surface-900">New Blog Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
            <input
              type="text"
              required
              className="input w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter post title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
            <input
              type="text"
              className="input w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Technology, Business"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Content *</label>
            <textarea
              required
              rows={8}
              className="input w-full resize-none"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your post content..."
            />
          </div>
          <div className="flex items-center justify-between py-3 px-4 bg-surface-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-surface-700">Publish immediately</p>
              <p className="text-xs text-surface-500">Toggle off to save as draft</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                form.published ? 'bg-brand-600' : 'bg-surface-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  form.published ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
