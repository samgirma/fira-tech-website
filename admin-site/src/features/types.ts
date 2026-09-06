export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
