import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send, User, Mail } from 'lucide-react'

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  approved: boolean
  createdAt: string
}

interface CommentsSectionProps {
  blogId?: string
}

export default function CommentsSection({ blogId = 'homepage' }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState({
    author: '',
    email: '',
    content: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  React.useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments')
      if (response.ok) {
        const allComments = await response.json()
        // Show only approved comments for public view
        const approvedComments = allComments.filter((comment: Comment) => comment.approved)
        setComments(approvedComments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    if (!newComment.author.trim() || !newComment.content.trim()) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          blogId
        }),
      })

      if (response.ok) {
        setSuccess('Thank you for your comment! It will be visible after approval.')
        setNewComment({ author: '', email: '', content: '' })
        // Don't immediately add to comments since they need approval
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit comment')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="snap-start min-h-screen flex flex-col justify-center py-16 px-6 bg-background/40 backdrop-blur-sm">
      <div className="container-fira max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="text-foreground">Join the</span>
            <br />
            <span className="text-gradient-gold">Conversation</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your thoughts, ask questions, and connect with our community. 
            We'd love to hear from you about technology, heritage, and innovation in Africa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comment Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-forest/20 bg-card/60 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <MessageCircle className="w-5 h-5 mr-2 text-accent" />
                  Leave a Comment
                </CardTitle>
                <CardDescription>
                  Share your thoughts with our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="author" className="text-sm font-medium text-foreground">
                      Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="author"
                        value={newComment.author}
                        onChange={(e) => setNewComment(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Your name"
                        className="pl-10 border-forest/20 bg-background/50 focus:border-accent/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email (optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={newComment.email}
                        onChange={(e) => setNewComment(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="pl-10 border-forest/20 bg-background/50 focus:border-accent/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-foreground">
                      Comment *
                    </label>
                    <Textarea
                      id="content"
                      value={newComment.content}
                      onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts..."
                      rows={4}
                      className="border-forest/20 bg-background/50 focus:border-accent/50 resize-none"
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-600/20 bg-green-600/10">
                      <AlertDescription className="text-green-600">{success}</AlertDescription>
                    </Alert>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-forest to-accent hover:from-forest/90 hover:to-accent/90 text-white border-0 shadow-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Posting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments Display */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Card className="border-forest/20 bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Community Comments ({comments.length})
                </CardTitle>
                <CardDescription>
                  Thoughts from our community members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No comments yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="border-l-2 border-accent/30 pl-4"
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-forest to-accent text-white text-sm">
                              {comment.author.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-foreground text-sm">
                                {comment.author}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-foreground text-sm leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Community Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Card className="border-forest/10 bg-card/40 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Community Guidelines
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                We welcome diverse perspectives and constructive discussions. Please be respectful, 
                stay on topic, and contribute positively to our community. All comments are 
                reviewed before publication to maintain a welcoming environment for everyone.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
