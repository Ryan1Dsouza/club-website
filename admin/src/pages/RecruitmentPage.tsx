import { useEffect, useState } from 'react'
import { Check, X, Inbox } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

export function RecruitmentPage() {
  // @ts-ignore
  const { user } = useAuth()
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    if (!supabase) { setError('Supabase not configured'); return }
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
    else setForms(forms.map(f => f.id === id ? { ...f, status } : f))
  }

  if (loading) return <div className="page-heading"><h1>Loading Recruitment...</h1></div>

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Recruitment Management</h1>
          <p>Toggle recruitment intake and manage incoming applications.</p>
        </div>
      </div>
      
      {error && <p role="alert" className="notice error">{error}</p>}
      
      <section className="panel">
        <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Intake Status</h2>
            <p>Controls whether the public recruitment form is accessible.</p>
          </div>
          <button 
            className={`button ${settings?.recruitment_open ? 'primary' : 'secondary'}`}
            onClick={toggleRecruitment}
          >
            {settings?.recruitment_open ? 'Recruitment is OPEN' : 'Recruitment is CLOSED'}
          </button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-heading">
          <div>
            <h2>Applications</h2>
            <p>Review submitted forms from authenticated students.</p>
          </div>
          <Inbox size={21} />
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Domain & Year</th>
                <th>Profiles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(form => (
                <tr key={form.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{form.name}</div>
                    <div className="muted" style={{ fontSize: '14px' }}>{form.email}</div>
                  </td>
                  <td>
                    <span style={{ textTransform: 'uppercase' }}>{form.domain}</span>
                    <div className="muted" style={{ fontSize: '14px' }}>Year {form.year}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                      {form.github && <a href={form.github} target="_blank" rel="noreferrer">GitHub</a>}
                      {form.linkedin && <a href={form.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                      {form.leetcode && <a href={form.leetcode} target="_blank" rel="noreferrer">LeetCode</a>}
                      {form.portfolio && <a href={form.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
                    </div>
                  </td>
                  <td>
                    <span className="role-badge">{form.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="button secondary" 
                        style={{ padding: '4px 8px' }}
                        onClick={() => updateStatus(form.id, 'accepted')}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button 
                        className="button secondary" 
                        style={{ padding: '4px 8px' }}
                        onClick={() => updateStatus(form.id, 'rejected')}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No applications received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
