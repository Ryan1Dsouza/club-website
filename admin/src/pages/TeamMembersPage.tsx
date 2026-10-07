import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Image,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { MemberEditor } from '../components/MemberEditor'
import { Modal } from '../components/Modal'
import { useMembers } from '../hooks/useMembers'
import { deleteMember, describeError } from '../lib/members'
import type { TeamMember } from '../lib/database.types'

const pageSize = 8
export function TeamMembersPage() {
  const { members, loading, error, refresh } = useMembers()
  const [params, setParams] = useSearchParams()
  const [editor, setEditor] = useState<{ member: TeamMember | null } | null>(() =>
    params.get('new') === '1' ? { member: null } : null,
  )
  const [removing, setRemoving] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [sort, setSort] = useState<'newest' | 'name'>('newest')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')
  const roles = useMemo(() => [...new Set(members.map((member) => member.role))].sort(), [members])
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const result = members.filter(
      (member) =>
        `${member.name} ${member.role}`.toLocaleLowerCase().includes(query) &&
        (role === 'all' || member.role === role),
    )
    return sort === 'name' ? result.sort((a, b) => a.name.localeCompare(b.name)) : result
  }, [members, role, search, sort])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const photos = members.filter((member) => member.photo_url).length
  const closeEditor = () => {
    setEditor(null)
    if (params.has('new')) setParams({}, { replace: true })
  }
  const remove = async () => {
    if (!removing || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      const warning = await deleteMember(removing)
      setNotice(warning || `${removing.name} deleted successfully.`)
      setRemoving(null)
      void refresh()
    } catch (e) {
      setDeleteError(describeError(e))
    } finally {
      setDeleting(false)
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">TEAM DIRECTORY</span>
          <h1>Team Members</h1>
          <p>Manage the team members displayed on the public website.</p>
        </div>
        <button className="button primary" onClick={() => setEditor({ member: null })}>
          <Plus size={17} /> Add member
        </button>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">
            <UsersRound size={19} />
          </span>
          <div>
            <span>Total members</span>
            <strong>{loading || error ? '—' : members.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <SlidersHorizontal size={19} />
          </span>
          <div>
            <span>Unique roles</span>
            <strong>{loading || error ? '—' : roles.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Image size={19} />
          </span>
          <div>
            <span>Profile photos</span>
            <strong>
              {loading || error ? '—' : photos}
              <small>{!loading && !error ? ` / ${members.length}` : ''}</small>
            </strong>
          </div>
        </div>
      </div>
      {notice && (
        <div className="notice success" role="status" aria-label="Member update">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <section className="panel members-panel" aria-label="Team directory">
        <div className="panel-heading">
          <div>
            <h2>
              All members{' '}
              <span className="count-badge">{loading || error ? '—' : members.length}</span>
            </h2>
            <p>The minds making things happen.</p>
          </div>
          <button
            className="icon-button"
            aria-label="Refresh members"
            title="Refresh members"
            disabled={loading}
            onClick={() => {
              void refresh()
            }}
          >
            <RefreshCw size={16} className={loading ? 'rotating' : ''} />
          </button>
        </div>
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search members"
              placeholder="Search by name or role…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            {search && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="table-filters">
            <label className="select-field">
              <SlidersHorizontal size={14} />
              <select
                aria-label="Filter by role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">All roles</option>
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <ArrowDown size={14} />
              <select
                aria-label="Sort members"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as 'name' | 'newest')
                  setPage(1)
                }}
              >
                <option value="newest">Newest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>
        {error ? (
          <div className="empty-state">
            <UsersRound size={30} />
            <h3>We couldn’t load the team.</h3>
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
          <div className="table-loading" role="status" aria-label="Loading members">
            {[1, 2, 3, 4].map((n) => (
              <div className="skeleton-row" key={n}>
                <span />
                <i />
                <i />
              </div>
            ))}
            <span className="sr-only">Loading members…</span>
          </div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <span className="large-icon">
              <UsersRound size={28} />
            </span>
            <h3>{members.length ? 'No connections found.' : 'Every team starts with someone.'}</h3>
            <p>
              {members.length
                ? 'Try another name or adjust your role filter.'
                : 'Add your first team member and put a face to Nucleus.'}
            </p>
            <button
              className="button secondary"
              onClick={() =>
                members.length ? (setSearch(''), setRole('all')) : setEditor({ member: null })
              }
            >
              {members.length ? 'Clear filters' : 'Add your first member'}
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Nucleus team members and profile actions</caption>
              <thead>
                <tr>
                  <th scope="col" className="index-cell">
                    #
                  </th>
                  <th scope="col">MEMBER</th>
                  <th scope="col">ROLE</th>
                  <th scope="col">PHOTO</th>
                  <th scope="col" className="actions-cell">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((member, index) => (
                  <tr key={member.id}>
                    <td className="index-cell">
                      {String((currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
                    </td>
                    <td>
                      <div className="member-identity">
                        <Avatar name={member.name} url={member.photo_url} />
                        <div>
                          <strong>{member.name}</strong>
                          <span>Nucleus team</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">{member.role}</span>
                    </td>
                    <td>
                      <span className={`photo-status${member.photo_url ? ' has-photo' : ''}`}>
                        <span className="status-dot" />
                        {member.photo_url ? 'Uploaded' : 'Not added'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          title="Edit member"
                          aria-label={`Edit ${member.name}`}
                          onClick={() => setEditor({ member })}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button danger-hover"
                          title="Delete member"
                          aria-label={`Delete ${member.name}`}
                          onClick={() => {
                            setRemoving(member)
                            setDeleteError('')
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className="table-pagination">
            <span>
              Showing{' '}
              <strong>
                {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, filtered.length)}
              </strong>{' '}
              of <strong>{filtered.length}</strong> members
            </span>
            <div>
              <button
                className="icon-button"
                aria-label="Previous page"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {currentPage} <span>/ {totalPages}</span>
              </span>
              <button
                className="icon-button"
                aria-label="Next page"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
      <div className="page-footnote">
        <span className="status-dot" /> Saved profiles are available to the Nucleus website.
      </div>
      {editor && (
        <MemberEditor
          member={editor.member}
          onClose={closeEditor}
          onSaved={(message) => {
            closeEditor()
            setNotice(message)
            void refresh()
          }}
        />
      )}
      {removing && (
        <Modal
          compact
          title="Remove this connection?"
          subtitle="This action cannot be undone."
          onClose={() => setRemoving(null)}
          busy={deleting}
        >
          <div className="delete-content">
            <div className="delete-member">
              <Avatar name={removing.name} url={removing.photo_url} />
              <div>
                <strong>{removing.name}</strong>
                <p>{removing.role}</p>
              </div>
            </div>
            <p>
              This will delete their team profile and its uploaded photo. They will no longer be
              included in the team data.
            </p>
            {deleteError && (
              <p className="notice error" role="alert">
                {deleteError}
              </p>
            )}
          </div>
          <footer className="modal-footer">
            <div className="button-row">
              <button
                className="button secondary"
                data-autofocus
                onClick={() => setRemoving(null)}
                disabled={deleting}
              >
                Keep member
              </button>
              <button
                className="button danger"
                disabled={deleting}
                onClick={() => {
                  void remove()
                }}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete member'}
              </button>
            </div>
          </footer>
        </Modal>
      )}
    </>
  )
}
