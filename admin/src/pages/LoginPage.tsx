import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AuthLoading } from '../auth/RequireAuth'
import { Brand } from '../components/Brand'
import { getSupabase, supabase } from '../lib/supabase'
import './login.css'

export function LoginPage() {
  const { status } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const from = (location.state as { from?: string } | null)?.from
  const destination = from && ['/', '/team', '/events', '/settings'].includes(from) ? from : '/'

  if (status === 'checking') return <AuthLoading />
  if (status === 'authenticated' || status === 'denied' || status === 'error')
    return <Navigate to={destination} replace />

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { error: authError } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(
          authError.status === 429
            ? 'Too many attempts. Please try again later.'
            : 'Unable to sign in. Check your email and password.',
        )
      }
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Brand />
        <h1 id="login-title">Admin login</h1>
        <p className="login-description">Sign in to manage the Nucleus website.</p>
        {!supabase && (
          <p className="notice error" role="alert">
            Login is not configured.
          </p>
        )}
        <form
          className="login-form"
          onSubmit={(event) => {
            void submit(event)
          }}
        >
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
          <label htmlFor="password">Password</label>
          <div className="login-password">
            <input
              id="password"
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary login-submit"
            type="submit"
            disabled={busy || !supabase}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
