const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class PublicApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }

  private async post<T>(path: string, data: any): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  async getCompany() {
    return this.get<any>('/api/v1/public/company')
  }

  async getNavigation() {
    return this.get<any>('/api/v1/public/navigation')
  }

  async getHome() {
    return this.get<any>('/api/v1/public/home')
  }

  async getServices() {
    return this.get<any[]>('/api/v1/public/services')
  }

  async getService(slug: string) {
    return this.get<any>(`/api/v1/public/services/${slug}`)
  }

  async getProjects(params?: { featured?: boolean; category?: string; technology?: string }) {
    const query = new URLSearchParams()
    if (params?.featured) query.set('featured', 'true')
    if (params?.category) query.set('category', params.category)
    if (params?.technology) query.set('technology', params.technology)
    const qs = query.toString()
    return this.get<any[]>(`/api/v1/public/projects${qs ? '?' + qs : ''}`)
  }

  async getProject(slug: string) {
    return this.get<any>(`/api/v1/public/projects/${slug}`)
  }

  async getBlogPosts(params?: { category?: string }) {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    const qs = query.toString()
    return this.get<any[]>(`/api/v1/public/blog${qs ? '?' + qs : ''}`)
  }

  async getBlogPost(slug: string) {
    return this.get<any>(`/api/v1/public/blog/${slug}`)
  }

  async getTestimonials() {
    return this.get<any[]>('/api/v1/public/testimonials')
  }

  async getJobs() {
    return this.get<any[]>('/api/v1/public/jobs')
  }

  async getJob(id: string) {
    return this.get<any>(`/api/v1/public/jobs/${id}`)
  }

  async submitContact(data: { name: string; email: string; subject?: string; message: string }) {
    return this.post<any>('/api/v1/public/contact', data)
  }

  async submitProjectRequest(data: {
    name: string
    email: string
    phone?: string
    company?: string
    projectType?: string
    description: string
    timeline?: string
    budget?: string
    additionalInfo?: string
  }) {
    return this.post<any>('/api/v1/public/project-requests', data)
  }

  async submitApplication(data: {
    jobId: string
    name: string
    email: string
    phone?: string
    cvUrl?: string
    portfolioUrl?: string
    githubUrl?: string
    linkedinUrl?: string
    coverLetter?: string
  }) {
    return this.post<any>('/api/v1/public/job-applications', data)
  }
}

export const site = new PublicApiClient(API_BASE)
