import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { listNews, createNews, updateNews, deleteNews, describeError, type LiveNews } from '../lib/news'

export function LiveNewsPage() {
  const [news, setNews] = useState<LiveNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<Partial<LiveNews> | null>(null)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setNews(await listNews())
    } catch (e) {
      setError(describeError(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editor) return
    setSaving(true)
    setError('')
    try {
      if (editor.id) {
        await updateNews(editor.id, editor)
      } else {
        await createNews(editor as Omit<LiveNews, 'id' | 'created_at'>)
      }
      setEditor(null)
      void refresh()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return
    try {
      await deleteNews(id)
      void refresh()
    } catch (err) {
      alert(describeError(err))
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Live News</h2>
        <button className="button button-primary" onClick={() => setEditor({ title: '', description: '', image_url: '', date: '' })}>
          <Plus size={16} /> Add News
        </button>
      </div>

      {error && !editor && <div className="notice error">{error}</div>}

      <div className="card-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th className="action-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="empty-state">Loading...</td></tr> : 
             news.length === 0 ? <tr><td colSpan={3} className="empty-state">No news yet.</td></tr> :
             news.map(item => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong></td>
                <td>{item.date || '-'}</td>
                <td className="action-cell">
                  <button className="icon-button" onClick={() => setEditor(item)}><Pencil size={15} /></button>
                  <button className="icon-button danger" onClick={() => handleDelete(item.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editor && (
        <Modal title={editor.id ? 'Edit News' : 'Add News'} onClose={() => setEditor(null)}>
          <form onSubmit={handleSave} className="form-stack">
            {error && <div className="notice error">{error}</div>}
            <div className="form-group">
              <label>Title</label>
              <input required type="text" value={editor.title || ''} onChange={e => setEditor({...editor, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea required value={editor.description || ''} onChange={e => setEditor({...editor, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Date (Optional, e.g. "Oct 7")</label>
              <input type="text" value={editor.date || ''} onChange={e => setEditor({...editor, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Image URL (Optional)</label>
              <input type="text" value={editor.image_url || ''} onChange={e => setEditor({...editor, image_url: e.target.value})} />
            </div>
            <div className="form-actions">
              <button type="button" className="button button-secondary" onClick={() => setEditor(null)}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save News'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
