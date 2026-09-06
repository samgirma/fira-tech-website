import { Target } from 'lucide-react'

export default function GoalsPage() {
  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Goals</h1>
        <p className="page-subtitle">Track business goals and OKRs</p>
      </div>
      <div className="card">
        <div className="card-content flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <Target size={24} className="text-surface-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">No goals set</h3>
          <p className="text-surface-500 mt-2 text-center max-w-md">
            Define your first business goal to start tracking progress and measuring success.
          </p>
        </div>
      </div>
    </div>
  )
}
