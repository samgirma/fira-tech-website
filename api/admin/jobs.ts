import { VercelRequest, VercelResponse } from '@vercel/node'
import { jobsDB, Job } from '../../../lib/jobs'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // GET all jobs (admin endpoint - includes inactive)
    if (req.method === 'GET') {
      const allJobs = jobsDB.getAllJobs()
      return res.status(200).json(allJobs)
    }

    // POST new job
    if (req.method === 'POST') {
      const jobData = req.body
      
      // Validation
      if (!jobData.title || !jobData.description || !jobData.department || !jobData.location) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, description, department, location' 
        })
      }

      const newJob = jobsDB.createJob(jobData)
      return res.status(201).json(newJob)
    }

    // PUT update job
    if (req.method === 'PUT') {
      const jobData = req.body
      
      if (!jobData.id) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      const updatedJob = jobsDB.updateJob(jobData)
      if (!updatedJob) {
        return res.status(404).json({ error: 'Job not found' })
      }

      return res.status(200).json(updatedJob)
    }

    // DELETE job
    if (req.method === 'DELETE') {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      const deleted = jobsDB.deleteJob(id as string)
      if (!deleted) {
        return res.status(404).json({ error: 'Job not found' })
      }

      return res.status(200).json({ message: 'Job deleted successfully' })
    }

    // PATCH toggle job status
    if (req.method === 'PATCH') {
      const { id } = req.body
      
      if (!id) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      const updatedJob = jobsDB.toggleJobStatus(id)
      if (!updatedJob) {
        return res.status(404).json({ error: 'Job not found' })
      }

      return res.status(200).json(updatedJob)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin Jobs API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
