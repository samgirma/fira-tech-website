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

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me')
  }

  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    })
  }

  // Blogs
  async getBlogs() {
    return this.request<any[]>('/api/admin/blogs')
  }

  async createBlog(data: { title: string; content: string; published?: boolean }) {
    return this.request<any>('/api/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteBlog(id: string) {
    return this.request<any>(`/api/admin/blogs?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Comments
  async getComments(pending?: boolean) {
    const query = pending ? '?pending=true' : ''
    return this.request<any[]>(`/api/admin/comments${query}`)
  }

  async updateComment(id: string, approved: boolean) {
    return this.request<any>('/api/admin/comments', {
      method: 'PUT',
      body: JSON.stringify({ id, approved }),
    })
  }

  async deleteComment(id: string) {
    return this.request<any>(`/api/admin/comments?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Jobs
  async getJobs() {
    return this.request<any[]>('/api/admin/jobs')
  }

  async createJob(data: any) {
    return this.request<any>('/api/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateJob(id: string, data: any) {
    return this.request<any>('/api/admin/jobs', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteJob(id: string) {
    return this.request<any>(`/api/admin/jobs?id=${id}`, {
      method: 'DELETE',
    })
  }

  async toggleJob(id: string) {
    return this.request<any>('/api/admin/jobs', {
      method: 'PATCH',
      body: JSON.stringify({ id }),
    })
  }

  // Social Links
  async getSocialLinks() {
    return this.request<any[]>('/api/admin/social-links')
  }

  async createSocialLink(data: any) {
    return this.request<any>('/api/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSocialLink(id: string, data: any) {
    return this.request<any>('/api/admin/social-links', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteSocialLink(id: string) {
    return this.request<any>(`/api/admin/social-links?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Settings
  async getSettings() {
    return this.request<Record<string, string>>('/api/admin/settings')
  }

  async updateSetting(key: string, value: string) {
    return this.request<any>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    })
  }

  // Contact Messages
  async getContactMessages() {
    return this.request<any[]>('/api/admin/contact')
  }

  async markContactRead(id: string, isRead: boolean) {
    return this.request<any>('/api/admin/contact', {
      method: 'PUT',
      body: JSON.stringify({ id, is_read: isRead }),
    })
  }

  async deleteContactMessage(id: string) {
    return this.request<any>(`/api/admin/contact?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Site Stats
  async getSiteStats() {
    return this.request<any[]>('/api/admin/site-stats')
  }

  async updateSiteStats(stats: any[]) {
    return this.request<any>('/api/admin/site-stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    })
  }

  // Satisfaction
  async getSatisfactionResponses() {
    return this.request<any[]>('/api/admin/satisfaction')
  }

  async deleteSatisfactionResponse(id: string) {
    return this.request<any>('/api/admin/satisfaction', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  }

  async generateSatisfactionLink() {
    return this.request<any>('/api/admin/satisfaction/generate-link', {
      method: 'POST',
    })
  }

  async getSatisfactionLinks() {
    return this.request<any[]>('/api/admin/satisfaction/links')
  }

  // Upload
  async uploadImage(imageBase64: string) {
    return this.request<{ url: string; public_id: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 }),
    })
  }

  // Customers
  async getCustomers() {
    return this.request<any[]>('/api/customers')
  }

  async getCustomer(id: string) {
    return this.request<any>(`/api/customers/${id}`)
  }

  async createCustomer(data: { name: string; email?: string; phone?: string; company?: string; industry?: string; notes?: string }) {
    return this.request<any>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCustomer(id: string, data: any) {
    return this.request<any>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(id: string) {
    return this.request<any>(`/api/customers/${id}`, {
      method: 'DELETE',
    })
  }

  // Leads
  async getLeads(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return this.request<any[]>(`/api/leads${qs ? '?' + qs : ''}`)
  }

  async getLeadStats() {
    return this.request<any[]>('/api/leads/stats')
  }

  async getLead(id: string) {
    return this.request<any>(`/api/leads/${id}`)
  }

  async createLead(data: any) {
    return this.request<any>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateLead(id: string, data: any) {
    return this.request<any>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteLead(id: string) {
    return this.request<any>(`/api/leads/${id}`, {
      method: 'DELETE',
    })
  }

  // Projects
  async getProjects(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return this.request<any[]>(`/api/projects${qs ? '?' + qs : ''}`)
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

  // Tasks
  async getTasks(params?: { status?: string; projectId?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.projectId) query.set('projectId', params.projectId)
    const qs = query.toString()
    return this.request<any[]>(`/api/tasks${qs ? '?' + qs : ''}`)
  }

  async getTodayTasks() {
    return this.request<any[]>('/api/tasks/today')
  }

  async getTask(id: string) {
    return this.request<any>(`/api/tasks/${id}`)
  }

  async createTask(data: { title: string; projectId?: string; status?: string; priority?: string; dueDate?: string }) {
    return this.request<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: any) {
    return this.request<any>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patchTaskStatus(id: string, status: string) {
    return this.request<any>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async deleteTask(id: string) {
    return this.request<any>(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Finance
  async getFinanceOverview() {
    return this.request<any>('/api/finance/overview')
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

  async getExpenses() {
    return this.request<any[]>('/api/finance/expenses')
  }

  async createExpense(data: any) {
    return this.request<any>('/api/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
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

  // GitHub Integration
  async getGitHubStatus() {
    return this.request<any>('/api/v1/integrations/github/status')
  }

  async getGitHubOrganization() {
    return this.request<any>('/api/v1/integrations/github/organization')
  }

  async getGitHubRepositories(params?: { archived?: boolean; search?: string; sort?: string }) {
    const query = new URLSearchParams()
    if (params?.archived !== undefined) query.set('archived', String(params.archived))
    if (params?.search) query.set('search', params.search)
    if (params?.sort) query.set('sort', params.sort)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/repositories${qs ? '?' + qs : ''}`)
  }

  async getGitHubRepository(id: string) {
    return this.request<any>(`/api/v1/integrations/github/repositories/${id}`)
  }

  async getGitHubMembers() {
    return this.request<any[]>('/api/v1/integrations/github/members')
  }

  async getGitHubIssues(params?: { repositoryId?: string; state?: string; search?: string }) {
    const query = new URLSearchParams()
    if (params?.repositoryId) query.set('repositoryId', params.repositoryId)
    if (params?.state) query.set('state', params.state)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/issues${qs ? '?' + qs : ''}`)
  }

  async getGitHubPullRequests(params?: { repositoryId?: string; state?: string }) {
    const query = new URLSearchParams()
    if (params?.repositoryId) query.set('repositoryId', params.repositoryId)
    if (params?.state) query.set('state', params.state)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/pull-requests${qs ? '?' + qs : ''}`)
  }

  async getGitHubReleases(params?: { repositoryId?: string }) {
    const query = new URLSearchParams()
    if (params?.repositoryId) query.set('repositoryId', params.repositoryId)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/releases${qs ? '?' + qs : ''}`)
  }

  async getGitHubWorkflows(params?: { repositoryId?: string; status?: string }) {
    const query = new URLSearchParams()
    if (params?.repositoryId) query.set('repositoryId', params.repositoryId)
    if (params?.status) query.set('status', params.status)
    const qs = query.toString()
    return this.request<any[]>(`/api/v1/integrations/github/workflows${qs ? '?' + qs : ''}`)
  }

  async getGitHubHealth() {
    return this.request<any>('/api/v1/integrations/github/health')
  }

  async getGitHubActivity(limit?: number) {
    const qs = limit ? `?limit=${limit}` : ''
    return this.request<any[]>(`/api/v1/integrations/github/activity${qs}`)
  }

  async syncGitHub(data?: { organization?: boolean; repositories?: boolean; members?: boolean; issues?: boolean; pullRequests?: boolean; releases?: boolean; workflows?: boolean }) {
    return this.request<any>('/api/v1/integrations/github/sync', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    })
  }

  async getGitHubProjectRepositories(projectId: string) {
    return this.request<any[]>(`/api/v1/integrations/github/projects/${projectId}/repositories`)
  }

  async linkGitHubRepository(projectId: string, repositoryId: string, isPrimary?: boolean, role?: string) {
    return this.request<any>(`/api/v1/integrations/github/projects/${projectId}/repositories`, {
      method: 'POST',
      body: JSON.stringify({ repositoryId, isPrimary, role }),
    })
  }

  async unlinkGitHubRepository(projectId: string, repositoryId: string) {
    return this.request<any>(`/api/v1/integrations/github/projects/${projectId}/repositories/${repositoryId}`, {
      method: 'DELETE',
    })
  }

  // Products
  async getProducts() {
    return this.request<any[]>('/api/products')
  }

  async createProduct(data: any) {
    return this.request<any>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/api/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Roadmap
  async getRoadmapItems() {
    return this.request<any[]>('/api/products/roadmap')
  }

  async createRoadmapItem(data: any) {
    return this.request<any>('/api/products/roadmap', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRoadmapItem(id: string, data: any) {
    return this.request<any>(`/api/products/roadmap/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRoadmapItem(id: string) {
    return this.request<any>(`/api/products/roadmap/${id}`, {
      method: 'DELETE',
    })
  }

  // Applications
  async getApplications() {
    return this.request<any[]>('/api/careers/applications')
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/api/notifications')
  }

  async getUnreadNotificationCount() {
    return this.request<{ count: number }>('/api/notifications/unread-count')
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/api/notifications/${id}/read`, { method: 'PUT' })
  }

  async markAllNotificationsRead() {
    return this.request<any>('/api/notifications/read-all', { method: 'PUT' })
  }

  async deleteNotification(id: string) {
    return this.request<any>(`/api/notifications/${id}`, { method: 'DELETE' })
  }

  // Audit Log
  async getAuditLog(params?: { entity_type?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams()
    if (params?.entity_type) query.set('entity_type', params.entity_type)
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    const qs = query.toString()
    return this.request<any[]>(`/api/audit${qs ? '?' + qs : ''}`)
  }

  async recordAuditEvent(data: { action: string; entity_type?: string; entity_id?: string; details?: any }) {
    return this.request<any>('/api/audit', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
