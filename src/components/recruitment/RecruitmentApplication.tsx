import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Instagram, LoaderCircle } from 'lucide-react';
import { api, ApiError } from '../../api';
import type { SiteData, SiteSettings } from '../../types';
import './recruitment.css';

export default function RecruitmentApplication({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [availability, setAvailability] = useState<'checking' | 'ready' | 'error'>('checking');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [reference, setReference] = useState('');
  const request = useRef<AbortController | null>(null);
  const success = useRef<HTMLDivElement>(null);
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => {
      if (request.current === controller) { setAvailability('error'); controller.abort(); }
    }, 10_000);
    try {
      const site = await api<SiteData>('/site', { signal: controller.signal });
      if (!controller.signal.aborted) { setSettings(site.settings); setAvailability('ready'); }
    } catch {
      if (!controller.signal.aborted) setAvailability('error');
    } finally { window.clearTimeout(timeout); }
  }, []);
  useEffect(() => {
    void refresh();
    const recheck = () => { if (!document.hidden) void refresh(); };
    const interval = window.setInterval(recheck, 60_000);
    window.addEventListener('focus', recheck); window.addEventListener('online', recheck);
    return () => { request.current?.abort(); clearInterval(interval); window.removeEventListener('focus', recheck); window.removeEventListener('online', recheck); };
  }, [refresh]);
  useEffect(() => { if (reference) success.current?.focus(); }, [reference]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || availability !== 'ready' || !settings.recruitmentOpen) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError('');
    try {
      const result = await api<{ id: string }>('/applications', { method: 'POST', body: JSON.stringify({ ...fields, consent: fields.consent === 'on' }) });
      setReference(result.id);
    } catch (failure) {
      setError((failure as Error).message);
      // An administrator may have closed the intake while the form was open.
      if (failure instanceof ApiError && failure.status === 409) void refresh();
    } finally { setBusy(false); }
  }

  if (reference) return <div className="success-panel recruitment-success" role="status" tabIndex={-1} ref={success}>
    <span className="success-icon"><Check aria-hidden="true" /></span><h3>Application received.</h3>
    <p>Your application is saved. The team will review it and contact you using the email you provided.</p>
    <span className="eyebrow">Your application reference</span><code>{reference}</code><p>Save this number if you need to follow up.</p>
  </div>;
  if (availability === 'checking') return <p className="recruitment-status" role="status"><LoaderCircle size={18} className="spin" />Checking recruitment availability…</p>;

  return <div className="recruitment-application">
    {availability === 'error' && <div className="form-error" role="alert">We couldn’t check recruitment availability. Please reconnect and try again.<button type="button" className="button outline" onClick={() => void refresh()}>Try again</button></div>}
    {availability === 'ready' && !settings.recruitmentOpen && <div className="recruitment-closed">
      <span className="eyebrow">Recruitment is currently closed</span>
      <p>{settings.recruitmentMessage}</p>
      <p>{settings.recruitmentNextOpening ? `Next intake: ${settings.recruitmentNextOpening}` : 'The next intake has not been announced yet. Check back here for opening dates.'}</p>
      {settings.instagramUrl && <a className="button primary" href={settings.instagramUrl} target="_blank" rel="noreferrer">Follow Nucleus <Instagram size={18} /></a>}
    </div>}
    {settings.recruitmentOpen && <form onSubmit={submit} className="application-form">
      <fieldset disabled={busy || availability !== 'ready'}>
        <legend>Basic information</legend>
        {settings.recruitmentDeadline && <p className="recruitment-deadline">Apply by {new Date(settings.recruitmentDeadline).toLocaleString()}</p>}
        <div className="form-grid"><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Full name" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></label></div>
        <div className="form-grid"><label>Year of study<select name="year" required defaultValue=""><option value="" disabled>Select year</option><option value="1">1st year</option><option value="2">2nd year</option><option value="3">3rd year</option></select></label><label>Your domain<select name="domain" required defaultValue=""><option value="" disabled>What interests you?</option><option value="aiml">AI &amp; Machine Learning</option><option value="web">Web Development</option><option value="dsa">Data Structures &amp; Algorithms</option></select></label></div>
        <label>What would you like to learn or build?<textarea name="motivation" rows={4} minLength={30} maxLength={1600} required placeholder="Tell us what makes you curious. No perfect answers needed. (30+ characters)" /></label>
      </fieldset>
      <fieldset disabled={busy || availability !== 'ready'}><legend>Social &amp; portfolio links <span className="muted">(optional)</span></legend>
        <p className="recruitment-hint">Share the profiles you have. You don’t need an account on every platform to apply.</p>
        <div className="form-grid">{[['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/your-name'], ['github', 'GitHub', 'https://github.com/your-name'], ['leetcode', 'LeetCode', 'https://leetcode.com/u/your-name'], ['portfolio', 'Other / portfolio', 'https://your-website.com']].map(([name, label, placeholder]) => <label key={name}>{label}<input name={name} type="url" inputMode="url" autoCapitalize="none" spellCheck={false} maxLength={500} placeholder={placeholder} /></label>)}</div>
      </fieldset>
      <label className="honeypot" aria-hidden="true">Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="checkbox-label"><input type="checkbox" name="consent" required disabled={busy || availability !== 'ready'} /><span>I agree that the Nucleus team may use these details to review my application and contact me about recruitment.</span></label>
      <p className="small muted">Only club administrators can access applications. To request correction or deletion, email {settings.contactEmail}.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary full-width" disabled={busy || availability !== 'ready'}>{busy ? <><LoaderCircle className="spin" size={18} />Sending application…</> : <>Send application <ArrowUpRight size={18} /></>}</button>
    </form>}
    <a className="text-link recruitment-contact" href={`mailto:${settings.contactEmail}`}>Contact the team <ArrowUpRight size={16} /></a>
  </div>;
}
