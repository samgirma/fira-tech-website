import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, User, Mail } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: string;
  email?: string;
  approved: boolean;
  createdAt: string;
}

interface CommentsSectionProps {
  blogId?: string;
}

export default function CommentsSection({ blogId = 'homepage' }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ author: '', email: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments');
      if (response.ok) {
        const allComments = await response.json();
        const approvedComments = allComments.filter((comment: Comment) => comment.approved);
        setComments(approvedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!newComment.author.trim() || !newComment.content.trim()) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newComment, blogId }),
      });

      if (response.ok) {
        setSuccess('Thank you for your comment! It will be visible after approval.');
        setNewComment({ author: '', email: '', content: '' });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit comment');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="comments"
      className="min-h-screen bg-background/40 backdrop-blur-sm flex flex-col justify-center py-16 md:py-32 px-4 md:px-8"
    >
      {/* Header */}
      <div className="container-fira text-center mb-10 md:mb-12">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-accent text-sm font-semibold tracking-wider uppercase"
        >
          Join the Conversation
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-2"
        >
          Join the <span className="text-gradient-gold">Conversation</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mt-3"
        >
          Share your thoughts, ask questions, and connect with our community.
        </motion.p>
      </div>

      {/* Content */}
      <div className="container-fira w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Comment Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-foreground">Leave a Comment</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Share your thoughts with our community</p>
                </div>
              </div>

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
                      onChange={(e) => setNewComment((prev) => ({ ...prev, author: e.target.value }))}
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
                      onChange={(e) => setNewComment((prev) => ({ ...prev, email: e.target.value }))}
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
                    onChange={(e) => setNewComment((prev) => ({ ...prev, content: e.target.value }))}
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

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-forest to-accent hover:from-forest/90 hover:to-accent/90 text-white border-0 shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
            </div>
          </motion.div>

          {/* Comments List */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="glass-card p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-display font-bold text-foreground mb-6">
                Community Comments ({comments.length})
              </h3>

              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No comments yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border-l-2 border-accent/30 pl-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-forest to-accent rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-bold">
                            {comment.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-foreground text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-foreground text-sm leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Community Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 glass-card p-5 md:p-6"
            >
              <h4 className="text-sm font-semibold text-foreground mb-2">Community Guidelines</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We welcome diverse perspectives and constructive discussions. Please be respectful,
                stay on topic, and contribute positively. All comments are reviewed before publication.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
