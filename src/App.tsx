import { Suspense, useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigationType } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, BrainCircuit, Code2, Network, Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { MorphingNavbar } from './components/ui/morphing-navbar';
import { Logo } from './components/shared/Logo';
import Modal from './components/shared/Modal';
import PageBoundary from './components/shared/PageBoundary';
import LoadingScreen from './components/shared/LoadingScreen';
import { LOADER_MINIMUM_MS, LOADER_MAXIMUM_MS } from './components/shared/loading-frames';
import { api } from './api';
import RecruitmentApplication from './components/recruitment/RecruitmentApplication';
import type { SiteData, SiteSettings } from './types';
import seed from '../shared/public-data.json';
import LogoLanding from './components/home/LogoLanding';
import { BackgroundRippleEffect } from './components/ui/background-ripple-effect';
import DomainParallax from './components/home/DomainParallax';
import { EventsPage, WorkPage, PeoplePage, Recruitment, AchievementsPage, LiveNews } from './route-pages';
import VoicesMarquee from './components/home/VoicesMarquee';
import CommunityCTA from './components/home/CommunityCTA';
import { useReveal } from './components/ui/reveal';
import { useCinematicScroll } from './lib/use-cinematic-scroll';
import { pageMeta } from '../shared/page-meta';

const domains = [
  { id: 'aiml', num: '01', title: 'Artificial Intelligence', subtitle: '& Machine Learning', icon: BrainCircuit, whatsappUrl: 'https://chat.whatsapp.com/F2sg6LBCwibIKWJu2nhnvI', tags: ['Intelligence', 'Research', 'Possibility'], description: 'Explore machine learning, build models, and turn new questions into experiments.', detail: 'Explore model building, machine learning foundations, research papers, and practical AI applications. Bring your curiosity; build your understanding through collaborative experiments.' },
  { id: 'web', num: '02', title: 'Web Development', subtitle: '& Digital Experiences', icon: Code2, whatsappUrl: 'https://chat.whatsapp.com/L97jBsJl7vJ6ol1k68Ue9L', tags: ['Design', 'Build', 'Ship'], description: 'Design thoughtful interfaces. Build useful applications. Put your ideas on the web.', detail: 'Work across frontend and backend development, UI design, APIs, and deployment. Learn by making useful applications and sharing feedback with other builders.' },
  { id: 'dsa', num: '03', title: 'Data Structures', subtitle: '& Algorithms', icon: Network, whatsappUrl: 'https://chat.whatsapp.com/LPTqGQdnGRo24BEZyrk9vy', tags: ['Logic', 'Patterns', 'Problem-solving'], description: 'Find the patterns, solve hard problems, and build a stronger foundation.', detail: 'Develop problem-solving habits through data structures, algorithmic thinking, peer practice, and competitive programming. Learn to explain both your solution and why it works.' },
] as const;

function ApplyForm({ settings, onClose }: { settings: SiteSettings; onClose: () => void }) {
  return <Modal title="Recruitment" onClose={onClose}><RecruitmentApplication initialSettings={settings} /></Modal>;
}

function SiteFooter({ settings }: { settings: SiteSettings }) {
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  useReveal(ref, { enabled: pathname === '/', stagger: 65, selector: '.footer-top > *, .footer-bottom > *' });
  return <footer ref={ref} className="site-footer section-wrap" id="contact">
    <div className="footer-top"><Link className="brand" to="/" aria-label="Nucleus home"><Logo /><span>NUCLEUS<small>SJEC · MANGALURU</small></span></Link>
      <div className="footer-socials">
        <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Nucleus Instagram"><Instagram size={18} /></a>
        <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" aria-label="Nucleus LinkedIn"><Linkedin size={18} /></a>
        <a href={settings.githubUrl} target="_blank" rel="noreferrer" aria-label="Nucleus GitHub"><Github size={18} /></a>
        <a href={`mailto:${settings.contactEmail}`} aria-label="Email Nucleus"><Mail size={18} /></a>
      </div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Nucleus SJEC</span><span>Made of many minds.</span></div>
  </footer>;
}

