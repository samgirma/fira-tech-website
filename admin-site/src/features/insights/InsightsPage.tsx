import { Lightbulb } from 'lucide-react'

export default function InsightsPage() {
  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Insights</h1>
        <p className="page-subtitle">AI-powered business insights</p>
      </div>
      <div className="card">
        <div className="card-content flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <Lightbulb size={24} className="text-surface-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">Insights not available</h3>
          <p className="text-surface-500 mt-2 text-center max-w-md">
            Connect an AI provider (OpenAI, Gemini, or Groq) to generate smart business insights from your data.
          </p>
        </div>
      </div>
    </div>
  )
}
