import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Brand } from './Brand'
import { Avatar } from './Avatar'
const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/team', label: 'Team Members', icon: UsersRound },
  { to: '/news', label: 'Live News', icon: CalendarDays },
  { to: '/achievements', label: 'Achievements', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings2 },
]
export function AdminLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const active = links.find((link) => link.to === location.pathname)?.label || 'Dashboard'
  const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL
  const safeSiteUrl = typeof siteUrl === 'string' && /^https?:\/\//i.test(siteUrl) ? siteUrl : null
  useEffect(() => {
    if (!menuOpen) return
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])
  const logout = async () => {
    setSigningOut(true)
    setError('')
    try {
      await signOut()
    } catch (e) {
      setError((e as Error).message)
      setSigningOut(false)
    }
  }
  return (
    <div className="admin-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {menuOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar${menuOpen ? ' is-open' : ''}`} id="admin-navigation">
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-only"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-monogram">N</span>
          <div>
            Nucleus workspace<small>Website administration</small>
          </div>
          <ShieldCheck size={15} />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="small-orbit">✳</span>
            <h3>Made of many minds.</h3>
            <p>
              A little care behind the scenes.
              <br />A better space for everyone.
            </p>
            {safeSiteUrl && (
              <a href={safeSiteUrl} target="_blank" rel="noreferrer">
                Visit website <ArrowUpRight size={14} />
              </a>
            )}
          </div>
          <div className="sidebar-user">
            <Avatar name={user?.email || 'Admin'} />
            <div>
              <strong>Administrator</strong>
              <small title={user?.email}>{user?.email}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              title="Sign out"
              disabled={signingOut}
              onClick={() => {
                void logout()
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-only"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              aria-controls="admin-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{active}</strong>
          </div>
          <div className="session-indicator">
            <span className="status-dot" />
            <span>Admin session</span>
            <ShieldCheck size={15} />
          </div>
        </header>
        <main className="page-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>
            NUCLEUS <span className="footer-divider">/</span> CONTROL ROOM
          </span>
          <span>
            Made of many minds. <span className="footer-star">✳</span>
          </span>
        </footer>
      </div>
    </div>
  )
}
