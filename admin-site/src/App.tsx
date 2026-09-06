import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import AppShell from './components/layout/AppShell'
import OverviewPage from './features/dashboard/OverviewPage'
import MyDayPage from './features/my-day/MyDayPage'
import LeadsPage from './features/leads/LeadsPage'
import CustomersPage from './features/customers/CustomersPage'
import RequestsPage from './features/requests/RequestsPage'
import ProjectsPage from './features/projects/ProjectsPage'
import TasksPage from './features/tasks/TasksPage'
import GitHubOverviewPage from './features/github/GitHubOverviewPage'
import GitHubRepositoriesPage from './features/github/GitHubRepositoriesPage'
import GitHubIssuesPage from './features/github/GitHubIssuesPage'
import GitHubPullRequestsPage from './features/github/GitHubPullRequestsPage'
import GitHubReleasesPage from './features/github/GitHubReleasesPage'
import GitHubWorkflowsPage from './features/github/GitHubWorkflowsPage'
import GitHubMembersPage from './features/github/GitHubMembersPage'
import GitHubActivityPage from './features/github/GitHubActivityPage'
import GitHubSettingsPage from './features/github/GitHubSettingsPage'
import BlogPage from './features/website/BlogPage'
import PortfolioPage from './features/website/PortfolioPage'
import TestimonialsPage from './features/website/TestimonialsPage'
import MediaPage from './features/website/MediaPage'
import ProductsPage from './features/products/ProductsPage'
import RoadmapPage from './features/products/RoadmapPage'
import CareersPage from './features/careers/CareersPage'
import ApplicationsPage from './features/careers/ApplicationsPage'
import RevenuePage from './features/finance/RevenuePage'
import ExpensesPage from './features/finance/ExpensesPage'
import InvoicesPage from './features/finance/InvoicesPage'
import SettingsPage from './features/settings/SettingsPage'
import NotificationsPage from './features/notifications/NotificationsPage'
import AuditPage from './features/audit/AuditPage'
import AnalyticsPage from './features/analytics/AnalyticsPage'
import InsightsPage from './features/insights/InsightsPage'
import GoalsPage from './features/goals/GoalsPage'
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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
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
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/my-day" element={<MyDayPage />} />

        {/* Business */}
        <Route path="/business/leads" element={<LeadsPage />} />
        <Route path="/business/customers" element={<CustomersPage />} />
        <Route path="/business/requests" element={<RequestsPage />} />

        {/* Operations */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />

        {/* Engineering / GitHub */}
        <Route path="/github" element={<GitHubOverviewPage />} />
        <Route path="/github/repositories" element={<GitHubRepositoriesPage />} />
        <Route path="/github/issues" element={<GitHubIssuesPage />} />
        <Route path="/github/pull-requests" element={<GitHubPullRequestsPage />} />
        <Route path="/github/releases" element={<GitHubReleasesPage />} />
        <Route path="/github/workflows" element={<GitHubWorkflowsPage />} />
        <Route path="/github/members" element={<GitHubMembersPage />} />
        <Route path="/github/activity" element={<GitHubActivityPage />} />
        <Route path="/github/settings" element={<GitHubSettingsPage />} />

        {/* Content */}
        <Route path="/website" element={<BlogPage />} />
        <Route path="/website/portfolio" element={<PortfolioPage />} />
        <Route path="/website/blog" element={<BlogPage />} />
        <Route path="/website/testimonials" element={<TestimonialsPage />} />
        <Route path="/website/media" element={<MediaPage />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/roadmap" element={<RoadmapPage />} />

        {/* People */}
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/applications" element={<ApplicationsPage />} />

        {/* Finance */}
        <Route path="/finance/revenue" element={<RevenuePage />} />
        <Route path="/finance/expenses" element={<ExpensesPage />} />
        <Route path="/finance/invoices" element={<InvoicesPage />} />

        {/* Insights */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/goals" element={<GoalsPage />} />

        {/* System */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>

      {/* Catch all */}
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
