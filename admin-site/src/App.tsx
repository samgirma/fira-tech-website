import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import AppShell from './components/layout/AppShell'

// Dashboard
import OverviewPage from './features/dashboard/OverviewPage'

// Website CMS
import ContentBlocksPage from './features/website/ContentBlocksPage'
import PortfolioPage from './features/website/PortfolioPage'
import BlogPage from './features/website/BlogPage'
import TestimonialsPage from './features/website/TestimonialsPage'
import CareersPage from './features/website/CareersPage'
import MediaPage from './features/website/MediaPage'
import SiteSettingsPage from './features/website/SiteSettingsPage'

// Clients
import PipelinePage from './features/clients/PipelinePage'
import ClientDirectoryPage from './features/clients/ClientDirectoryPage'

// Projects
import ProjectsPage from './features/projects/ProjectsPage'
import ProjectDetailPage from './features/projects/ProjectDetailPage'
import GitHubProjectsPage from './features/projects/GitHubProjectsPage'

// Finance
import InvoicesPage from './features/finance/InvoicesPage'
import RevenueExpensesPage from './features/finance/RevenueExpensesPage'
import ReportsPage from './features/finance/ReportsPage'

// Settings
import SettingsPage from './features/settings/SettingsPage'

import { Loader2 } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/overview" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes inside AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/overview" replace />} />

        {/* 1. Dashboard */}
        <Route path="/overview" element={<OverviewPage />} />

        {/* 2. Website CMS */}
        <Route path="/website" element={<Navigate to="/website/content" replace />} />
        <Route path="/website/content" element={<ContentBlocksPage />} />
        <Route path="/website/portfolio" element={<PortfolioPage />} />
        <Route path="/website/blog" element={<BlogPage />} />
        <Route path="/website/testimonials" element={<TestimonialsPage />} />
        <Route path="/website/careers" element={<CareersPage />} />
        <Route path="/website/media" element={<MediaPage />} />
        <Route path="/website/settings" element={<SiteSettingsPage />} />

        {/* 3. Clients */}
        <Route path="/clients" element={<Navigate to="/clients/pipeline" replace />} />
        <Route path="/clients/pipeline" element={<PipelinePage />} />
        <Route path="/clients/directory" element={<ClientDirectoryPage />} />

        {/* 4. Projects */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/github" element={<Navigate to="/github" replace />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />

        {/* GitHub Organization */}
        <Route path="/github" element={<GitHubProjectsPage />} />
        <Route path="/gihub" element={<Navigate to="/github" replace />} />

        {/* 5. Finance */}
        <Route path="/finance" element={<Navigate to="/finance/invoices" replace />} />
        <Route path="/finance/invoices" element={<InvoicesPage />} />
        <Route path="/finance/ledger" element={<RevenueExpensesPage />} />
        <Route path="/finance/reports" element={<ReportsPage />} />

        {/* 6. Platform Settings */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Backward compatibility redirects */}
        <Route path="/my-day" element={<Navigate to="/overview" replace />} />
        <Route path="/business/leads" element={<Navigate to="/clients/pipeline" replace />} />
        <Route path="/business/customers" element={<Navigate to="/clients/directory" replace />} />
        <Route path="/business/requests" element={<Navigate to="/website/settings" replace />} />
        <Route path="/tasks" element={<Navigate to="/projects" replace />} />
        <Route path="/github/*" element={<Navigate to="/github" replace />} />
        <Route path="/careers/*" element={<Navigate to="/website/careers" replace />} />
        <Route path="/careers" element={<Navigate to="/website/careers" replace />} />
        <Route path="/finance/revenue" element={<Navigate to="/finance/ledger" replace />} />
        <Route path="/finance/expenses" element={<Navigate to="/finance/ledger" replace />} />
        <Route path="/analytics" element={<Navigate to="/finance/reports" replace />} />
        <Route path="/insights" element={<Navigate to="/overview" replace />} />
        <Route path="/goals" element={<Navigate to="/overview" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
