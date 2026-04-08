import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileText } from 'lucide-react'

interface Blog {
  id?: string
  title: string
  content: string
  published: boolean
  authorId: string
}

interface BlogFormProps {
  blog?: Blog | null
  onSaved: () => void
  onCancel: () => void
}

export default function BlogForm({ blog, onSaved, onCancel }: BlogFormProps) {
  const [title, setTitle] = useState(blog?.title || '')
  const [content, setContent] = useState(blog?.content || '')
  const [published, setPublished] = useState(blog?.published || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = blog?.id ? '/api/admin/blogs' : '/api/blogs'
      const method = blog?.id ? 'PUT' : 'POST'
      
      const payload = blog?.id 
        ? { id: blog.id, title, content, published }
        : { title, content, authorId: user.id }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        onSaved()
      } else {
        setError(data.error || 'Failed to save blog')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="border-forest/20 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-forest to-accent rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gradient-gold font-display">
                {blog?.id ? 'Edit Blog' : 'Create New Blog'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {blog?.id ? 'Update your blog post' : 'Write and publish a new blog post'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="border-forest/20 bg-background/50 focus:border-accent/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground font-medium">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here..."
                rows={15}
                className="border-forest/20 bg-background/50 focus:border-accent/50 resize-none"
                required
              />
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published" className="text-foreground font-medium">
                Publish immediately
              </Label>
            </div>

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

            <div className="flex space-x-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-forest to-accent hover:from-forest/90 hover:to-accent/90 text-white border-0 shadow-lg px-8"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {blog?.id ? 'Update Blog' : 'Create Blog'}
                </Button>
              </motion.div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="border-forest/20 hover:bg-forest/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
