import { useState } from 'react'
import { useAuth } from '../../features/auth/AuthProvider'
import { getInitials } from '../../lib/utils'
import {
  Search,
  Bell,
  Plus,
  Command,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react'

interface TopBarProps {
  onSearchOpen: () => void
}

export default function TopBar({ onSearchOpen }: TopBarProps) {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showQuickCreate, setShowQuickCreate] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Search trigger */}
      <button
        onClick={onSearchOpen}
        className="flex items-center gap-3 px-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors min-w-[280px]"
      >
        <Search size={16} />
        <span>Search...</span>
        <kbd className="ml-auto text-2xs font-medium bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded">
          <Command size={10} className="inline" /> K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Create */}
        <div className="relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="btn-primary text-sm"
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-surface-200 py-2 z-50">
                {[
                  { label: 'New Lead', href: '/business/leads/new' },
                  { label: 'New Customer', href: '/business/customers/new' },
                  { label: 'New Project', href: '/projects/new' },
                  { label: 'New Task', href: '/tasks/new' },
                  { label: 'New Blog Post', href: '/website/blog/new' },
                  { label: 'New Job', href: '/careers/jobs/new' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                    onClick={() => setShowQuickCreate(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-sm font-medium text-brand-700">
                {user ? getInitials(user.name) : '?'}
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
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-surface-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-surface-100">
                  <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                  <p className="text-xs text-surface-500">{user?.email}</p>
                </div>
                <a
                  href="/settings/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                >
                  <User size={16} />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                >
                  <Settings size={16} />
                  Settings
                </a>
                <hr className="my-1 border-surface-100" />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
