import React, { useState, useEffect } from 'react'
import { Briefcase, MapPin, Clock, Users, Send } from 'lucide-react'
import { Job } from '../lib/jobs'

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      
      const data = await response.json()
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = (jobTitle: string) => {
    // In a real app, this would open an application form or redirect
    const email = 'careers@fira.tech'
    const subject = `Application for ${jobTitle}`
    const body = `I am interested in the ${jobTitle} position at Fira Tech.`
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'CONTRACT': 'Contract',
      'INTERNSHIP': 'Internship'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getExperienceLabel = (experience: string) => {
    const labels = {
      'ENTRY': 'Entry Level',
      'MID': 'Mid Level',
      'SENIOR': 'Senior Level',
      'LEAD': 'Lead Level'
    }
    return labels[experience as keyof typeof labels] || experience
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading career opportunities...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Load Jobs</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={fetchJobs}
            className="bg-gradient-to-r from-forest to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-forest/10 to-accent/10">
        <div className="container-fira px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Join Our
              <span className="text-gradient-gold"> Team</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Help us build the future of technology in Africa. We're looking for talented individuals who are passionate about innovation and cultural heritage.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-forest" />
                <span className="text-foreground">50+ Team Members</span>
              </div>
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-foreground">Adama, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-forest" />
                <span className="text-foreground">Flexible Work</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="container-fira px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-center">Open Positions</h2>
          <p className="text-muted-foreground text-center mb-12">
            {jobs.length > 0 
              ? `We have ${jobs.length} open position${jobs.length > 1 ? 's' : ''} available`
              : 'Find your perfect role below'
            }
          </p>

          {/* Jobs Grid */}
          {jobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card border border-forest/20 rounded-xl p-6 hover:shadow-lg hover:border-forest/40 transition-all duration-300 group"
                >
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-gradient-gold transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {job.remote && (
                        <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
                          Remote
                        </span>
                      )}
                      <span className="bg-forest/10 text-forest px-2 py-1 rounded-full text-xs font-medium">
                        {getTypeLabel(job.type)}
                      </span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{getExperienceLabel(job.experience)}</span>
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApply(job.title)}
                    className="w-full bg-gradient-to-r from-forest to-accent text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                No Current Openings
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                We have no current openings, but follow us for updates on future opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-forest to-accent text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200">
                  Join Our Talent Network
                </button>
                <button className="border border-forest/20 text-foreground px-6 py-3 rounded-lg hover:bg-forest/10 transition-all duration-200">
                  Follow Updates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-forest/5 to-accent/5 py-16">
        <div className="container-fira px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Don't See the Right Fit?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <button className="bg-gradient-to-r from-forest to-accent text-white px-8 py-4 rounded-lg hover:shadow-lg transition-all duration-200 text-lg">
              Send Your Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
