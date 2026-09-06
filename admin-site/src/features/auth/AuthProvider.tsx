import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../../services/api'
import type { AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.getMe()
      setState({ user, isLoading: false, isAuthenticated: true })
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password)
    setState({ user, isLoading: false, isAuthenticated: true })
  }

  const logout = async () => {
    await api.logout()
    setState({ user: null, isLoading: false, isAuthenticated: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
