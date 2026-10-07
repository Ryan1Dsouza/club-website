import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Trophy, Search, X } from 'lucide-react'
import { Modal } from '../components/Modal'
import { ContentDeleteDialog } from '../components/ContentDeleteDialog'
import {
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  type Achievement,
} from '../lib/achievements'
import { describeError } from '../lib/news'
import { listMembers } from '../lib/members'
import type { TeamMember } from '../lib/database.types'

type AchievementInput = Omit<Achievement, 'id' | 'created_at'>
type AchievementEditor = { achievement: AchievementInput & { id?: string }; members: string[] }
const categories = ['Hackathons', 'Open source', 'Competitive programming', 'Research']

export function AchievementsPage() {
  const [items, setItems] = useState<{ achievement: Achievement; members: string[] }[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<AchievementEditor | null>(null)
  const [removing, setRemoving] = useState<Achievement | null>(null)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [achievements, members] = await Promise.all([
        listAchievements(),
        listMembers(new AbortController().signal),
      ])
      setItems(achievements)
      setTeam(members)
    } catch (e) {
      setError(describeError(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openEditor = (item?: AchievementEditor) => {
    setActionError('')
    setEditor(
      item ?? {
        achievement: {
          title: '',
          category: 'Hackathons',
          result: '',
          year: String(new Date().getFullYear()),
          description: '',
          href: '',
        },
        members: [],
      },
    )
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editor || saving) return
    setSaving(true)
    setActionError('')
    try {
      const { achievement, members } = editor
      const input: AchievementInput = {
        title: achievement.title.trim(),
        category: achievement.category,
        result: achievement.result.trim(),
        year: achievement.year.trim(),
        description: achievement.description.trim(),
        href: achievement.href?.trim() || null,
      }
      if (!input.title || !input.result || !input.year)
        throw new Error('Enter a title, result, and year.')
      if (achievement.id) await updateAchievement(achievement.id, input, members)
      else await createAchievement(input, members)
      setEditor(null)
      setMessage('Achievement saved.')
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
      await deleteAchievement(removing.id)
      setRemoving(null)
      setMessage('Achievement deleted.')
      void refresh()
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleMember = (id: string) => {
    setEditor(
      (current) =>
        current && {
          ...current,
          members: current.members.includes(id)
            ? current.members.filter((member) => member !== id)
            : [...current.members, id],
        },
    )
  }

  const search = query.trim().toLowerCase()
  const filtered = items.filter(({ achievement }) =>
    [achievement.title, achievement.category, achievement.result, achievement.year].some((value) =>
      value.toLowerCase().includes(search),
    ),
  )

  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <h1>Achievements</h1>
          <p>Manage awards, results, and the team members behind them.</p>
        </div>
        <button
          className="button primary"
          disabled={loading || !!error}
          onClick={() => openEditor()}
        >
          <Plus size={17} /> Add achievement
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
        aria-labelledby="achievement-list-title"
        aria-busy={loading}
      >
        <div className="content-toolbar">
          <h2 id="achievement-list-title">
            All achievements{' '}
            {!loading && !error && <span className="count-badge">{items.length}</span>}
          </h2>
          <label className="search-field">
            <Search size={17} />
            <input
              type="search"
              aria-label="Search achievements"
              placeholder="Search achievements"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="empty-state" role="status">
            <span className="spinner" />
            Loading achievements…
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
              <Trophy size={26} />
            </span>
            <h3>{items.length ? 'No matching achievements' : 'No achievements yet'}</h3>
            <p>
              {items.length
                ? 'Try a different title, category, or year.'
                : 'Add an achievement to display it on the website.'}
            </p>
            {items.length > 0 && (
              <button className="button secondary" onClick={() => setQuery('')}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className="content-table-scroll"
              role="region"
              aria-label="Achievement list"
              tabIndex={0}
            >
              <table className="content-table achievements-table">
                <caption className="sr-only">Achievements displayed on the website</caption>
                <thead>
                  <tr>
                    <th scope="col">Achievement</th>
                    <th scope="col">Category</th>
                    <th scope="col">Year</th>
                    <th scope="col" className="content-actions-cell">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.achievement.id}>
                      <td className="content-title-cell">
                        <strong>{item.achievement.title}</strong>
                        <p>{item.achievement.result}</p>
                      </td>
                      <td className="content-category-cell">
                        <span className="content-category">{item.achievement.category}</span>
                      </td>
                      <td className="content-year-cell">{item.achievement.year}</td>
                      <td className="content-actions-cell">
                        <div className="content-row-actions">
                          <button
                            className="icon-button"
                            aria-label={'Edit ' + item.achievement.title}
                            title="Edit achievement"
                            onClick={() => openEditor(item)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button danger-hover"
                            aria-label={'Delete ' + item.achievement.title}
                            title="Delete achievement"
                            onClick={() => {
                              setActionError('')
                              setRemoving(item.achievement)
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
                ? filtered.length + ' of ' + items.length + ' achievements'
                : items.length + (items.length === 1 ? ' achievement' : ' achievements')}
            </div>
          </>
        )}
      </section>

      {editor && (
        <Modal
          title={editor.achievement.id ? 'Edit achievement' : 'Add achievement'}
          onClose={() => setEditor(null)}
          busy={saving}
        >
          <form onSubmit={handleSave}>
            <fieldset className="form-stack" disabled={saving}>
              <legend className="sr-only">Achievement details</legend>
              {actionError && (
                <div className="notice error" role="alert">
                  {actionError}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="achievement-title">Title</label>
                <input
                  id="achievement-title"
                  name="title"
                  data-autofocus
                  required
                  value={editor.achievement.title}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      achievement: { ...editor.achievement, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="achievement-category">Category</label>
                  <select
                    id="achievement-category"
                    name="category"
                    required
                    value={editor.achievement.category}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        achievement: { ...editor.achievement, category: e.target.value },
                      })
                    }
                  >
                    {!categories.includes(editor.achievement.category) && (
                      <option value={editor.achievement.category}>
                        {editor.achievement.category}
                      </option>
                    )}
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="achievement-year">Year</label>
                  <input
                    id="achievement-year"
                    name="year"
                    required
                    value={editor.achievement.year}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        achievement: { ...editor.achievement, year: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="achievement-result">Result</label>
                <input
                  id="achievement-result"
                  name="result"
                  required
                  value={editor.achievement.result}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      achievement: { ...editor.achievement, result: e.target.value },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="achievement-description">
                  Description <span>Optional</span>
                </label>
                <textarea
                  id="achievement-description"
                  name="description"
                  rows={4}
                  value={editor.achievement.description}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      achievement: { ...editor.achievement, description: e.target.value },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="achievement-link">
                  Link URL <span>Optional</span>
                </label>
                <input
                  id="achievement-link"
                  name="href"
                  type="url"
                  value={editor.achievement.href || ''}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      achievement: { ...editor.achievement, href: e.target.value },
                    })
                  }
                />
              </div>
              <fieldset className="member-picker">
                <legend>
                  Team members <span>{editor.members.length} selected</span>
                </legend>
                {team.length ? (
                  <div className="member-picker-options">
                    {team.map((member) => (
                      <label key={member.id} className="member-option">
                        <input
                          type="checkbox"
                          name="members"
                          value={member.id}
                          checked={editor.members.includes(member.id)}
                          onChange={() => toggleMember(member.id)}
                        />
                        <span>
                          {member.name}
                          <small>{member.role}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="form-hint">
                    No team members available. Add members in the team directory to link them to an
                    achievement.
                  </p>
                )}
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
                {saving ? 'Saving…' : 'Save achievement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {removing && (
        <ContentDeleteDialog
          title={removing.title}
          kind="achievement"
          busy={saving}
          error={actionError}
          onClose={() => setRemoving(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  )
}
