import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, CheckCircle2, Loader2, User } from 'lucide-react'
import { site } from '@/lib/api'

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface CommentsSectionProps {
  blogId: string
}

export default function CommentsSection({ blogId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [author, setAuthor] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!blogId) return
    loadComments()
  }, [blogId])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const data = await site.getComments(blogId)
      setComments(data || [])
    } catch {
      // Fallback
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) return

    try {
      setIsSubmitting(true)
      await site.submitComment({
        blogId,
        author: author.trim(),
        email: email.trim() || undefined,
        content: content.trim(),
      })
      setSubmitted(true)
      setContent('')
      setAuthor('')
      setEmail('')
    } catch {
      alert('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-16 pt-12 border-t border-border/50">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-gold-400" />
        <h3 className="text-xl font-display font-bold text-foreground">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Submission Form */}
      <div className="bg-card/40 border border-border/60 rounded-2xl p-6 mb-10">
        {submitted ? (
          <div className="flex items-center gap-3 text-emerald-400 py-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              Thank you! Your perspective has been received and will appear after moderation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Add Your Perspective
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-background border border-border/60 rounded-lg px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@domain.com"
                  className="w-full bg-background border border-border/60 rounded-lg px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Comment *
              </label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts or architectural questions..."
                className="w-full bg-background border border-border/60 rounded-lg px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !author.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-400 text-surface-950 font-bold text-xs hover:bg-gold-300 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Post Comment</span>
            </button>
          </form>
        )}
      </div>

      {/* Existing Comments */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-card/20 border border-border/40 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center font-bold text-3xs">
                    {c.author_name[0]}
                  </div>
                  <span>{c.author_name}</span>
                </div>
                <span className="text-3xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                {c.content}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic text-center py-4">
          No comments yet. Be the first to share an architectural thought!
        </p>
      )}
    </section>
  )
}
