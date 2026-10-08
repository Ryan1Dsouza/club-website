import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Images,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { EventEditor } from '../components/EventEditor'
import { Modal } from '../components/Modal'
import { listEvents, deleteEvent, describeError } from '../lib/events'
import type { Event } from '../lib/database.types'

const pageSize = 8

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listEvents()
      setEvents(data)
    } catch (e) {
      setError(describeError(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const [editor, setEditor] = useState<{ event: Event | null } | null>(null)
  const [removing, setRemoving] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return events.filter((e) =>
      `${e.title} ${e.category} ${e.location}`.toLocaleLowerCase().includes(query),
    )
  }, [events, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const remove = async () => {
    if (!removing || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteEvent(removing)
      setNotice(`${removing.title} deleted successfully.`)
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
          <h1>Events</h1>
          <p>Manage events, schedules, and photos on the website.</p>
        </div>
        <button className="button primary" onClick={() => setEditor({ event: null })}>
          <Plus size={17} /> Add event
        </button>
      </div>

      <div className="stats-grid two-columns">
        <div className="stat-card">
          <span className="stat-icon">
            <CalendarDays size={19} />
          </span>
          <div>
            <span>Total events</span>
            <strong>{loading || error ? '—' : events.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Images size={19} />
          </span>
          <div>
            <span>Published</span>
            <strong>{loading || error ? '—' : events.filter((e) => e.published).length}</strong>
          </div>
        </div>
      </div>

      {notice && (
        <div className="notice success" role="status" aria-label="Event update">
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

      <section className="panel members-panel" aria-label="Events directory">
        <div className="panel-heading">
          <div>
            <h2>
              All events{' '}
              <span className="count-badge">{loading || error ? '—' : events.length}</span>
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Refresh events"
            title="Refresh events"
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
              aria-label="Search events"
              placeholder="Search by title, location, or category…"
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
        </div>

        {error ? (
          <div className="empty-state">
            <CalendarDays size={30} />
            <h3>Unable to load events</h3>
            <p role="alert">{error}</p>
            <button className="button secondary" onClick={() => void refresh()}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="table-loading" role="status" aria-label="Loading events">
            {[1, 2, 3].map((n) => (
              <div className="skeleton-row" key={n}>
                <span />
                <i />
                <i />
              </div>
            ))}
            <span className="sr-only">Loading events…</span>
          </div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <span className="large-icon">
              <CalendarDays size={28} />
            </span>
            <h3>{events.length ? 'No events found.' : 'No events yet.'}</h3>
            <p>
              {events.length
                ? 'Try another search term.'
                : 'Add an event with its schedule and details.'}
            </p>
            <button
              className="button secondary"
              onClick={() => (events.length ? setSearch('') : setEditor({ event: null }))}
            >
              {events.length ? 'Clear filters' : 'Add event'}
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <div className="table-scroll" role="region" aria-label="Event list" tabIndex={0}>
            <table className="events-table">
              <caption className="sr-only">
                Events, schedules, publication status, and actions
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="index-cell">
                    #
                  </th>
                  <th scope="col">Event</th>
                  <th scope="col">Category</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="actions-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((event, index) => (
                  <tr key={event.id}>
                    <td className="index-cell">
                      {String((currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
                    </td>
                    <td>
                      <div className="member-identity">
                        <div>
                          <strong>{event.title}</strong>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">{event.category}</span>
                    </td>
                    <td className="date-cell">
                      <span>{new Date(event.starts_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span className={`photo-status${event.published ? ' has-photo' : ''}`}>
                        <span className="status-dot" />
                        {event.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          title="Edit event"
                          aria-label={`Edit ${event.title}`}
                          onClick={() => setEditor({ event })}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button danger-hover"
                          title="Delete event"
                          aria-label={`Delete ${event.title}`}
                          onClick={() => {
                            setRemoving(event)
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
              of <strong>{filtered.length}</strong> events
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

      {editor && (
        <EventEditor
          event={editor.event}
          onClose={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null)
            setNotice(message)
            void refresh()
          }}
        />
      )}

      {removing && (
        <Modal
          compact
          title="Delete this event?"
          subtitle="This action cannot be undone."
          onClose={() => setRemoving(null)}
          busy={deleting}
        >
          <div className="delete-content">
            <div className="delete-member">
              <div>
                <strong>{removing.title}</strong>
                <p>{new Date(removing.starts_at).toLocaleDateString()}</p>
              </div>
            </div>
            <p>
              This will permanently delete this event and all its associated photos from storage.
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
                Cancel
              </button>
              <button className="button danger" disabled={deleting} onClick={() => void remove()}>
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete event'}
              </button>
            </div>
          </footer>
        </Modal>
      )}
    </>
  )
}
