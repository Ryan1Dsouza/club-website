import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Image,
  Newspaper,
  Trophy,
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
          <h1>Dashboard</h1>
          <p>Manage team profiles, events, news, and achievements.</p>
        </div>
        <span className="date-chip">
          {new Intl.DateTimeFormat('en', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(today)}
        </span>
      </div>
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
              <h2>Team Directory</h2>
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
              <h3>No members</h3>
              <Link to="/team?new=1" className="text-button">
                Add a member <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <section className="panel quick-actions">
          <div className="panel-heading">
            <div>
              <h2>Management</h2>
            </div>
          </div>
          <Link to="/team">
            <UsersRound size={20} />
            <div>
              <strong>Team Profiles</strong>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <Link to="/events">
            <CalendarDays size={20} />
            <div>
              <strong>Club Events</strong>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <Link to="/news">
            <Newspaper size={20} />
            <div>
              <strong>Live News</strong>
            </div>
            <ArrowUpRight size={17} />
          </Link>
          <Link to="/achievements">
            <Trophy size={20} />
            <div>
              <strong>Achievements</strong>
            </div>
            <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>
    </>
  )
}
