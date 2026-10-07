import { useState } from 'react'
import { LockKeyhole, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
export function SettingsPage() {
  const { user, signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const logout = async () => {
    setBusy(true)
    try {
      await signOut()
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Account settings</h1>
          <p>View your account and manage your session.</p>
        </div>
      </div>
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <h2>Your account</h2>
            <p>Your current administrator account.</p>
          </div>
          <ShieldCheck size={21} />
        </div>
        <dl className="account-details">
          <div>
            <dt>Email address</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Workspace role</dt>
            <dd>
              <span className="role-badge">Administrator</span>
            </dd>
          </div>
          <div>
            <dt>Last signed in</dt>
            <dd>
              {user?.last_sign_in_at
                ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(user.last_sign_in_at),
                  )
                : 'Current session'}
            </dd>
          </div>
        </dl>
        <div className="settings-note">
          <LockKeyhole size={18} />
          <p>
            Access is managed by your club’s portal owner. Contact them to change your account
            permissions or reset your password.
          </p>
        </div>
        <div className="settings-signout">
          <div>
            <h3>Sign out</h3>
            <p>Sign out of this browser to close your workspace.</p>
          </div>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              void logout()
            }}
          >
            <LogOut size={16} />
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
      </section>
    </>
  )
}
