import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Image,
  Plus,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMembers } from '../hooks/useMembers'
import { Avatar } from '../components/Avatar'
export function DashboardPage() {
  const { members, loading, error, refresh } = useMembers()
  const [today] = useState(() => new Date())
  const photos = members.filter((member) => member.photo_url).length
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DASHBOARD</span>
          <h1>Admin Control Room</h1>
          <p>Manage your club website data.</p>
        </div>
        <span className="date-chip">
          {new Intl.DateTimeFormat('en', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(today)}
        </span>
      </div>
      <section className="welcome-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Welcome back.</h2>
          <p>
            Manage your team members and events here.
          </p>
        </div>
        <Link to="/team?new=1" className="button primary">
          <Plus size={16} /> Add a team member
        </Link>
      </section>
      <div className="stats-grid dashboard-stats">
        <Link to="/team" className="stat-card">
          <span className="stat-icon">
            <UsersRound size={19} />
          </span>
          <div>
            <span>Team members</span>
            <strong>{loading || error ? '—' : members.length.toString().padStart(2, '0')}</strong>
          </div>
          <ArrowUpRight className="stat-arrow" size={17} />
        </Link>
        <Link to="/team" className="stat-card">
          <span className="stat-icon">
            <Image size={19} />
          </span>
          <div>
            <span>Profile photos</span>
            <strong>{loading || error ? '—' : photos.toString().padStart(2, '0')}</strong>
          </div>
          <ArrowUpRight className="stat-arrow" size={17} />
        </Link>
        <div className="stat-card">
          <span className="stat-icon">
            <ShieldCheck size={19} />
          </span>
          <div>
            <span>Workspace access</span>
            <strong className="stat-text">Administrator</strong>
          </div>
          <span className="stat-caption">
            <span className="status-dot" /> Session verified
          </span>
        </div>
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent connections</h2>
              <p>The latest people added to your team.</p>
            </div>
            <Link className="text-button" to="/team">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          {error ? (
            <div className="empty-state">
              <p role="alert">{error}</p>
              <button
                className="button secondary"
                onClick={() => {
                  void refresh()
                }}
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="empty-state" role="status">
              <span className="spinner" />
              Loading the team…
            </div>
          ) : members.length ? (
            <div className="recent-members">
              {members.slice(0, 4).map((member) => (
                <div key={member.id}>
                  <Avatar name={member.name} url={member.photo_url} />
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
                  <ArrowUpRight size={15} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty">
              <UsersRound size={27} />
              <h3>Your people belong here.</h3>
              <p>Start your directory with the first team member.</p>
              <Link to="/team?new=1" className="text-button">
                Add a member <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <section className="panel quick-actions">
          <div className="panel-heading">
            <div>
              <h2>A place for everything</h2>
              <p>Small updates. Meaningful connections.</p>
            </div>
          </div>
          <Link to="/team">
            <UsersRound size={20} />
            <div>
              <strong>Curate your team</strong>
              <p>Names, roles, and the faces behind them.</p>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <Link to="/events">
            <CalendarDays size={20} />
            <div>
              <strong>Collect your moments</strong>
              <p>Event management is the next chapter.</p>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <div className="quick-note">
            <ShieldCheck size={16} />
            <span>A private workspace for your club’s administrators.</span>
          </div>
        </section>
      </div>
    </>
  )
}
