import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, FileText, Users, FolderKanban, Briefcase, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const quickActions = [
  { label: 'Create Lead', href: '/business/leads/new', icon: Users },
  { label: 'Create Project', href: '/projects/new', icon: FolderKanban },
  { label: 'Create Task', href: '/tasks/new', icon: FileText },
  { label: 'Create Blog Post', href: '/website/blog/new', icon: FileText },
  { label: 'New Job Listing', href: '/careers/jobs/new', icon: Briefcase },
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onClose() // Will be toggled by parent
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const filteredActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredActions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
      navigate(filteredActions[selectedIndex].href)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-surface-950/50 z-50" onClick={onClose} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-white rounded-2xl shadow-elevated border border-surface-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100">
            <Search size={20} className="text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search or create..."
              className="flex-1 text-sm outline-none placeholder:text-surface-400"
            />
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface-100 text-surface-400"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filteredActions.length > 0 ? (
              filteredActions.map((action, index) => (
                <button
                  key={action.href}
                  onClick={() => {
                    navigate(action.href)
                    onClose()
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    index === selectedIndex
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-surface-700 hover:bg-surface-50'
                  )}
                >
                  <action.icon size={16} />
                  <span className="flex-1 text-left">{action.label}</span>
                  <ArrowRight size={14} className="text-surface-400" />
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-surface-500">
                No results found for "{query}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-surface-100 text-2xs text-surface-400">
            <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">↑↓</kbd> to navigate
            {' · '}
            <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">↵</kbd> to select
            {' · '}
            <kbd className="px-1.5 py-0.5 bg-surface-100 rounded">esc</kbd> to close
          </div>
        </div>
      </div>
    </>
  )
}
