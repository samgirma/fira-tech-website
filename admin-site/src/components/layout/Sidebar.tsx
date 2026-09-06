import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserPlus,
  Inbox,
  FileText,
  FolderKanban,
  ListTodo,
  Globe,
  Image,
  Newspaper,
  Star,
  Package,
  Rocket,
  Briefcase,
  FileUser,
  DollarSign,
  BarChart3,
  Lightbulb,
  Target,
  Bell,
  Settings,
  History,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react'

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: number
}

const navigation: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Overview', href: '/overview', icon: LayoutDashboard },
      { label: 'My Day', href: '/my-day', icon: CalendarDays },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { label: 'Leads', href: '/business/leads', icon: UserPlus },
      { label: 'Customers', href: '/business/customers', icon: Users },
      { label: 'Requests', href: '/business/requests', icon: Inbox },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderKanban },
      { label: 'Tasks', href: '/tasks', icon: ListTodo },
    ],
  },
  {
    label: 'ENGINEERING',
    items: [
      { label: 'GitHub Overview', href: '/github', icon: GitBranch },
      { label: 'Repositories', href: '/github/repositories', icon: GitBranch },
      { label: 'Issues', href: '/github/issues', icon: GitBranch },
      { label: 'Pull Requests', href: '/github/pull-requests', icon: GitBranch },
      { label: 'Releases', href: '/github/releases', icon: GitBranch },
      { label: 'Workflows', href: '/github/workflows', icon: GitBranch },
      { label: 'Members', href: '/github/members', icon: Users },
      { label: 'Activity', href: '/github/activity', icon: GitBranch },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { label: 'Website', href: '/website', icon: Globe },
      { label: 'Portfolio', href: '/website/portfolio', icon: Image },
      { label: 'Blog', href: '/website/blog', icon: Newspaper },
      { label: 'Testimonials', href: '/website/testimonials', icon: Star },
      { label: 'Media', href: '/website/media', icon: Image },
    ],
  },
  {
    label: 'PRODUCTS',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Roadmap', href: '/products/roadmap', icon: Rocket },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { label: 'Careers', href: '/careers', icon: Briefcase },
      { label: 'Applications', href: '/careers/applications', icon: FileUser },
    ],
  },
  {
    label: 'MONEY',
    items: [
      { label: 'Revenue', href: '/finance/revenue', icon: DollarSign },
      { label: 'Expenses', href: '/finance/expenses', icon: DollarSign },
      { label: 'Invoices', href: '/finance/invoices', icon: FileText },
    ],
  },
  {
    label: 'INSIGHTS',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Insights', href: '/insights', icon: Lightbulb },
      { label: 'Goals', href: '/goals', icon: Target },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Audit Log', href: '/audit', icon: History },
    ],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigation.map((g) => g.label)
  )

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-surface-200 z-40 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-100">
        {!isCollapsed && (
          <Link to="/overview" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="font-semibold text-surface-900 tracking-tight">
              Fira Command
            </span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navigation.map((group) => (
          <div key={group.label} className="mb-2">
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-1.5 text-2xs font-semibold text-surface-400 uppercase tracking-wider hover:text-surface-600"
              >
                {group.label}
                <ChevronDown
                  size={14}
                  className={cn(
                    'transition-transform',
                    expandedGroups.includes(group.label) ? '' : '-rotate-90'
                  )}
                />
              </button>
            )}
            {(isCollapsed || expandedGroups.includes(group.label)) && (
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/overview' && item.href !== '/my-day' && location.pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900',
                        isCollapsed && 'justify-center px-2'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon size={18} className={cn(isActive && 'text-brand-600')} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-2xs font-medium bg-brand-100 text-brand-700 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
