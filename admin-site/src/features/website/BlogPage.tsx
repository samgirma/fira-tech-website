import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { formatDate, getRelativeTime, cn } from '../../lib/utils'
import {
  Plus,
  Search,
  Trash2,
  Loader2,
  X,
  FileText,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Edit2,
} from 'lucide-react'

interface Blog {
  id: string
  title: string
  slug?: string
  content: string
  excerpt?: string
  category?: string
  author?: string
  published: boolean
  createdAt: string
  created_at?: string
}

interface Comment {
  id: string
  post_id: string
  post_title?: string
  author_name: string
  author_email?: string
  content: string
  is_approved: boolean
  approved?: boolean
  created_at: string
}

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [blogsRes, commentsRes] = await Promise.allSettled([
        api.getBlogs(),
        api.getComments(),
      ])
      if (blogsRes.status === 'fulfilled') setBlogs(blogsRes.value || [])
      if (commentsRes.status === 'fulfilled') setComments(commentsRes.value || [])
    } catch (error) {
      console.error('Failed to load blog data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return
    setDeletingId(id)
    try {
      await api.deleteBlog(id)
      await loadData()
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveBlog = async (data: any) => {
    try {
      if (editingBlog) {
        await api.updateBlog(editingBlog.id, data)
      } else {
        await api.createBlog(data)
      }
      await loadData()
      setShowCreateForm(false)
      setEditingBlog(null)
    } catch (err) {
      console.error('Failed to save blog:', err)
      alert('Failed to save blog post.')
    }
  }

  const handleTogglePublish = async (blog: Blog) => {
    try {
      await api.updateBlog(blog.id, { published: !blog.published })
      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, published: !b.published } : b))
      )
    } catch (err) {
      console.error('Failed to update published state:', err)
    }
  }

  const handleApproveComment = async (commentId: string, approve: boolean) => {
    try {
      setActionLoadingId(commentId)
      await api.updateComment(commentId, approve)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, is_approved: approve, approved: approve } : c
        )
      )
    } catch (err) {
      console.error('Failed to update comment:', err)
      alert('Failed to update comment status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    try {
      setActionLoadingId(commentId)
      await api.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment:', err)
      alert('Failed to delete comment.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCommentsCount = comments.filter((c) => !(c.is_approved ?? c.approved)).length

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Blog & Thought Leadership</h1>
          <p className="page-subtitle">Publish architectural insights, sovereign tech essays, and moderate discussions</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'posts' && (
            <button
              className="btn-primary text-xs h-9 px-3"
              onClick={() => {
                setEditingBlog(null)
                setShowCreateForm(true)
              }}
            >
              <Plus size={15} />
              <span>New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'posts'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <FileText size={15} />
          <span>Articles ({blogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={cn(
            'pb-3 border-b-2 transition-colors flex items-center gap-2',
            activeTab === 'comments'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          <MessageSquare size={15} />
          <span>Comments Approval</span>
          {pendingCommentsCount > 0 && (
            <span className="text-3xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
              {pendingCommentsCount} pending
            </span>
          )}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder={activeTab === 'posts' ? 'Search posts...' : 'Search comments...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
      ) : activeTab === 'posts' ? (
        filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="card flex flex-col justify-between overflow-hidden group hover:border-brand-300 dark:hover:border-brand-700 transition-all"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                      {blog.category || 'Architecture'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingBlog(blog)
                          setShowCreateForm(true)
                        }}
                        className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        disabled={deletingId === blog.id}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-surface-400 hover:text-red-600"
                      >
                        {deletingId === blog.id ? (
                          <Loader2 size={13} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-surface-900 dark:text-surface-100 line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-3 leading-relaxed">
                    {blog.excerpt || blog.content}
                  </p>
                </div>

                <div className="p-3.5 bg-surface-50/50 dark:bg-surface-800/40 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-2xs text-surface-400">
                  <button
                    onClick={() => handleTogglePublish(blog)}
                    className="flex items-center gap-1 font-semibold hover:opacity-80"
                  >
                    {blog.published ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Eye size={12} /> Published
                      </span>
                    ) : (
                      <span className="text-surface-400 flex items-center gap-1">
                        <EyeOff size={12} /> Draft
                      </span>
                    )}
                  </button>
                  <span>{formatDate(blog.createdAt || blog.created_at || new Date().toISOString())}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card py-16 text-center">
            <FileText size={28} className="mx-auto text-surface-400 mb-2" />
            <p className="text-xs text-surface-400">No blog posts found.</p>
          </div>
        )
      ) : (
        /* Comments Approval Tab */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/40 text-surface-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Commenter</th>
                  <th className="py-3 px-4">Content</th>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {comments.map((comment) => {
                  const isApproved = comment.is_approved ?? comment.approved
                  const isActing = actionLoadingId === comment.id

                  return (
                    <tr key={comment.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-surface-900 dark:text-surface-100">
                          {comment.author_name}
                        </div>
                        {comment.author_email && (
                          <div className="text-3xs text-surface-400">{comment.author_email}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-surface-700 dark:text-surface-300 line-clamp-2">
                          {comment.content}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-surface-600 dark:text-surface-400">
                        {comment.post_title || 'Blog Essay'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={cn(
                          'text-2xs px-2 py-0.5 rounded-full font-bold uppercase',
                          isApproved
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        )}>
                          {isApproved ? 'Approved' : 'Pending Review'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-surface-400">
                        {getRelativeTime(comment.created_at)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApproveComment(comment.id, true)}
                              disabled={isActing}
                              className="btn-primary text-2xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} />
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveComment(comment.id, false)}
                              disabled={isActing}
                              className="btn-outline text-2xs h-7 px-2.5 inline-flex items-center gap-1 text-amber-600 hover:text-amber-700"
                            >
                              <XCircle size={12} />
                              Unapprove
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isActing}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-surface-400 hover:text-red-600"
                            title="Delete comment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {comments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-surface-400">
                      No comments submitted on public blog posts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Post Form Modal */}
      {showCreateForm && (
        <BlogModal
          blog={editingBlog || undefined}
          onSave={handleSaveBlog}
          onClose={() => {
            setShowCreateForm(false)
            setEditingBlog(null)
          }}
        />
      )}
    </div>
  )
}

function BlogModal({
  blog,
  onSave,
  onClose,
}: {
  blog?: Blog
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(blog?.title || '')
  const [category, setCategory] = useState(blog?.category || 'Architecture')
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '')
  const [content, setContent] = useState(blog?.content || '')
  const [published, setPublished] = useState(blog?.published ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      setIsSubmitting(true)
      await onSave({
        title,
        category,
        excerpt: excerpt || undefined,
        content,
        published,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
          <h3 className="font-bold text-base text-surface-900 dark:text-surface-100">
            {blog ? 'Edit Article' : 'Draft New Thought Leadership Essay'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Myth of Microservices: Why Modular Monoliths Scale Faster"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Architecture, DevOps, AI"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Status
              </label>
              <select
                value={published ? 'published' : 'draft'}
                onChange={(e) => setPublished(e.target.value === 'published')}
                className="input w-full"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Short Excerpt / Deck
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A one-sentence summary for card previews and SEO meta"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Article Body (Markdown supported) *
            </label>
            <textarea
              rows={10}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content..."
              className="input w-full font-mono text-2xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {blog ? 'Update Article' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
