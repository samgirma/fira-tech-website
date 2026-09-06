// User & Auth
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER' | 'MANAGER'
  avatar?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// API Response
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Leads
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social' | 'cold-outreach' | 'event' | 'other'

export interface Lead {
  id: string
  name: string
  company?: string
  email: string
  phone?: string
  serviceInterested?: string
  source: LeadSource
  estimatedValue?: number
  probability?: number
  status: LeadStatus
  owner?: string
  lastContact?: string
  nextAction?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Customers
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Projects
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'at-risk' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Project {
  id: string
  name: string
  clientId?: string
  clientName?: string
  description?: string
  category?: string
  status: ProjectStatus
  progress: number
  startDate?: string
  deadline?: string
  budget?: number
  actualCost?: number
  revenue?: number
  technologies?: string[]
  priority: ProjectPriority
  createdAt: string
  updatedAt: string
}

// Tasks
export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  projectId?: string
  projectName?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  estimatedTime?: number
  actualTime?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Blog
export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export interface BlogPost {
  id: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  coverImage?: string
  category?: string
  tags?: string[]
  authorId?: string
  authorName?: string
  status: BlogStatus
  published: boolean
  createdAt: string
  updatedAt: string
}

// Jobs
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'

export interface Job {
  id: string
  title: string
  description: string
  department?: string
  location?: string
  type?: JobType
  experience?: ExperienceLevel
  remote?: boolean
  isActive: boolean
  createdAt: string
}

// Contact Messages
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

// Settings
export interface Settings {
  [key: string]: string
}

// Satisfaction
export interface SatisfactionResponse {
  id: string
  partnerName: string
  rating: number
  feedback?: string
  createdAt: string
}

export interface SatisfactionStats {
  average: number
  total: number
  percentage: number
}

// Dashboard Stats
export interface DashboardStats {
  revenue: { current: number; previous: number; trend: number }
  leads: { current: number; previous: number; trend: number }
  projects: { active: number; total: number }
  requests: { pending: number; total: number }
}

// Navigation
export interface NavItem {
  label: string
  href: string
  icon?: string
  children?: NavItem[]
  badge?: number
}

// Notifications
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  read: boolean
  createdAt: string
  actionUrl?: string
}
