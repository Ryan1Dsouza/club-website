import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'denied' | 'error'
export interface AuthState {
  status: AuthStatus
  session: Session | null
  user: User | null
}
export const AuthContext = createContext<
  (AuthState & { retry: () => void; signOut: () => Promise<void> }) | null
>(null)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
