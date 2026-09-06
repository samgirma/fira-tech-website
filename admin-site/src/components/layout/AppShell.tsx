import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import SearchModal from '../shared/SearchModal'
import { cn } from '../../lib/utils'

export default function AppShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isSidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
        )}
      >
        {/* Top Bar */}
        <TopBar onSearchOpen={() => setIsSearchOpen(true)} />

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
