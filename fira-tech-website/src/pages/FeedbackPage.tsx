import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeedbackPage() {
  const [partnerName, setPartnerName] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!partnerName.trim() || rating === 0) return
    setSending(true)
    try {
      const res = await fetch('/api/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_name: partnerName.trim(), rating, feedback: feedback.trim() }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      alert('Failed to submit. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background/40 backdrop-blur-sm flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-forest/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
          <p className="text-muted-foreground">Your feedback helps us improve and serve our community better.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-forest/20 rounded-2xl p-8 max-w-md w-full shadow-xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Share Your Experience</h1>
          <p className="text-muted-foreground text-sm">We value your feedback. Let us know how we're doing.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Your Name / Organization</label>
            <input
              type="text"
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              placeholder="e.g. Partner Organization"
              className="w-full bg-background border border-forest/20 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? "text-accent fill-accent"
                        : "text-muted-foreground/30"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-1">
                {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">What do you think about our company?</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full bg-background border border-forest/20 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!partnerName.trim() || rating === 0 || sending}
            className="w-full bg-gradient-to-r from-forest to-accent text-white"
          >
            {sending ? "Submitting..." : "Submit Feedback"}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
