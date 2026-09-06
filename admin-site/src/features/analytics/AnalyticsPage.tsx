import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track your business performance</p>
      </div>
      <div className="card">
        <div className="card-content flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <BarChart3 size={24} className="text-surface-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">Analytics not configured</h3>
          <p className="text-surface-500 mt-2 text-center max-w-md">
            Connect your analytics provider to start tracking website visitors, conversions, and business metrics.
          </p>
        </div>
      </div>
    </div>
  )
}
