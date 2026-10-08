import { useEffect, useState } from 'react'
import { Check, X, Inbox, Eye, Trash2, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { Modal } from '../components/Modal'

export function RecruitmentPage() {
  // @ts-ignore
  const { user } = useAuth()
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<any>(null)
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [formToDelete, setFormToDelete] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    const { data: settingsData, error: sErr } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (sErr && sErr.code !== 'PGRST116') setError(sErr.message)
    else if (settingsData) setSettings(settingsData)

    const { data: formsData, error: fErr } = await supabase
      .from('recruitment_forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (fErr) setError(fErr.message)
    else setForms(formsData || [])

    setLoading(false)
  }

  async function toggleRecruitment() {
    if (!supabase) return
    const newVal = !settings?.recruitment_open
    const { error } = await supabase
      .from('site_settings')
      // @ts-ignore
      .update({ recruitment_open: newVal })
      .eq('id', 1)
    if (error) setError(error.message)
    else setSettings({ ...settings, recruitment_open: newVal })
  }

  async function updateStatus(id: string, status: string) {
    if (!supabase) return
    const { error } = await supabase
      .from('recruitment_forms')
      // @ts-ignore
      .update({ status })
      .eq('id', id)
    if (error) setError(error.message)
    else setForms(forms.map((f) => (f.id === id ? { ...f, status } : f)))
  }

  async function deleteApplication(id: string) {
    if (!supabase) return
    const { error } = await supabase.from('recruitment_forms').delete().eq('id', id)
    if (error) setError(error.message)
    else setForms(forms.filter((f) => f.id !== id))
    setFormToDelete(null)
  }

  if (loading)
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Applicant Management</h1>
            <p>Review applications and manage recruitment intake.</p>
          </div>
        </div>
        <div className="panel empty-state" role="status">
          <span className="spinner" />
          Loading applications…
        </div>
      </>
    )

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Applicant Management</h1>
          <p>Review applications and manage recruitment intake.</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}

      <section className="panel intake-panel" aria-labelledby="intake-title">
        <div className="panel-heading">
          <div>
            <h2 id="intake-title">Recruitment intake</h2>
            <p>Control application submissions on the public website.</p>
          </div>
          <div className="intake-control">
            <span className="photo-status">
              <span className="status-dot" />
              {settings?.recruitment_open ? 'Open for applications' : 'Applications closed'}
            </span>
            <button className="button secondary" onClick={toggleRecruitment}>
              {settings?.recruitment_open ? 'Close recruitment' : 'Open recruitment'}
            </button>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="applications-title">
        <div className="panel-heading">
          <div>
            <h2 id="applications-title">
              Applications <span className="count-badge">{forms.length}</span>
            </h2>
            <p>Review applicant details and update application status.</p>
          </div>
          <Inbox size={20} />
        </div>

        <div className="filter-tabs" role="group" aria-label="Filter applications by status">
          {(['all', 'new', 'accepted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              className="filter-tab"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All applications' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span>
                {f === 'all' ? forms.length : forms.filter((form) => form.status === f).length}
              </span>
            </button>
          ))}
        </div>

        <div className="table-responsive" role="region" aria-label="Application list" tabIndex={0}>
          <table className="admin-table">
            <caption className="sr-only">Recruitment applications and review actions</caption>
            <thead>
              <tr>
                <th scope="col">Applicant</th>
                <th scope="col">Domain / Year</th>
                <th scope="col">Profiles</th>
                <th scope="col">Status</th>
                <th scope="col" className="actions-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {forms
                .filter((f) => filter === 'all' || f.status === filter)
                .map((form) => (
                  <tr key={form.id}>
                    <td className="applicant-cell">
                      <div className="cell-primary">{form.name}</div>
                      <div className="cell-secondary">{form.email}</div>
                    </td>
                    <td>
                      <span className="domain-label">{form.domain}</span>
                      <div className="cell-secondary">Year {form.year}</div>
                    </td>
                    <td>
                      <div className="profile-links">
                        {form.github && (
                          <a href={form.github} target="_blank" rel="noreferrer">
                            GitHub
                          </a>
                        )}
                        {form.linkedin && (
                          <a href={form.linkedin} target="_blank" rel="noreferrer">
                            LinkedIn
                          </a>
                        )}
                        {form.leetcode && (
                          <a href={form.leetcode} target="_blank" rel="noreferrer">
                            LeetCode
                          </a>
                        )}
                        {form.portfolio && (
                          <a href={form.portfolio} target="_blank" rel="noreferrer">
                            Portfolio
                          </a>
                        )}
                        {!form.github && !form.linkedin && !form.leetcode && !form.portfolio && (
                          <span className="content-muted">Not provided</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge application-status ${form.status}`}>
                        {form.status === 'accepted' && <Check size={12} />}
                        {form.status === 'rejected' && <X size={12} />}
                        {form.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          onClick={() => setSelectedForm(form)}
                          title="View application"
                          aria-label={`View application from ${form.name}`}
                        >
                          <Eye size={16} />
                        </button>
                        {form.status === 'new' && (
                          <>
                            <button
                              className="icon-button"
                              onClick={() => updateStatus(form.id, 'accepted')}
                              title="Accept application"
                              aria-label={`Accept application from ${form.name}`}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="icon-button"
                              onClick={() => updateStatus(form.id, 'rejected')}
                              title="Reject application"
                              aria-label={`Reject application from ${form.name}`}
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button
                          className="icon-button danger-hover"
                          onClick={() => setFormToDelete(form)}
                          title="Delete application"
                          aria-label={`Delete application from ${form.name}`}
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
        {forms.filter((f) => filter === 'all' || f.status === filter).length === 0 && (
          <div className="empty-state">
            <Inbox size={28} />
            <h3>No {filter !== 'all' ? filter + ' ' : ''}applications</h3>
            <p>
              {forms.length
                ? 'Select another status to view applications.'
                : 'Submitted applications will appear here.'}
            </p>
          </div>
        )}
        <div className="content-list-footer">
          {forms.filter((f) => filter === 'all' || f.status === filter).length} of {forms.length}{' '}
          applications
        </div>
      </section>

      {selectedForm && (
        <Modal
          title={selectedForm.name}
          subtitle={`${selectedForm.domain.toUpperCase()} · Year ${selectedForm.year}`}
          onClose={() => setSelectedForm(null)}
        >
          <div className="application-details">
            <div>
              <h3>Contact email</h3>
              <p>{selectedForm.email}</p>
            </div>
            <div>
              <h3>Application response</h3>
              <div className="application-response">{selectedForm.motivation}</div>
            </div>
            <div className="application-links">
              {(
                [
                  ['github', 'GitHub'],
                  ['linkedin', 'LinkedIn'],
                  ['leetcode', 'LeetCode'],
                  ['portfolio', 'Portfolio'],
                ] as const
              ).map(
                ([key, label]) =>
                  selectedForm[key] && (
                    <div key={key}>
                      <h3>{label}</h3>
                      <a
                        href={selectedForm[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        {key === 'portfolio' ? 'Visit website' : 'View profile'}{' '}
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  ),
              )}
            </div>
          </div>
          <div className="form-actions">
            {selectedForm.status !== 'rejected' && (
              <button
                className="button secondary"
                onClick={() => {
                  updateStatus(selectedForm.id, 'rejected')
                  setSelectedForm(null)
                }}
              >
                <X size={16} /> Reject application
              </button>
            )}
            {selectedForm.status !== 'accepted' && (
              <button
                className="button primary"
                onClick={() => {
                  updateStatus(selectedForm.id, 'accepted')
                  setSelectedForm(null)
                }}
              >
                <Check size={16} /> Accept application
              </button>
            )}
          </div>
        </Modal>
      )}

      {formToDelete && (
        <Modal title="Delete application?" compact onClose={() => setFormToDelete(null)}>
          <div className="delete-content">
            <p>
              The application from <strong>{formToDelete.name}</strong> will be permanently deleted.
              This action cannot be undone.
            </p>
          </div>
          <div className="form-actions">
            <button
              className="button secondary"
              data-autofocus
              onClick={() => setFormToDelete(null)}
            >
              Cancel
            </button>
            <button className="button danger" onClick={() => deleteApplication(formToDelete.id)}>
              <Trash2 size={16} /> Delete application
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
