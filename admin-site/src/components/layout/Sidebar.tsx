import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  Globe,
  Briefcase,
  Newspaper,
  Star,
  Users,
  Image,
  Sliders,
  GitBranch,
  FolderKanban,
  Kanban,
  Receipt,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileUser,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    label: 'DASHBOARD',
    items: [
      { label: 'Overview', href: '/overview', icon: LayoutDashboard },
    ],
  },
  {
    label: 'WEBSITE',
    items: [
      { label: 'Content', href: '/website/content', icon: Globe },
      { label: 'Portfolio / Case Studies', href: '/website/portfolio', icon: Briefcase },
      { label: 'Blog', href: '/website/blog', icon: Newspaper },
      { label: 'Testimonials', href: '/website/testimonials', icon: Star },
      { label: 'Careers Postings', href: '/website/careers', icon: FileUser },
      { label: 'Media Library', href: '/website/media', icon: Image },
      { label: 'Site Settings', href: '/website/settings', icon: Sliders },
    ],
  },
  {
    label: 'CLIENTS',
    items: [
      { label: 'Pipeline', href: '/clients/pipeline', icon: Kanban },
      { label: 'Client Directory', href: '/clients/directory', icon: Users },
    ],
  },
  {
    label: 'PROJECTS',
    items: [
      { label: 'All Projects', href: '/projects', icon: FolderKanban },
      { label: 'GitHub Organization', href: '/github', icon: GitBranch },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { label: 'Invoices', href: '/finance/invoices', icon: Receipt },
      { label: 'Revenue & Expenses', href: '/finance/ledger', icon: DollarSign },
      { label: 'Reports', href: '/finance/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { label: 'Platform & Integrations', href: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation()
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }))
  }

  const isActive = (href: string) => {
    if (href === '/overview') {
      return location.pathname === '/' || location.pathname === '/overview'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100 dark:border-surface-800">
        <Link to="/overview" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-600/20">
            F
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-surface-900 dark:text-surface-100 text-sm leading-tight">
                Fira Command
              </span>
              <span className="text-2xs text-gold-600 dark:text-gold-400 font-medium uppercase tracking-wider">
                Founder OS
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navigation.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.label]

          return (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1 text-2xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={12}
                    className={cn(
                      'transition-transform duration-200',
                      isGroupCollapsed && '-rotate-90'
                    )}
                  />
                </button>
              )}

              {(!isGroupCollapsed || collapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                          active
                            ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          size={18}
                          className={cn(
                            'shrink-0 transition-colors',
                            active
                              ? 'text-brand-600 dark:text-brand-400'
                              : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                          )}
                        />

                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}

                        {/* Active indicator bar */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-600 rounded-r-full" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer / Status */}
      <div className="p-3 border-t border-surface-100 dark:border-surface-800">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-xs text-surface-500 dark:text-surface-400',
          collapsed && 'justify-center'
        )}>
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          {!collapsed && <span className="truncate">Production Live</span>}
        </div>
      </div>
    </aside>
  )
}
