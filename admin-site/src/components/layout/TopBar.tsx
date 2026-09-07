import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider'
import { useTheme } from '../theme-provider'
import { api } from '../../services/api'
import { getInitials, getRelativeTime } from '../../lib/utils'
import {
  Search,
  Bell,
  Plus,
  Command,
  LogOut,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  CheckCircle2,
  Mail,
} from 'lucide-react'

interface TopBarProps {
  onSearchOpen: () => void
}

export default function TopBar({ onSearchOpen }: TopBarProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Load unread messages for notification dropdown
    api.getContactMessages()
      .then((msgs) => setNotifications(msgs.slice(0, 5)))
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
      {/* Left: Search trigger */}
      <button
        onClick={onSearchOpen}
        className="flex items-center gap-3 px-4 py-2 bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-400 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-600 dark:hover:text-surface-200 transition-colors min-w-[260px] sm:min-w-[320px]"
      >
        <Search size={16} />
        <span>Search clients, projects, invoices...</span>
        <kbd className="ml-auto text-2xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-300 px-1.5 py-0.5 rounded">
          <Command size={10} className="inline" /> K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={18} className="text-gold-400" /> : <Moon size={18} />}
        </button>

        {/* Quick Create */}
        <div className="relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="btn-primary text-sm h-9 px-3"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create</span>
          </button>

          {showQuickCreate && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickCreate(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-900 rounded-xl shadow-elevated border border-surface-200 dark:border-surface-800 py-2 z-50 animate-in fade-in zoom-in-95">
                {[
                  { label: 'New Client', href: '/clients/pipeline?new=true' },
                  { label: 'New Project', href: '/projects?new=true' },
                  { label: 'New Invoice', href: '/finance/invoices?new=true' },
                  { label: 'New Case Study', href: '/website/portfolio?new=true' },
                  { label: 'New Blog Post', href: '/website/blog?new=true' },
                  { label: 'New Job Listing', href: '/website/careers?new=true' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-brand-600 dark:hover:text-brand-400"
                    onClick={() => setShowQuickCreate(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-900 rounded-xl shadow-elevated border border-surface-200 dark:border-surface-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-100 dark:border-surface-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                    Recent Messages & Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-surface-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-green-500" />
                      No new alerts
                    </div>
                  ) : (
                    notifications.map((msg) => (
                      <Link
                        key={msg.id}
                        to="/website/settings"
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                      >
                        <Mail size={16} className="text-brand-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-surface-900 dark:text-surface-100 truncate">
                            {msg.name}
                          </p>
                          <p className="text-2xs text-surface-500 dark:text-surface-400 line-clamp-1">
                            {msg.subject || msg.message}
                          </p>
                          <span className="text-2xs text-surface-400 mt-0.5 block">
                            {getRelativeTime(msg.created_at)}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
              <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                {user ? getInitials(user.name) : 'S'}
              </span>
            </div>
            <ChevronDown size={14} className="text-surface-400" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-900 rounded-xl shadow-elevated border border-surface-200 dark:border-surface-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-surface-100 dark:border-surface-800">
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                    {user?.name || 'Solo Founder'}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                    {user?.email || 'contact@firatech.systems'}
                  </p>
                </div>

                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={14} />
                  <span>Platform Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
