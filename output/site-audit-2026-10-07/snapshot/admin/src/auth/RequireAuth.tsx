import { Suspense, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldCheck, ShieldX } from 'lucide-react'
import { useAuth } from './AuthContext'
import { Brand } from '../components/Brand'

export function AuthLoading() {
  return (
    <div className="auth-status">
      <Brand />
      <div className="spinner" />
      <p role="status">Verifying your session…</p>
    </div>
  )
}
export function RequireAuth() {
  const { status, retry, signOut } = useAuth()
  const location = useLocation()
  const [error, setError] = useState('')
  if (status === 'checking') return <AuthLoading />
  if (status === 'unauthenticated')
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (status === 'denied' || status === 'error')
    return (
      <main className="auth-status">
        <Brand />
        <div className="access-card panel">
          <span className="large-icon">{status === 'denied' ? <ShieldX /> : <ShieldCheck />}</span>
          <h1>
            {status === 'denied' ? 'An invitation is required.' : 'We couldn’t verify access.'}
          </h1>
          <p>
            {status === 'denied'
              ? 'This account does not have administrator access. Ask the portal owner to add you to the admin list.'
              : 'Check your connection and make sure the Supabase setup has been completed, then try again.'}
          </p>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <div className="button-row">
            <button className="button secondary" onClick={retry}>
              Try again
            </button>
            <button
              className="button primary"
              onClick={() => {
                void signOut().catch((e: Error) => setError(e.message))
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    )
  return (
    <Suspense fallback={<AuthLoading />}>
      <Outlet />
    </Suspense>
  )
}
