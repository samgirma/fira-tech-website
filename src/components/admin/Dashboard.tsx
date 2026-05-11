import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, MessageSquare, Plus, Edit, Trash2, Eye, Shield, Briefcase } from 'lucide-react'
import BlogForm from './BlogForm'
import CommentManager from './CommentManager'
import JobsManagement from './JobsManagement'

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

interface DashboardProps {
  user: any
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [activeTab, setActiveTab] = useState('blogs')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [blogsRes, commentsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/blogs'),
        fetch('/api/admin/comments'),
        fetch('/api/admin/comments?pending=true')
      ])

      const [blogsData, commentsData, pendingData] = await Promise.all([
        blogsRes.json(),
        commentsRes.json(),
        pendingRes.json()
      ])

      setBlogs(blogsData)
      setComments(commentsData)
      setPendingComments(pendingData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      const response = await fetch(`/api/admin/blogs?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog.id !== id))
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const handleBlogSaved = () => {
    setEditingBlog(null)
    fetchData()
  }

  const handleCommentUpdated = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
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
        <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-forest/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-forest to-accent rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gradient-gold font-display">Admin Dashboard</h1>
              </motion.div>
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <Bell className="h-5 w-5 text-accent" />
                  {pendingComments.length > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {pendingComments.length}
                    </Badge>
                  )}
                </motion.div>
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="outline" onClick={onLogout} className="border-forest/20 hover:bg-forest/10">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-forest/20">
                <TabsTrigger 
                  value="blogs" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  Blogs
                </TabsTrigger>
                <TabsTrigger 
                  value="comments"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-accent data-[state=active]:text-white relative"
                >
                  Comments
                  {pendingComments.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {pendingComments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-accent data-[state=active]:text-white relative"
                >
                  Jobs
                  <Briefcase className="w-4 h-4 ml-2" />
                </TabsTrigger>
                <TabsTrigger 
                  value="new-blog"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  New Blog
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blogs" className="mt-6">
                <div className="space-y-4">
                  {blogs.map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="border-forest/20 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-foreground">{blog.title}</CardTitle>
                              <CardDescription>
                                By {blog.author.name} · {new Date(blog.createdAt).toLocaleDateString()}
                              </CardDescription>
                              <div className="flex gap-2 mt-2">
                                <Badge variant={blog.published ? "default" : "secondary"}>
                                  {blog.published ? 'Published' : 'Draft'}
                                </Badge>
                                <Badge variant="outline">
                                  {blog._count.comments} comments
                                </Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingBlog(blog)}
                                className="border-forest/20 hover:bg-forest/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                className="border-forest/20 hover:bg-forest/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteBlog(blog.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <CommentManager 
                  comments={comments} 
                  onCommentUpdated={handleCommentUpdated}
                />
              </TabsContent>

              <TabsContent value="jobs" className="mt-6">
                <JobsManagement />
              </TabsContent>

              <TabsContent value="new-blog" className="mt-6">
                <BlogForm 
                  blog={editingBlog}
                  onSaved={handleBlogSaved}
                  onCancel={() => {
                    setEditingBlog(null)
                    setActiveTab('blogs')
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
