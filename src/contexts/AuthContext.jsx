import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/api/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState(() => authService.getSession())

  const login = useCallback(async (credentials) => {
    const nextSession = await authService.login(credentials)
    setSession(nextSession)
    return nextSession
  }, [])

  const signup = useCallback(async (payload) => {
    const nextSession = await authService.signup(payload)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
    queryClient.clear()
  }, [queryClient])

  const updateUser = useCallback((updates) => {
    const nextSession = authService.updateSessionUser(updates)
    setSession(nextSession)
    return nextSession
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      role: session?.user?.role ?? null,
      login,
      signup,
      logout,
      updateUser,
    }),
    [session, login, signup, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
