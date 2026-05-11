import { VercelRequest, VercelResponse } from '@vercel/node'
import { jobsDB, Job, CreateJobData, UpdateJobData } from '../../lib/jobs'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // GET all active jobs (public endpoint)
    if (req.method === 'GET') {
      const activeJobs = jobsDB.getActiveJobs()
      return res.status(200).json(activeJobs)
    }

    // POST new job (admin endpoint)
    if (req.method === 'POST') {
      const jobData: CreateJobData = req.body
      
      // Validation
      if (!jobData.title || !jobData.description || !jobData.department || !jobData.location) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, description, department, location' 
        })
      }

      const newJob = jobsDB.createJob(jobData)
      return res.status(201).json(newJob)
    }

    // PUT update job (admin endpoint)
    if (req.method === 'PUT') {
      const jobData: UpdateJobData = req.body
      
      if (!jobData.id) {
        return res.status(400).json({ error: 'Job ID is required' })
      }

      const updatedJob = jobsDB.updateJob(jobData)
      if (!updatedJob) {
        return res.status(404).json({ error: 'Job not found' })
      }

      return res.status(200).json(updatedJob)
    }

    // DELETE job (admin endpoint)
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

    // PATCH toggle job status (admin endpoint)
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
    console.error('Jobs API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
