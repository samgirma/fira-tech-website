import { useState } from 'react'
import { MessageSquareQuote, Plus, Lock } from 'lucide-react'

export default function TestimonialsPage() {
  const [showComingSoon, setShowComingSoon] = useState(false)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Testimonials</h1>
          <p className="page-subtitle">Client testimonials and reviews</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowComingSoon(true)}
        >
          <Plus size={16} />
          Add Testimonial
        </button>
      </div>

      {/* Empty State */}
      <div className="card">
        <div className="card-content flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <MessageSquareQuote size={24} className="text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">No testimonials yet</h3>
          <p className="text-surface-500 mt-2 text-center max-w-md">
            Collect and display client testimonials to build trust and credibility.
          </p>
          <button className="btn-primary mt-4" onClick={() => setShowComingSoon(true)}>
            <Plus size={16} />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">Coming Soon</h3>
            <p className="text-surface-500 mb-6">
              Testimonial management is under development. Check back soon to manage client reviews and feedback.
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowComingSoon(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
