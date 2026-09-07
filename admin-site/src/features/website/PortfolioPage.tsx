import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Loader2,
  X,
  Code2,
} from 'lucide-react'

export interface PortfolioProject {
  id: string
  title: string
  slug: string
  client_name?: string
  category: string
  description: string
  challenge?: string
  solution?: string
  results?: string
  tech_stack: string[]
  live_url?: string
  github_url?: string
  image_url?: string
  is_featured: boolean
  is_published: boolean
  order_index: number
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setIsLoading(true)
      const data = await api.getPortfolio()
      setProjects(data || [])
    } catch (err) {
      console.error('Failed to load portfolio:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return
    try {
      setDeletingId(id)
      await api.deletePortfolioProject(id)
      await loadPortfolio()
    } catch (err) {
      console.error('Failed to delete portfolio project:', err)
      alert('Failed to delete project.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingProject) {
        await api.updatePortfolioProject(editingProject.id, data)
      } else {
        await api.createPortfolioProject(data)
      }
      setShowModal(false)
      setEditingProject(null)
      await loadPortfolio()
    } catch (err) {
      console.error('Failed to save portfolio project:', err)
      alert('Failed to save project.')
    }
  }

  const handleTogglePublish = async (project: PortfolioProject) => {
    try {
      await api.updatePortfolioProject(project.id, { is_published: !project.is_published })
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, is_published: !p.is_published } : p))
      )
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Flagship Case Studies & Portfolio</h1>
          <p className="page-subtitle">
            Manage public case studies, architectural breakdowns, results, and live demonstrations
          </p>
        </div>

        <button
          className="btn-primary text-xs h-9 px-3"
          onClick={() => {
            setEditingProject(null)
            setShowModal(true)
          }}
        >
          <Plus size={15} />
          <span>New Case Study</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 w-full text-xs h-9"
          />
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card flex flex-col justify-between overflow-hidden group hover:border-brand-300 dark:hover:border-brand-700 transition-all"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                      {project.category}
                    </span>
                    <h3 className="font-bold text-base text-surface-900 dark:text-surface-100 mt-1.5">
                      {project.title}
                    </h3>
                    {project.client_name && (
                      <p className="text-2xs text-brand-600 dark:text-brand-400 font-medium">
                        Client: {project.client_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingProject(project)
                        setShowModal(true)
                      }}
                      className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-surface-400 hover:text-red-600"
                    >
                      {deletingId === project.id ? (
                        <Loader2 size={13} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {project.results && (
                  <div className="p-2.5 rounded-lg bg-surface-50 dark:bg-surface-800/60 border border-surface-200/50 dark:border-surface-700/50 text-2xs text-surface-700 dark:text-surface-300">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      Impact & Results:
                    </span>
                    <p className="line-clamp-2">{project.results}</p>
                  </div>
                )}

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(project.tech_stack || []).map((tech) => (
                    <span
                      key={tech}
                      className="text-3xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Status & Links */}
              <div className="p-4 bg-surface-50/50 dark:bg-surface-800/40 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between text-2xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTogglePublish(project)}
                    className="flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
                  >
                    {project.is_published ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Published
                      </span>
                    ) : (
                      <span className="text-surface-400 flex items-center gap-1">
                        <XCircle size={12} /> Draft
                      </span>
                    )}
                  </button>

                  {project.is_featured && (
                    <span className="flex items-center gap-0.5 text-gold-500 font-semibold">
                      <Star size={11} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-surface-400 hover:text-brand-600 dark:hover:text-brand-400"
                      title="Live Demo"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-surface-400 hover:text-brand-600 dark:hover:text-brand-400"
                      title="GitHub Source"
                    >
                      <Code2 size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center mx-auto mb-3 text-brand-600">
            <Briefcase size={26} />
          </div>
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
            No portfolio case studies
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-sm mx-auto">
            Showcase your engineering accomplishments and architectural triumphs to potential clients.
          </p>
          <button
            className="btn-primary mt-4 text-xs h-9 px-4 inline-flex items-center gap-1.5"
            onClick={() => {
              setEditingProject(null)
              setShowModal(true)
            }}
          >
            <Plus size={15} />
            Add Case Study
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <PortfolioModal
          project={editingProject || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingProject(null)
          }}
        />
      )}
    </div>
  )
}

function PortfolioModal({
  project,
  onSave,
  onClose,
}: {
  project?: PortfolioProject
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(project?.title || '')
  const [slug, setSlug] = useState(project?.slug || '')
  const [clientName, setClientName] = useState(project?.client_name || '')
  const [category, setCategory] = useState(project?.category || 'Cloud & Infrastructure')
  const [description, setDescription] = useState(project?.description || '')
  const [challenge, setChallenge] = useState(project?.challenge || '')
  const [solution, setSolution] = useState(project?.solution || '')
  const [results, setResults] = useState(project?.results || '')
  const [techStack, setTechStack] = useState(project?.tech_stack?.join(', ') || 'TypeScript, Node.js, PostgreSQL')
  const [liveUrl, setLiveUrl] = useState(project?.live_url || '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '')
  const [isFeatured, setIsFeatured] = useState(project?.is_featured || false)
  const [isPublished, setIsPublished] = useState(project?.is_published ?? true)
  const [orderIndex, setOrderIndex] = useState(project?.order_index || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!project) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return

    try {
      setIsSubmitting(true)
      await onSave({
        title,
        slug,
        client_name: clientName || undefined,
        category,
        description,
        challenge: challenge || undefined,
        solution: solution || undefined,
        results: results || undefined,
        tech_stack: techStack.split(',').map((t) => t.trim()).filter(Boolean),
        live_url: liveUrl || undefined,
        github_url: githubUrl || undefined,
        is_featured: isFeatured,
        is_published: isPublished,
        order_index: Number(orderIndex) || 0,
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
            {project ? 'Edit Case Study' : 'Create Flagship Case Study'}
          </h3>
          <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Case Study Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Slug (URL Key) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Client / Partner Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. BROS Technology"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. FinTech Architecture"
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              High-Level Overview / Executive Summary *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                The Engineering Challenge
              </label>
              <textarea
                rows={2}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                className="input w-full resize-none"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                The Architectural Solution
              </label>
              <textarea
                rows={2}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="input w-full resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Measurable Business Results & Performance
            </label>
            <input
              type="text"
              value={results}
              onChange={(e) => setResults(e.target.value)}
              placeholder="e.g. 99.99% uptime, 4x transaction throughput increase"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
              Tech Stack (comma separated)
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, TypeScript, Tailwind, Node.js, PostgreSQL"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                Live URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://client-demo.firatech.systems"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-surface-600 dark:text-surface-400 font-medium mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/Fira-Tech-Solutions/..."
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-surface-700 dark:text-surface-300 font-medium">
                Published to Public Site
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-surface-700 dark:text-surface-300 font-medium">
                Featured on Homepage
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-outline text-xs h-9 px-4">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs h-9 px-4">
              {isSubmitting && <Loader2 size={14} className="animate-spin mr-1.5" />}
              {project ? 'Update Case Study' : 'Publish Case Study'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
