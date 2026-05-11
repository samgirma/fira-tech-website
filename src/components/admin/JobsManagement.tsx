import React, { useState, useEffect } from 'react'
import { Briefcase, MapPin, Users, Plus, Edit2, Trash2, Eye, EyeOff, Clock } from 'lucide-react'
import { Job, CreateJobData, UpdateJobData } from '../../lib/jobs'

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'FULL_TIME',
    experience: 'ENTRY',
    remote: false
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/jobs')
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

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      const newJob = await response.json()
      setJobs(prev => [newJob, ...prev])
      setShowCreateForm(false)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    }
  }

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingJob) return

    try {
      const updateData: UpdateJobData = {
        id: editingJob.id,
        ...formData
      }

      const response = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to update job')
      }

      const updatedJob = await response.json()
      setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
      setEditingJob(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch(`/api/admin/jobs?id=${jobId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete job')
      }

      setJobs(prev => prev.filter(job => job.id !== jobId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job')
    }
  }

  const handleToggleStatus = async (jobId: string) => {
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: jobId })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle job status')
      }

      const updatedJob = await response.json()
      setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle job status')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      department: '',
      location: '',
      type: 'FULL_TIME',
      experience: 'ENTRY',
      remote: false
    })
  }

  const startEdit = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      type: job.type,
      experience: job.experience,
      remote: job.remote
    })
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Management</h2>
          <p className="text-muted-foreground">
            {jobs.length} total position{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-forest to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingJob) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-forest/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {editingJob ? 'Edit Job' : 'Create New Job'}
            </h3>
            
            <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-forest/50"
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-forest/50"
                    placeholder="e.g. Engineering"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-forest/50 h-32 resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-forest/50"
                    placeholder="e.g. Adama, Ethiopia (Remote)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-forest/50"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-forest/50"
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="MID">Mid Level</option>
                    <option value="SENIOR">Senior Level</option>
                    <option value="LEAD">Lead Level</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remote}
                      onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
                      className="w-4 h-4 text-forest border-forest/20 rounded focus:ring-forest/50"
                    />
                    <span className="text-sm font-medium text-foreground">Remote Position</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-forest to-accent text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingJob(null)
                    resetForm()
                  }}
                  className="border border-forest/20 text-foreground px-6 py-2 rounded-lg hover:bg-forest/10 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-card border border-forest/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-forest/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Job Title</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Department</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Location</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-forest/10 hover:bg-forest/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{getExperienceLabel(job.experience)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{job.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-forest/10 text-forest px-2 py-1 rounded-full text-xs font-medium">
                      {getTypeLabel(job.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(job.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        job.isActive 
                          ? 'bg-accent/10 text-accent hover:bg-accent/20' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {job.isActive ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Open
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Closed
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(job)}
                        className="p-2 text-muted-foreground hover:text-forest hover:bg-forest/10 rounded-lg transition-colors"
                        title="Edit job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No jobs created yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
