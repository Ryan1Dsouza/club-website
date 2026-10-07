import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { listAchievements, createAchievement, updateAchievement, deleteAchievement, type Achievement } from '../lib/achievements'
import { describeError } from '../lib/news'
import { listMembers } from '../lib/members'
import type { TeamMember } from '../lib/database.types'

export function AchievementsPage() {
  const [items, setItems] = useState<{ achievement: Achievement, members: string[] }[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<{ achievement: Partial<Achievement>, members: string[] } | null>(null)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const abortController = new AbortController()
      const [acts, mems] = await Promise.all([listAchievements(), listMembers(abortController.signal)])
      setItems(acts)
      setTeam(mems)
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
      if (editor.achievement.id) {
        await updateAchievement(editor.achievement.id, editor.achievement, editor.members)
      } else {
        await createAchievement(editor.achievement as Omit<Achievement, 'id' | 'created_at'>, editor.members)
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
    if (!confirm('Are you sure you want to delete this achievement?')) return
    try {
      await deleteAchievement(id)
      void refresh()
    } catch (err) {
      alert(describeError(err))
    }
  }

  const toggleMember = (id: string) => {
    if (!editor) return
    const mems = editor.members.includes(id) ? editor.members.filter(m => m !== id) : [...editor.members, id]
    setEditor({ ...editor, members: mems })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Achievements</h2>
        <button className="button button-primary" onClick={() => setEditor({ achievement: { title: '', category: 'Hackathons', result: '', year: '2026', description: '', href: '' }, members: [] })}>
          <Plus size={16} /> Add Achievement
        </button>
      </div>

      {error && !editor && <div className="notice error">{error}</div>}

      <div className="card-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Year</th>
              <th className="action-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="empty-state">Loading...</td></tr> : 
             items.length === 0 ? <tr><td colSpan={4} className="empty-state">No achievements yet.</td></tr> :
             items.map(item => (
              <tr key={item.achievement.id}>
                <td><strong>{item.achievement.title}</strong></td>
                <td>{item.achievement.category}</td>
                <td>{item.achievement.year}</td>
                <td className="action-cell">
                  <button className="icon-button" onClick={() => setEditor(item)}><Pencil size={15} /></button>
                  <button className="icon-button danger" onClick={() => handleDelete(item.achievement.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editor && (
        <Modal title={editor.achievement.id ? 'Edit Achievement' : 'Add Achievement'} onClose={() => setEditor(null)}>
          <form onSubmit={handleSave} className="form-stack">
            {error && <div className="notice error">{error}</div>}
            
            <div className="form-group">
              <label>Title</label>
              <input required type="text" value={editor.achievement.title || ''} onChange={e => setEditor({...editor, achievement: {...editor.achievement, title: e.target.value}})} />
            </div>

            <div className="form-group row">
              <div style={{ flex: 1 }}>
                <label>Category</label>
                <select required value={editor.achievement.category || 'Hackathons'} onChange={e => setEditor({...editor, achievement: {...editor.achievement, category: e.target.value}})}>
                  <option value="Hackathons">Hackathons</option>
                  <option value="Open source">Open source</option>
                  <option value="Competitive programming">Competitive programming</option>
                  <option value="Research">Research</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Year</label>
                <input required type="text" value={editor.achievement.year || ''} onChange={e => setEditor({...editor, achievement: {...editor.achievement, year: e.target.value}})} />
              </div>
            </div>

            <div className="form-group">
              <label>Result (e.g. "Winner")</label>
              <input required type="text" value={editor.achievement.result || ''} onChange={e => setEditor({...editor, achievement: {...editor.achievement, result: e.target.value}})} />
            </div>

            <div className="form-group">
              <label>Link / URL (Optional)</label>
              <input type="text" value={editor.achievement.href || ''} onChange={e => setEditor({...editor, achievement: {...editor.achievement, href: e.target.value}})} />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea value={editor.achievement.description || ''} onChange={e => setEditor({...editor, achievement: {...editor.achievement, description: e.target.value}})} />
            </div>

            <div className="form-group">
              <label>Team Members</label>
              <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '4px' }}>
                {team.map(member => (
                  <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={editor.members.includes(member.id)} onChange={() => toggleMember(member.id)} />
                    {member.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="button button-secondary" onClick={() => setEditor(null)}>Cancel</button>
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Achievement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
