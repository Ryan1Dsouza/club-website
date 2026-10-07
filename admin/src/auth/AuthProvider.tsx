import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContext'
import type { AuthState } from './AuthContext'

const signedOut: AuthState = { status: 'unauthenticated', session: null, user: null }
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...signedOut,
    status: supabase ? 'checking' : 'unauthenticated',
  })
  const generation = useRef(0)
  const verify = useCallback(async (session: Session | null) => {
    const request = ++generation.current
    if (!session || !supabase) {
      setState(signedOut)
      return
    }
    setState((current) =>
      current.status === 'authenticated' &&
      current.user?.id === session.user.id &&
      (current.session?.expires_at ?? 0) * 1000 > Date.now()
        ? current
        : { ...signedOut, status: 'checking' },
    )
    try {
      // Validate with Auth and the server-owned allowlist, never user_metadata or localStorage alone.
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (request !== generation.current) return
      if (error || !user) {
        setState({
          ...signedOut,
          status: error?.status && error.status >= 500 ? 'error' : 'unauthenticated',
        })
        return
      }
      const { data: isAdmin, error: accessError } = await supabase.rpc('is_admin')
      if (request !== generation.current) return
      if (accessError) {
        setState({ ...signedOut, status: 'error' })
        return
      }
      if (!session.expires_at || session.expires_at * 1000 <= Date.now()) {
        setState(signedOut)
        return
      }
      setState({ session, user, status: isAdmin === true ? 'authenticated' : 'denied' })
    } catch {
      if (request === generation.current) setState({ ...signedOut, status: 'error' })
    }
  }, [])
  const retry = useCallback(() => {
    if (!supabase) return
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) setState({ ...signedOut, status: 'error' })
        else void verify(data.session)
      })
      .catch(() => setState({ ...signedOut, status: 'error' }))
  }, [verify])
  useEffect(() => {
    if (!supabase) return
    let queued: ReturnType<typeof setTimeout> | undefined
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      ++generation.current
      clearTimeout(queued)
      setState((current) =>
        !session
          ? signedOut
          : current.status === 'authenticated' &&
              current.user?.id === session.user.id &&
              (current.session?.expires_at ?? 0) * 1000 > Date.now()
            ? current
            : { ...signedOut, status: 'checking' },
      )
      // Defer SDK calls outside the Auth callback's lock to avoid deadlocks.
      queued = setTimeout(() => {
        void verify(session)
      }, 0)
    })
    const recheck = () => {
      if (document.visibilityState === 'visible') retry()
    }
    window.addEventListener('focus', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => {
      // This counter invalidates in-flight requests, so read its latest value on cleanup.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++generation.current
      clearTimeout(queued)
      subscription.unsubscribe()
      window.removeEventListener('focus', recheck)
      document.removeEventListener('visibilitychange', recheck)
    }
  }, [retry, verify])
  useEffect(() => {
    if (!state.session?.expires_at) return
    const timer = setTimeout(
      () => {
        ++generation.current
        setState(signedOut)
        retry()
      },
      Math.max(0, state.session.expires_at * 1000 - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [state.session, retry])
  const signOut = useCallback(async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw new Error('Unable to sign out. Check your connection and try again.')
    }
    ++generation.current
    setState(signedOut)
  }, [])
  return (
    <AuthContext.Provider value={{ ...state, retry, signOut }}>{children}</AuthContext.Provider>
  )
}
