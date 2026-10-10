import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Newspaper, Search, X, UploadCloud } from 'lucide-react'
import { Modal } from '../components/Modal'
import { ContentDeleteDialog } from '../components/ContentDeleteDialog'
import { useAuth } from '../auth/AuthContext'
import {
  listNews,
  createNews,
  updateNews,
  deleteNews,
  describeError,
  uploadNewsPhoto,
  type LiveNews,
} from '../lib/news'

type NewsInput = Omit<LiveNews, 'id' | 'created_at'>
type NewsEditor = NewsInput & { id?: string }

export function LiveNewsPage() {
  const [news, setNews] = useState<LiveNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<NewsEditor | null>(null)
  const [removing, setRemoving] = useState<LiveNews | null>(null)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setNews(await listNews())
    } catch (e) {
      setError(describeError(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openEditor = (item?: LiveNews) => {
    setActionError('')
    setEditor(item ?? { title: '', description: '', image_url: '', date: '' })
    
    let urls: string[] = []
    if (item?.image_url) {
      try {
        const parsed = JSON.parse(item.image_url)
        if (Array.isArray(parsed)) urls = parsed
        else urls = [item.image_url]
      } catch {
        urls = [item.image_url]
      }
    }
    setExistingPhotos(urls)
    setNewPhotos([])
    setPhotosToDelete([])
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const incoming = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setNewPhotos((prev) => [...prev, ...incoming])
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editor || saving || !user) return
    setSaving(true)
    setActionError('')
    try {
      const finalUrls = existingPhotos.filter((p) => !photosToDelete.includes(p))
      for (const { file } of newPhotos) {
        finalUrls.push(await uploadNewsPhoto(file, user.id))
      }

      const input: NewsInput = {
        title: editor.title.trim(),
        description: editor.description.trim(),
        date: editor.date?.trim() || null,
        image_url: finalUrls.length > 0 ? JSON.stringify(finalUrls) : null,
      }
      if (!input.title || !input.description) throw new Error('Enter a title and description.')
      if (editor.id) await updateNews(editor.id, input)
      else await createNews(input)
      setEditor(null)
      setMessage('News saved.')
      void refresh()
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!removing || saving) return
    setSaving(true)
    setActionError('')
    try {
      await deleteNews(removing.id)
      setRemoving(null)
      setMessage('News deleted.')
      void refresh()
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const search = query.trim().toLowerCase()
  const filtered = news.filter((item) =>
    [item.title, item.description, item.date].some((value) =>
      value?.toLowerCase().includes(search),
    ),
  )

  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <h1>Live News</h1>
          <p>Manage news and announcements on the website.</p>
        </div>
        <button className="button primary" onClick={() => openEditor()}>
          <Plus size={17} /> Add news
        </button>
      </div>

      {message && (
        <div className="notice success" role="status">
          <span>{message}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setMessage('')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section
        className="panel content-panel"
        aria-labelledby="news-list-title"
        aria-busy={loading}
      >
        <div className="content-toolbar">
          <h2 id="news-list-title">
            All news {!loading && !error && <span className="count-badge">{news.length}</span>}
          </h2>
          <label className="search-field">
            <Search size={17} />
            <input
              type="search"
              aria-label="Search news"
              placeholder="Search news"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state" role="status">
            <span className="spinner" />
            Loading news…
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="content-error" role="alert">
              {error}
            </p>
            <button className="button secondary" onClick={() => void refresh()}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="large-icon">
              <Newspaper size={26} />
            </span>
            <h3>{news.length ? 'No matching news' : 'No news yet'}</h3>
            <p>
              {news.length
                ? 'Try a different search.'
                : 'Add a news item to publish an announcement.'}
            </p>
            {news.length > 0 && (
              <button className="button secondary" onClick={() => setQuery('')}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="content-table-scroll" role="region" aria-label="News list" tabIndex={0}>
              <table className="content-table news-table">
                <caption className="sr-only">News published on the website</caption>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Display date</th>
                    <th scope="col" className="content-actions-cell">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td className="content-title-cell">
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </td>
                      <td className="content-date-cell">
                        {item.date || <span className="content-muted">Not set</span>}
                      </td>
                      <td className="content-actions-cell">
                        <div className="content-row-actions">
                          <button
                            className="icon-button"
                            aria-label={'Edit ' + item.title}
                            title="Edit news"
                            onClick={() => openEditor(item)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button danger-hover"
                            aria-label={'Delete ' + item.title}
                            title="Delete news"
                            onClick={() => {
                              setActionError('')
                              setRemoving(item)
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="content-list-footer">
              {search
                ? filtered.length + ' of ' + news.length + ' news items'
                : news.length + (news.length === 1 ? ' news item' : ' news items')}
            </div>
          </>
        )}
      </section>

      {editor && (
        <Modal
          title={editor.id ? 'Edit news' : 'Add news'}
          onClose={() => setEditor(null)}
          busy={saving}
        >
          <form onSubmit={handleSave}>
            <fieldset className="form-stack" disabled={saving}>
              <legend className="sr-only">News details</legend>
              {actionError && (
                <div className="notice error" role="alert">
                  {actionError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="news-title">Title</label>
                <input
                  id="news-title"
                  name="title"
                  data-autofocus
                  required
                  value={editor.title}
                  onChange={(e) => setEditor({ ...editor, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="news-description">Description</label>
                <textarea
                  id="news-description"
                  name="description"
                  required
                  rows={5}
                  value={editor.description}
                  onChange={(e) => setEditor({ ...editor, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="news-date">
                  Display date <span>Optional</span>
                </label>
                <input
                  id="news-date"
                  name="date"
                  aria-describedby="news-date-help"
                  value={editor.date || ''}
                  onChange={(e) => setEditor({ ...editor, date: e.target.value })}
                />
                <p className="form-hint" id="news-date-help">
                  Shown as entered on the website.
                </p>
              </div>
              <fieldset className="event-photo-field">
                <legend>
                  News photos <span className="optional">Optional</span>
                </legend>
                <div className="event-photo-grid">
                  {existingPhotos
                    .filter((p) => !photosToDelete.includes(p))
                    .map((photoUrl, i) => (
                      <div key={'ext' + i} className="event-photo">
                        <img src={photoUrl} alt="" />
                        <button
                          type="button"
                          onClick={() => setPhotosToDelete((prev) => [...prev, photoUrl])}
                          className="icon-button danger-hover"
                          aria-label="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  {newPhotos.map((photo, i) => (
                    <div key={'new' + i} className="event-photo">
                      <img src={photo.preview} alt="" />
                      <button
                        type="button"
                        onClick={() => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="icon-button danger-hover"
                        aria-label="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <label className="upload-zone event-photo-upload">
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/webp, image/avif"
                      onChange={handlePhotoSelect}
                      aria-label="Upload photos"
                      disabled={saving}
                    />
                    <UploadCloud size={24} />
                    <span>Upload photos</span>
                  </label>
                </div>
              </fieldset>
            </fieldset>
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                disabled={saving}
                onClick={() => setEditor(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save news'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {removing && (
        <ContentDeleteDialog
          title={removing.title}
          kind="news item"
          busy={saving}
          error={actionError}
          onClose={() => setRemoving(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  )
}
