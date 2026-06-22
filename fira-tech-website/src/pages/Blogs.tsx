import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Calendar, User, MessageCircle, ArrowRight, X, Share2, Bookmark } from 'lucide-react'

interface Blog {
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    fetchBlogs()
    fetchComments()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments')
      if (response.ok) {
        const allComments = await response.json()
        const approvedComments = allComments.filter((comment: any) => comment.approved)
        setComments(approvedComments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openBlogModal = (blog: Blog) => {
    setSelectedBlog(blog)
    document.body.style.overflow = 'hidden'
  }

  const closeBlogModal = () => {
    setSelectedBlog(null)
    document.body.style.overflow = 'unset'
  }

  const handleShare = () => {
    if (navigator.share && selectedBlog) {
      navigator.share({
        title: selectedBlog.title,
        text: selectedBlog.content.substring(0, 150) + '...',
        url: window.location.origin + '/blog/' + selectedBlog.slug
      })
    } else {
      navigator.clipboard.writeText(window.location.origin + '/blog/' + selectedBlog?.slug)
    }
  }

  const getBlogComments = (blogId: string) => {
    return comments.filter(comment => comment.blogId === blogId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 oromo-pattern opacity-10" />
        <div className="relative z-10">
          <section className="py-20 px-6">
            <div className="container-fira text-center">
              <div className="max-w-3xl mx-auto">
                <Skeleton className="h-12 w-48 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto mb-8" />
                <Skeleton className="h-10 w-full max-w-md mx-auto rounded-lg" />
              </div>
            </div>
          </section>
          <section className="pb-20 px-6">
            <div className="container-fira">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-forest/20 rounded-xl p-6">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 oromo-pattern opacity-10" />
      
      {/* Floating Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container-fira text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
                <span className="text-foreground">Our</span>
                <br />
                <span className="text-gradient-gold">Blog</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Insights, stories, and updates from the Fira Tech team about technology, 
                heritage, and community innovation in Africa.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card/60 backdrop-blur-sm border-forest/20 focus:border-accent/50"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Blogs Grid */}
        <section className="pb-20 px-6">
          <div className="container-fira">
            {filteredBlogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No blogs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Check back soon for new content!'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      className="border-forest/20 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                      onClick={() => openBlogModal(blog)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {blog._count.comments}
                          </div>
                        </div>
                        <CardTitle className="text-xl text-foreground line-clamp-2">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-1" />
                          {blog.author.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {blog.content}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full border-forest/20 hover:bg-forest/10 group"
                          onClick={(e) => {
                            e.stopPropagation()
                            openBlogModal(blog)
                          }}
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Blog Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeBlogModal}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeBlogModal}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card/90 backdrop-blur-xl border border-forest/20 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeBlogModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Content */}
              <div className="max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-8 pb-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-forest to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {selectedBlog.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedBlog.author.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedBlog.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="border-forest/20 hover:bg-forest/10"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-forest/20 hover:bg-forest/10"
                      >
                        <Bookmark className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-4">
                    {selectedBlog.title}
                  </h1>

                  <div className="flex items-center space-x-4 text-muted-foreground mb-8">
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {getBlogComments(selectedBlog.id).length} comments
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(selectedBlog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8">
                  <div className="prose prose-lg max-w-none">
                    <div className="text-foreground leading-relaxed space-y-6">
                      {selectedBlog.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-8 pt-8 border-t border-forest/20">
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

                  {/* Comments */}
                  {getBlogComments(selectedBlog.id).length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold text-foreground mb-6">
                        Comments ({getBlogComments(selectedBlog.id).length})
                      </h3>
                      <div className="space-y-6">
                        {getBlogComments(selectedBlog.id).map((comment, index) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="border-l-2 border-accent/30 pl-4"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-forest to-accent rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">
                                  {comment.author.charAt(0).toUpperCase()}
                                </span>
                              </div>
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
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
