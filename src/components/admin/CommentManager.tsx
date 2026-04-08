import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Trash2, MessageSquare, MessageSquareIcon } from 'lucide-react'

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  approved: boolean
  createdAt: string
  blog: {
    title: string
    slug: string
  }
}

interface CommentManagerProps {
  comments: Comment[]
  onCommentUpdated: () => void
}

export default function CommentManager({ comments, onCommentUpdated }: CommentManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleApprove = async (id: string, approved: boolean) => {
    setLoading(id)
    setError('')

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, approved }),
      })

      if (response.ok) {
        onCommentUpdated()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update comment')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setLoading(id)
    setError('')

    try {
      const response = await fetch(`/api/admin/comments?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onCommentUpdated()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete comment')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const pendingComments = comments.filter(c => !c.approved)
  const approvedComments = comments.filter(c => c.approved)

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Pending Comments */}
      {pendingComments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
            <MessageSquareIcon className="mr-2 h-5 w-5 text-accent" />
            Pending Comments ({pendingComments.length})
          </h3>
          <div className="space-y-4">
            {pendingComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CommentCard
                  comment={comment}
                  loading={loading === comment.id}
                  onApprove={() => handleApprove(comment.id, true)}
                  onDelete={() => handleDelete(comment.id)}
                  showApprove={true}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Approved Comments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
          Approved Comments ({approvedComments.length})
        </h3>
        <div className="space-y-4">
          {approvedComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CommentCard
                comment={comment}
                loading={loading === comment.id}
                onApprove={() => handleApprove(comment.id, false)}
                onDelete={() => handleDelete(comment.id)}
                showApprove={false}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {comments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-forest/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No comments yet</p>
              <p className="text-muted-foreground text-sm mt-2">Comments will appear here once users start engaging with your blog posts.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

interface CommentCardProps {
  comment: Comment
  loading: boolean
  onApprove: () => void
  onDelete: () => void
  showApprove: boolean
}

function CommentCard({ comment, loading, onApprove, onDelete, showApprove }: CommentCardProps) {
  return (
    <Card className="border-forest/20 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-forest to-accent text-white">
                {comment.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground">{comment.author}</span>
                {comment.email && (
                  <span className="text-sm text-muted-foreground">({comment.email})</span>
                )}
                <Badge variant={comment.approved ? "default" : "secondary"} className="text-xs">
                  {comment.approved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()} • 
                on "{comment.blog.title}"
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {showApprove && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onApprove}
                  disabled={loading}
                  className="border-green-600/20 hover:bg-green-600/10 text-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">{comment.content}</p>
      </CardContent>
    </Card>
  )
}
