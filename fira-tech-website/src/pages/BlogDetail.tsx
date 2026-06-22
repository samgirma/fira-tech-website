import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Calendar, User, MessageCircle, Share2, Bookmark } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  createdAt: string
  author: {
    name: string
    email: string
  }
  _count: {
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  approved: boolean
  createdAt: string
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchBlog()
      fetchComments()
    }
  }, [slug])

  const fetchBlog = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const blogs: BlogPost[] = await response.json()
        const foundBlog = blogs.find(b => b.slug === slug)
        if (foundBlog) {
          setBlog(foundBlog)
        } else {
          setError('Blog post not found')
        }
      }
    } catch (error) {
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments')
      if (response.ok) {
        const allComments: Comment[] = await response.json()
        const approvedComments = allComments.filter(comment => comment.approved)
        setComments(approvedComments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.content.substring(0, 150) + '...',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Show toast or notification
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background/40 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 oromo-pattern opacity-10" />
        <div className="relative z-10 py-20 px-6">
          <div className="container-fira max-w-4xl mx-auto">
            <Skeleton className="h-5 w-24 mb-8" />
            <Skeleton className="h-6 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <div className="flex justify-center gap-4 mb-12">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <div className="border border-forest/20 rounded-xl p-8 md:p-12 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background/40 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The blog post you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => navigate('/blogs')} className="bg-gradient-to-r from-forest to-accent">
            Back to Blogs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 oromo-pattern opacity-10" />
      
      {/* Floating Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-20 px-6"
        >
          <div className="container-fira max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/blogs')}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>

            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
                  <span className="text-gradient-gold">{blog.title}</span>
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground mb-8">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarFallback className="bg-gradient-to-br from-forest to-accent text-white">
                        {blog.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{blog.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {blog._count.comments} comments
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-forest/20 hover:bg-forest/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="border-forest/20 hover:bg-forest/10"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Content */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pb-20 px-6"
        >
          <div className="container-fira max-w-4xl mx-auto">
            <Card className="border-forest/20 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <div className="text-foreground leading-relaxed space-y-6">
                    {blog.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-base leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-forest/20">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-forest/10 text-forest border-forest/20">
                      Technology
                    </Badge>
                    <Badge variant="secondary" className="bg-forest/10 text-forest border-forest/20">
                      Heritage
                    </Badge>
                    <Badge variant="secondary" className="bg-forest/10 text-forest border-forest/20">
                      Innovation
                    </Badge>
                    <Badge variant="secondary" className="bg-forest/10 text-forest border-forest/20">
                      Africa
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            {comments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-12"
              >
                <Card className="border-forest/20 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      Comments ({comments.length})
                    </h3>
                    <div className="space-y-6">
                      {comments.map((comment, index) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="border-l-2 border-accent/30 pl-4"
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-forest to-accent text-white">
                                {comment.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-foreground">
                                  {comment.author}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-foreground leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
