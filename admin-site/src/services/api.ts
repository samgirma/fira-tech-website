const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // --- Auth ---
  async login(email: string, password: string) {
    return this.request<{ user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me')
  }

  async refreshSession() {
    return this.request<{ user: any; message: string }>('/api/auth/refresh', {
      method: 'POST',
    })
  }

  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    })
  }

  // --- Clients (Pipeline + Directory) ---
  async getClients(params?: { stage?: string; search?: string }) {
    const query = new URLSearchParams()
    if (params?.stage && params.stage !== 'all') query.set('stage', params.stage)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return this.request<any[]>(`/api/clients${qs ? '?' + qs : ''}`)
  }

  async getPipeline() {
    return this.request<{
      stages: Record<string, any[]>
      stats: { stage: string; count: number; totalValue: number }[]
      totalCount: number
    }>('/api/clients/pipeline')
  }

  async getClient(id: string) {
    return this.request<any>(`/api/clients/${id}`)
  }

  async createClient(data: any) {
    return this.request<any>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateClient(id: string, data: any) {
    return this.request<any>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteClient(id: string) {
    return this.request<any>(`/api/clients/${id}`, {
      method: 'DELETE',
    })
  }

  // Backward compatibility alias
  async getLeads() {
    return this.getClients()
  }
  async getCustomers() {
    return this.getClients()
  }

  // --- Projects ---
  async getProjects() {
    return this.request<any[]>('/api/projects')
  }

  async getProjectStats() {
    return this.request<any[]>('/api/projects/stats')
  }

  async getProject(id: string) {
    return this.request<any>(`/api/projects/${id}`)
  }

  async createProject(data: any) {
    return this.request<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request<any>(`/api/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async createProjectTask(projectId: string, data: { title: string; priority?: string; dueDate?: string; notes?: string }) {
    return this.request<any>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProjectTask(projectId: string, taskId: string, data: any) {
    return this.request<any>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProjectTask(projectId: string, taskId: string) {
    return this.request<any>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  async linkProjectRepo(projectId: string, repositoryId: string, isPrimary = true) {
    return this.request<any>(`/api/projects/${projectId}/github`, {
      method: 'POST',
      body: JSON.stringify({ repositoryId, isPrimary }),
    })
  }

  async unlinkProjectRepo(projectId: string, repoId: string) {
    return this.request<any>(`/api/projects/${projectId}/github/${repoId}`, {
      method: 'DELETE',
    })
  }

  // --- Website: Portfolio / Case Studies ---
  async getPortfolio() {
    return this.request<any[]>('/api/portfolio')
  }

  async getPortfolioProject(id: string) {
    return this.request<any>(`/api/portfolio/${id}`)
  }

  async createPortfolioProject(data: any) {
    return this.request<any>('/api/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePortfolioProject(id: string, data: any) {
    return this.request<any>(`/api/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePortfolioProject(id: string) {
    return this.request<any>(`/api/portfolio/${id}`, {
      method: 'DELETE',
    })
  }

  // --- Website: Services ---
  async getServices(all = true) {
    return this.request<any[]>(`/api/services${all ? '?all=true' : ''}`)
  }

  async createService(data: any) {
    return this.request<any>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateService(id: string, data: any) {
    return this.request<any>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteService(id: string) {
    return this.request<any>(`/api/services/${id}`, {
      method: 'DELETE',
    })
  }

  // --- Website: Blog & Comments ---
  async getBlogs() {
    return this.request<any[]>('/api/blogs')
  }

  async createBlog(data: { title: string; content: string; excerpt?: string; category?: string; tags?: string[]; published?: boolean }) {
    return this.request<any>('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBlog(id: string, data: any) {
    return this.request<any>(`/api/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBlog(id: string) {
    return this.request<any>(`/api/blogs/${id}`, {
      method: 'DELETE',
    })
  }

  async getComments(pending?: boolean) {
    const query = pending ? '?pending=true' : ''
    return this.request<any[]>(`/api/comments/admin/all${query}`)
  }

  async updateComment(id: string, approved: boolean) {
    return this.request<any>(`/api/comments/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ approved }),
    })
  }

  async deleteComment(id: string) {
    return this.request<any>(`/api/comments/admin/${id}`, {
      method: 'DELETE',
    })
  }

  // --- Website: Testimonials ---
  async getTestimonials(all = true) {
    return this.request<any[]>(`/api/testimonials${all ? '?all=true' : ''}`)
  }

  async createTestimonial(data: any) {
    return this.request<any>('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTestimonial(id: string, data: any) {
    return this.request<any>(`/api/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTestimonial(id: string) {
    return this.request<any>(`/api/testimonials/${id}`, {
      method: 'DELETE',
    })
  }

  // --- Website: Careers & Applications ---
  async getJobs() {
    return this.request<any[]>('/api/jobs/admin/all')
  }

  async createJob(data: any) {
    return this.request<any>('/api/jobs/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateJob(id: string, data: any) {
    return this.request<any>(`/api/jobs/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async toggleJobActive(id: string) {
    return this.request<any>(`/api/jobs/admin/${id}/toggle`, {
      method: 'PATCH',
    })
  }

  async deleteJob(id: string) {
    return this.request<any>(`/api/jobs/admin/${id}`, {
      method: 'DELETE',
    })
  }

  async getJobApplications(jobId?: string) {
    const qs = jobId ? `?jobId=${jobId}` : ''
    return this.request<any[]>(`/api/jobs/admin/applications${qs}`)
  }

  async sendApplicantEmail(applicationId: string, data: { subject: string; body: string; template?: string; newStatus?: string }) {
    return this.request<any>(`/api/jobs/admin/applications/${applicationId}/email`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateApplicationStatus(applicationId: string, status: string, notes?: string) {
    return this.request<any>(`/api/jobs/admin/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    })
  }

  async getApplicationEmails(applicationId: string) {
    return this.request<any[]>(`/api/jobs/admin/applications/${applicationId}/emails`)
  }

  // --- Website: Settings & Social Links ---
  async getSettings() {
    return this.request<Record<string, string>>('/api/settings')
  }

  async updateSetting(key: string, value: string) {
    return this.request<any>('/api/settings/admin', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    })
  }

  async getSocialLinks() {
    return this.request<any[]>('/api/social-links')
  }

  async createSocialLink(data: any) {
    return this.request<any>('/api/social-links/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSocialLink(id: string, data: any) {
    return this.request<any>(`/api/social-links/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSocialLink(id: string) {
    return this.request<any>(`/api/social-links/admin/${id}`, {
      method: 'DELETE',
    })
  }

  // --- Website: Satisfaction Survey ---
  async getSatisfactionResponses() {
    return this.request<any[]>('/api/satisfaction/admin')
  }

  async generateSatisfactionLink(partnerName: string) {
    return this.request<any>('/api/satisfaction/admin/generate-link', {
      method: 'POST',
      body: JSON.stringify({ partnerName }),
    })
  }

  // --- Website: Contact Messages ---
  async getContactMessages() {
    return this.request<any[]>('/api/contact/admin')
  }

  async markContactRead(id: string) {
    return this.request<any>(`/api/contact/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isRead: true }),
    })
  }

  // --- Finance ---
  async getFinanceOverview() {
    return this.request<{
      revenue: number
      expenses: number
      net: number
      outstanding: number
      overdue: number
    }>('/api/finance/overview')
  }

  async getFinanceReports() {
    return this.request<{
      summary: { totalRevenue: number; totalExpenses: number; netIncome: number; margin: number }
      monthlyTrends: { month: string; revenue: number; expenses: number; net: number }[]
      expenseCategories: { category: string; total: number }[]
      revenueCategories: { category: string; total: number }[]
    }>('/api/finance/reports')
  }

  async getInvoices() {
    return this.request<any[]>('/api/finance/invoices')
  }

  async createInvoice(data: any) {
    return this.request<any>('/api/finance/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateInvoice(id: string, data: any) {
    return this.request<any>(`/api/finance/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteInvoice(id: string) {
    return this.request<any>(`/api/finance/invoices/${id}`, {
      method: 'DELETE',
    })
  }

  async getRevenue() {
    return this.request<any[]>('/api/finance/revenue')
  }

  async createRevenue(data: any) {
    return this.request<any>('/api/finance/revenue', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteRevenue(id: string) {
    return this.request<any>(`/api/finance/revenue/${id}`, {
      method: 'DELETE',
    })
  }

  async getExpenses() {
    return this.request<any[]>('/api/finance/expenses')
  }

  async createExpense(data: any) {
    return this.request<any>('/api/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteExpense(id: string) {
    return this.request<any>(`/api/finance/expenses/${id}`, {
      method: 'DELETE',
    })
  }

  // --- GitHub Integration ---
  async getGitHubStatus() {
    return this.request<{ connected: boolean; organization?: string }>('/api/v1/integrations/github/status')
  }

  async getGitHubOrganization() {
    return this.request<any>('/api/v1/integrations/github/organization')
  }

  async getGitHubRepositories(params?: { type?: string; language?: string }) {
    const query = new URLSearchParams()
    if (params?.type) query.set('type', params.type)
    if (params?.language) query.set('language', params.language)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/repositories${qs ? '?' + qs : ''}`)
  }

  async getGitHubRepository(id: string) {
    return this.request<any>(`/api/v1/integrations/github/repositories/${id}`)
  }

  async getGitHubIssues(params?: { repoId?: string; state?: string }) {
    const query = new URLSearchParams()
    if (params?.repoId) query.set('repoId', params.repoId)
    if (params?.state) query.set('state', params.state)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/issues${qs ? '?' + qs : ''}`)
  }

  async getGitHubPullRequests(params?: { repoId?: string; state?: string }) {
    const query = new URLSearchParams()
    if (params?.repoId) query.set('repoId', params.repoId)
    if (params?.state) query.set('state', params.state)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/pull-requests${qs ? '?' + qs : ''}`)
  }

  async getGitHubReleases() {
    return this.request<any[]>('/api/v1/integrations/github/releases')
  }

  async getGitHubWorkflows() {
    return this.request<any[]>('/api/v1/integrations/github/workflows')
  }

  async getGitHubActivity() {
    return this.request<any[]>('/api/v1/integrations/github/activity')
  }

  async syncGitHub() {
    return this.request<any>('/api/v1/integrations/github/sync', {
      method: 'POST',
    })
  }

  // --- Tasks (Today Tasks for dashboard) ---
  async getTodayTasks() {
    return this.request<any[]>('/api/tasks?today=true')
  }

  // --- Image Upload ---
  async uploadImage(base64: string): Promise<{ url: string; public_id: string }> {
    const res = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(err.error || 'Image upload failed')
    }
    return res.json()
  }
}

export const api = new ApiClient(API_BASE_URL)