export default function App({ initialData = seed, serverRendered = false }: { initialData?: SiteData; serverRendered?: boolean }) {
  const [data, setData] = useState<SiteData>(initialData);
  const [applyOpen, setApplyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [domain, setDomain] = useState<number | null>(null);
  // The static curtain renders with SSR; interactivity is locked after hydration.
  const [loadingStage, setLoadingStage] = useState<'idle' | 'loading' | 'exiting' | 'done'>('idle');
  const loading = loadingStage === 'loading' || loadingStage === 'exiting';
  const location = useLocation();
  const pagePath = location.pathname.replace(/\/+$/, '') || '/';
  const navigationType = useNavigationType();
  useCinematicScroll(location.pathname === '/' && !loading && !applyOpen && !menuOpen && domain === null);

  useEffect(() => {
    const abort = new AbortController();
    let disposed = false, finished = false, finishTimer = 0;
    const started = performance.now();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimum = reduced ? 0 : LOADER_MINIMUM_MS;
    // Play the same opening on hydrated production pages and client-only pages.
    setLoadingStage('loading');
    const dismiss = () => {
      if (disposed || finished) return;
      finished = true; window.clearTimeout(deadline); window.clearTimeout(finishTimer);
      setLoadingStage('exiting');
    };
    // The existing seed/SSR data stays available if startup requests stall.
    const deadline = window.setTimeout(dismiss, LOADER_MAXIMUM_MS);
    const refresh = () => Promise.all([
      api<SiteData>('/site', { signal: abort.signal }).catch(() => initialData),
      import('./lib/supabase').then(({ supabase }) => Promise.all([
        supabase.from('team_members').select('id, name, role, photo_url, created_at').order('created_at', { ascending: true }),
        supabase.from('events').select('*, event_photos (id, name, photo_url, position)').order('starts_at', { ascending: true }),
        supabase.from('site_settings').select('recruitment_open').eq('id', 1).single(),
      ])),
    ]).then(([site, [{ data: teamData, error: teamError }, { data: eventData, error: eventError }, { data: settingsData, error: settingsError }]]) => {
      if (teamError) console.error('Failed to load team from Supabase', teamError);
      if (eventError) console.error('Failed to load events from Supabase', eventError);
      
      const team = (teamData || []).map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.photo_url ?? undefined,
        createdAt: member.created_at,
        initials: member.name.trim().split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),
      }));

      const events = (eventData || []).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        description: ev.description,
        startsAt: ev.starts_at,
        endsAt: ev.ends_at,
        location: ev.location,
        category: ev.category,
        registrationUrl: ev.registration_url ?? '',
        albumUrl: ev.album_url ?? undefined,
        published: ev.published,
        managed: true,
        photos: (ev.event_photos || []).sort((a: any, b: any) => a.position - b.position).map((p: any) => ({
          id: p.id, name: p.name, url: p.photo_url
        }))
      }));

      const finalSettings = { ...site.settings };
      if (settingsData && !settingsError) {
        finalSettings.recruitmentOpen = settingsData.recruitment_open;
      }

      if (!disposed) { setData({ ...site, settings: finalSettings, team, events: events.length > 0 ? events : site.events }); }
    }).catch(() => { /* Recruitment verifies availability before accepting input. */ });
    const firstRequest = refresh();
    // Fonts and decorative frames load independently. SSR already has usable data.
    void (serverRendered ? Promise.resolve() : firstRequest).then(() => {
      if (!disposed && !finished) finishTimer = window.setTimeout(dismiss, Math.max(0, minimum - (performance.now() - started)));
    });
    window.addEventListener('focus', refresh);
    return () => {
      disposed = true; abort.abort(); window.clearTimeout(deadline); window.clearTimeout(finishTimer);
      window.removeEventListener('focus', refresh);
    };
  }, [serverRendered]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setApplyOpen(false); setDomain(null);
    const meta = pageMeta(location.pathname);
    document.title = meta.title;
    const setMeta = (attribute: 'name' | 'property', name: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.append(element); }
      element.content = content;
    };
    setMeta('name', 'description', meta.description); setMeta('name', 'robots', meta.robots);
    for (const prefix of ['og', 'twitter']) {
      const attribute = prefix === 'og' ? 'property' : 'name';
      setMeta(attribute, `${prefix}:title`, meta.title); setMeta(attribute, `${prefix}:description`, meta.description);
    }
    setMeta('property', 'og:url', meta.canonical);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = meta.canonical;
  }, [location.pathname]);

  // Menu links finish their own exit; browser Back/Forward still dismisses it.
  useEffect(() => {
    if (navigationType === 'POP') setMenuOpen(false);
  }, [location.key, navigationType]);

  const settings = data.settings;
  const domainItems = domains.map((item, index) => ({ ...item, onClick: () => setDomain(index) }));
  const navItems = [
    { title: 'Home', href: '/' },
    { title: 'Events', href: '/events' },
    { title: 'Live News', href: '/news' },
    { title: 'Our work', href: '/projects' },
    { title: 'Achievements', href: '/achievements' },
    { title: 'The people', href: '/team' },
    { title: 'Recruitment', href: '/recruitment' },
  ];



  return <>
    <LoadingScreen active={loadingStage === 'idle' || loadingStage === 'loading'} onExitComplete={() => setLoadingStage('done')} />
    <div className={`site-shell${['/', '/team', '/recruitment'].includes(pagePath) ? ' site-shell--home' : pagePath === '/projects' ? ' site-shell--work' : pagePath === '/achievements' ? ' site-shell--achievements' : ['/news', '/live-news'].includes(pagePath) ? ' site-shell--news' : ''}`} inert={loading} aria-busy={loading} data-loading-stage={loadingStage}>
    {['/', '/achievements', '/news', '/live-news', '/recruitment'].includes(pagePath) && <BackgroundRippleEffect className="background-ripple-effect--page" />}
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className={`site-header${pagePath === '/events' ? ' site-header--events' : ['/', '/team', '/recruitment'].includes(pagePath) ? ' site-header--home' : ''}`}>
      <MorphingNavbar items={navItems} settings={settings} open={menuOpen} onOpenChange={setMenuOpen} onApply={() => setApplyOpen(true)} />
    </header>
    <main id="main-content" tabIndex={-1} inert={menuOpen}>
      <PageBoundary key={location.pathname}><Suspense fallback={<div className="page-loading" role="status">Opening page…</div>}><Routes>
        <Route path="/" element={<><LogoLanding active={loadingStage === 'done'} /><DomainParallax domains={domainItems} /><CommunityCTA isOpen={settings.recruitmentOpen} /><VoicesMarquee /></>} />
        <Route path="/about" element={<><div className="about-heading section-wrap"><span className="eyebrow">Nucleus · SJEC</span><h1>A meeting<br /><em>of minds.</em></h1></div><DomainParallax domains={domainItems} /></>} />
        <Route path="/recruitment" element={<Recruitment settings={settings} />} />
        <Route path="/events" element={<EventsPage events={data.events} onPublished={event => setData(current => ({ ...current, events: [...current.events.filter(item => item.id !== event.id), event] }))} />} />
        <Route path="/projects" element={<WorkPage projects={data.projects} settings={settings} />} />
        <Route path="/achievements" element={<AchievementsPage members={data.team} settings={settings} />} />
        <Route path="/news" element={<LiveNews />} />
        <Route path="/live-news" element={<LiveNews />} />
        <Route path="/team" element={<PeoplePage members={data.team} />} />
        <Route path="*" element={<section className="recruitment-page section-wrap"><span className="eyebrow">404</span><h1>Lost the<br /><em>connection?</em></h1><Link className="button primary" to="/">Back to Nucleus <ArrowRight size={17} /></Link></section>} />
      </Routes></Suspense></PageBoundary>
    </main>
    {location.pathname === '/' && <SiteFooter settings={settings} />}
    {applyOpen && <ApplyForm settings={settings} onClose={() => setApplyOpen(false)} />}
    {domain !== null && <Modal title={`${domains[domain].title} ${domains[domain].subtitle}`} onClose={() => setDomain(null)}><p className="modal-lead">{domains[domain].detail}</p><div className="domain-tags">{domains[domain].tags.map(tag => <span key={tag}>{tag}</span>)}</div><button className="button primary" onClick={() => { setDomain(null); setApplyOpen(true); }}>Get involved <ArrowUpRight size={17} /></button></Modal>}
    </div>
  </>;
}
