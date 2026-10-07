import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, LoaderCircle, LogOut, Lock } from 'lucide-react';
import { api, ApiError } from '../../api';
import type { SiteData, SiteSettings } from '../../types';
import { supabase } from '../../lib/supabase';
import './recruitment.css';

export default function RecruitmentApplication({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [availability, setAvailability] = useState<'checking' | 'ready' | 'error'>('checking');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [reference, setReference] = useState('');
  
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

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
      const { data: settingsData } = await supabase.from('site_settings').select('recruitment_open').eq('id', 1).single();
      
      if (!controller.signal.aborted) { 
        const finalSettings = { ...site.settings };
        if (settingsData) {
          finalSettings.recruitmentOpen = settingsData.recruitment_open;
        }
        setSettings(finalSettings); 
        setAvailability('ready'); 
      }
    } catch {
      if (!controller.signal.aborted) setAvailability('error');
    } finally { window.clearTimeout(timeout); }
  }, []);

  useEffect(() => {
    void refresh();
    
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => { 
      request.current?.abort(); 
      subscription.unsubscribe();
    };
  }, [refresh]);

  useEffect(() => { if (reference) success.current?.focus(); }, [reference]);

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/recruitment'
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || availability !== 'ready' || !settings.recruitmentOpen) return;
    
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError('');
    
    try {
      // Create record in Supabase database directly
      const { data, error: dbError } = await supabase
        .from('recruitment_forms')
        .insert([{
          name: fields.name,
          email: session.user.email,
          domain: fields.domain,
          motivation: fields.motivation,
          portfolio: fields.portfolio || null,
          linkedin: fields.linkedin || null,
          github: fields.github || null,
          leetcode: fields.leetcode || null,
          year: fields.year
        }])
        .select('id')
        .single();
        
      if (dbError) throw dbError;
      setReference(data.id);
    } catch (failure: any) {
      setError(failure.message || 'Failed to submit application');
    } finally { setBusy(false); }
  }

  if (reference) return <div className="success-panel recruitment-success" role="status" tabIndex={-1} ref={success}>
    <span className="success-icon"><Check aria-hidden="true" /></span><h3>Application received.</h3>
    <p>Your application is saved. The team will review it and contact you using the email you provided.</p>
    <span className="eyebrow">Your application reference</span><code>{reference}</code><p>Save this number if you need to follow up.</p>
  </div>;
  
  if (availability === 'checking' || authChecking) return <p className="recruitment-status" role="status"><LoaderCircle size={18} className="spin" />Checking recruitment availability…</p>;
  
  if (availability === 'ready' && !settings.recruitmentOpen) return (
    <div className="recruitment-application recruitment-closed" style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--line-strong)', borderRadius: '16px', background: 'var(--surface)', margin: '40px auto' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgb(var(--mint-rgb) / 0.1)', color: 'var(--mint)', marginBottom: '24px' }}>
        <Lock size={28} />
      </div>
      <h2 style={{ fontSize: '32px', marginBottom: '16px', letterSpacing: '-0.5px' }}>Registrations are closed</h2>
      <p style={{ maxWidth: '400px', margin: '0 auto 32px', color: 'var(--muted)', fontSize: '15px' }}>
        {settings.recruitmentNextOpening ? `Our next intake is scheduled for ${settings.recruitmentNextOpening}.` : 'We are not currently accepting new applications. Opening dates for the next intake will be posted here.'}
      </p>
      <div className="recruitment-closed-links" style={{ justifyContent: 'center', gap: '16px' }}>
        {settings.instagramUrl && (
          <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="button primary">
            Updates on Instagram <ArrowUpRight size={16} />
          </a>
        )}
        <a href={`mailto:${settings.contactEmail}`} className="button outline">
          Contact the team
        </a>
      </div>
    </div>
  );

  const isSjecEmail = session?.user?.email?.endsWith('@sjec.ac.in');
  
  // Extract name for placeholder: e.g. "2455.ryan" -> "Ryan"
  let suggestedName = '';
  if (isSjecEmail) {
    const prefix = session.user.email.split('@')[0];
    const parts = prefix.split('.');
    if (parts.length > 1) {
      const namePart = parts[1];
      suggestedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    } else {
      suggestedName = prefix;
    }
  }

  return <div className="recruitment-application">
    {availability === 'error' && <div className="form-error" role="alert">We couldn’t check recruitment availability. Please reconnect and try again.<button type="button" className="button outline" onClick={() => void refresh()}>Try again</button></div>}
    
    {settings.recruitmentOpen && !session && (
      <div className="auth-prompt" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: 500 }}>Sign in to Apply</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>You must use your official @sjec.ac.in college email to apply for Nucleus.</p>
        <button className="button primary" style={{ margin: '0 auto', display: 'inline-flex' }} onClick={handleGoogleLogin}>
          Sign in with SJEC Google
        </button>
      </div>
    )}

    {settings.recruitmentOpen && session && !isSjecEmail && (
      <div className="auth-prompt form-error" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Invalid Email Domain</h2>
        <p style={{ marginBottom: '24px' }}>You signed in with <strong>{session.user.email}</strong>, which is not an SJEC email address.</p>
        <button className="button outline" onClick={handleSignOut}>Sign out and try again</button>
      </div>
    )}

    {settings.recruitmentOpen && session && isSjecEmail && <form onSubmit={submit} className="application-form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '12px 16px', background: 'var(--surface-raised)', borderRadius: '8px', fontSize: '14px' }}>
        <span>Signed in as <strong style={{ color: 'var(--mint)' }}>{session.user.email}</strong></span>
        <button type="button" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px' }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <fieldset disabled={busy || availability !== 'ready'}>
        <legend>Basic information</legend>
        {settings.recruitmentDeadline && <p className="recruitment-deadline">Apply by {new Date(settings.recruitmentDeadline).toLocaleString()}</p>}
        <div className="form-grid">
          <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={suggestedName} placeholder="Full name" /></label>
          <label>Email address<input name="email" type="email" disabled value={session.user.email} style={{ opacity: 0.6 }} /></label>
        </div>
        <div className="form-grid">
          <label>Year of study
            <select name="year" required defaultValue="">
              <option value="" disabled>Select year</option>
              <option value="1">1st year</option>
              <option value="2">2nd year</option>
              <option value="3">3rd year</option>
            </select>
          </label>
          <label>Your domain
            <select name="domain" required defaultValue="">
              <option value="" disabled>What interests you?</option>
              <option value="aiml">AI &amp; Machine Learning</option>
              <option value="web">Web Development</option>
              <option value="dsa">Data Structures &amp; Algorithms</option>
            </select>
          </label>
        </div>
        <label>What would you like to learn or build?<textarea name="motivation" rows={4} minLength={30} maxLength={1600} required placeholder="Tell us what makes you curious. No perfect answers needed. (30+ characters)" /></label>
      </fieldset>
      
      <fieldset disabled={busy || availability !== 'ready'}>
        <legend>Social &amp; portfolio links <span className="muted">(optional)</span></legend>
        <p className="recruitment-hint">Share the profiles you have. You don’t need an account on every platform to apply.</p>
        <div className="form-grid">
          {[
            ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/your-name'], 
            ['github', 'GitHub', 'https://github.com/your-name'], 
            ['leetcode', 'LeetCode', 'https://leetcode.com/u/your-name'], 
            ['portfolio', 'Other / portfolio', 'https://your-website.com']
          ].map(([name, label, placeholder]) => (
            <label key={name}>{label}<input name={name} type="url" inputMode="url" autoCapitalize="none" spellCheck={false} maxLength={500} placeholder={placeholder} /></label>
          ))}
        </div>
      </fieldset>
      
      <label className="checkbox-label">
        <input type="checkbox" name="consent" required disabled={busy || availability !== 'ready'} />
        <span>I agree that the Nucleus team may use these details to review my application and contact me about recruitment.</span>
      </label>
      
      <p className="small muted">Only club administrators can access applications. To request correction or deletion, email {settings.contactEmail}.</p>
      
      {error && <p className="form-error" role="alert">{error}</p>}
      
      <button className="button primary full-width" disabled={busy || availability !== 'ready'}>
        {busy ? <><LoaderCircle className="spin" size={18} />Sending application…</> : <>Submit Application <ArrowUpRight size={18} /></>}
      </button>
    </form>}
    
    <a className="text-link recruitment-contact" href={`mailto:${settings.contactEmail}`}>Contact the team <ArrowUpRight size={16} /></a>
  </div>;
}
