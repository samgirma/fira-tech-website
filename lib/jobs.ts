// Job types and interfaces for Fira Tech careers system

export interface Job {
  id: string
  title: string
  description: string
  department: string
  location: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  experience: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'
  remote: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobData {
  title: string
  description: string
  department: string
  location: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  experience: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'
  remote: boolean
}

export interface UpdateJobData {
  id: string
  title?: string
  description?: string
  department?: string
  location?: string
  type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  experience?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'
  remote?: boolean
  isActive?: boolean
}

// Mock database - in production this would be Prisma/Supabase
let jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using React, Node.js, and modern cloud technologies.',
    department: 'Engineering',
    location: 'Adama, Ethiopia (Remote)',
    type: 'FULL_TIME',
    experience: 'SENIOR',
    remote: true,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    description: 'Join our design team to create beautiful, intuitive user experiences for our digital products. Strong portfolio required.',
    department: 'Design',
    location: 'Addis Ababa, Ethiopia (Hybrid)',
    type: 'FULL_TIME',
    experience: 'MID',
    remote: true,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Marketing Intern',
    description: 'Great opportunity for students to gain hands-on experience in tech marketing. Flexible hours and mentorship provided.',
    department: 'Marketing',
    location: 'Adama, Ethiopia (On-site)',
    type: 'INTERNSHIP',
    experience: 'ENTRY',
    remote: false,
    isActive: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  }
]

// Database operations
export const jobsDB = {
  // Get all active jobs
  getActiveJobs: (): Job[] => {
    return jobs.filter(job => job.isActive).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  // Get all jobs (for admin)
  getAllJobs: (): Job[] => {
    return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  // Get job by ID
  getJobById: (id: string): Job | undefined => {
    return jobs.find(job => job.id === id)
  },

  // Create new job
  createJob: (data: CreateJobData): Job => {
    const newJob: Job = {
      id: Date.now().toString(),
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    jobs.push(newJob)
    return newJob
  },

  // Update job
  updateJob: (data: UpdateJobData): Job | null => {
    const index = jobs.findIndex(job => job.id === data.id)
    if (index === -1) return null

    jobs[index] = {
      ...jobs[index],
      ...data,
      updatedAt: new Date()
    }
    return jobs[index]
  },

  // Delete job
  deleteJob: (id: string): boolean => {
    const index = jobs.findIndex(job => job.id === id)
    if (index === -1) return false

    jobs.splice(index, 1)
    return true
  },

  // Toggle job status
  toggleJobStatus: (id: string): Job | null => {
    const job = jobs.find(job => job.id === id)
    if (!job) return null

    job.isActive = !job.isActive
    job.updatedAt = new Date()
    return job
  }
}
