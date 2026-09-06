import { z } from 'zod'

export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        })
      }
      next(error)
    }
  }
}

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().optional(),
})

export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  experience: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']).optional(),
  remote: z.boolean().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
})

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  serviceInterested: z.string().optional(),
  source: z.string().optional(),
  estimatedValue: z.number().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  customerId: z.string().uuid().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'at-risk', 'completed', 'cancelled']).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.number().optional(),
  technologies: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  projectId: z.string().uuid().optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dueDate: z.string().optional(),
})

export const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  label: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
})

export const settingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string(),
})
