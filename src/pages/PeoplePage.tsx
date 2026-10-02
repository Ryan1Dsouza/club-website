import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, GraduationCap, RotateCcw, UsersRound } from 'lucide-react';
import type { Member } from '../types';
import { memberProgress, sortTowerMembers, TOWER_INTRO, TOWER_OUTRO } from '../lib/people-tower-motion';
import { enrichTowerMembers } from '../lib/people-data';
import './showcase.css';
import './people-tower.css';
import './people-directory.css';

export default function PeoplePage({ members }: { members: Member[] }) {
  const enrichedMembers = useMemo(() => enrichTowerMembers(members), [members]);

  const sorted = useMemo(
    () => sortTowerMembers(enrichedMembers),
    [enrichedMembers],
  );
  const story = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const directory = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'still' | 'fallback'>('loading');
  const [active, setActive] = useState(-1);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const showDirectory = directoryOpen || status === 'still' || status === 'fallback';
  const memberKey = useMemo(() => JSON.stringify(sorted), [sorted]);
  const controller = useRef<{ rebuild: () => void } | null>(null);
  useEffect(() => {
    if (!directoryOpen || status !== 'ready') return;
    const header = document.querySelector<HTMLElement>('.site-header');
    const previouslyInert = header?.inert;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (header) header.inert = true;
    if (previousFocus && (header?.contains(previousFocus) || story.current?.contains(previousFocus))) {
      directory.current?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    }
    return () => {
      if (header) header.inert = previouslyInert ?? false;
      if (directory.current?.contains(document.activeElement) && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [directoryOpen, status]);
  useEffect(() => {
    const element = host.current, section = story.current;
    if (!element || !section || !sorted.length) { setStatus('still'); return; }
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, generation = 0;
    let cleanup: (() => void) | undefined;
    function stop() {
      controller.current = null;
      const dispose = cleanup; cleanup = undefined; dispose?.();
    }
    async function start() {
      if (disposed) return;
      const current = ++generation;
      stop(); setActive(-1); setDirectoryOpen(false);
      directory.current?.style.removeProperty('--directory-progress');
      if (media.matches) { setStatus('still'); return; }
      setStatus('loading');
      try {
        const { createPeopleTower } = await import('../lib/people-tower');
        if (disposed || current !== generation) return;
        const tower = createPeopleTower(element!, section!, sorted, {
          onMember: index => { if (!disposed && current === generation) setActive(index); },
          onOutro: progress => {
            if (disposed || current !== generation) return;
            directory.current?.style.setProperty('--directory-progress', String(progress));
            setDirectoryOpen(progress > 0);
          },
          onError: () => {
            if (!disposed && current === generation) {
              stop(); setStatus('fallback'); setActive(-1);
            }
          },
        });
        cleanup = tower.dispose; controller.current = tower;
        setStatus('ready');
      } catch {
        if (!disposed && current === generation) { stop(); setStatus('fallback'); setActive(-1); }
      }
    }
    void start(); media.addEventListener('change', start);
    return () => { disposed = true; generation++; media.removeEventListener('change', start); stop(); };
    // Equivalent API refreshes should preserve the current scene.
  }, [memberKey]);
  function revealMember(index: number) {
    const section = story.current;
    if (!section || status !== 'ready') return;
    const stage = section.querySelector<HTMLElement>('.people-tower__stage');
    if (!stage) return;
    const header = parseFloat(getComputedStyle(stage).top) || 0;
    const top = section.getBoundingClientRect().top + scrollY - header;
    window.scrollTo({ top: top + memberProgress(index, sorted.length) * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    section.querySelector<HTMLSelectElement>('select')?.focus({ preventScroll: true });
  }
  function revealDirectory() {
    const section = story.current;
    if (!section) return;
    // A keyboard-accessible shortcut to the same final scroll position.
    window.scrollTo({ top: section.offsetTop + section.offsetHeight - innerHeight, behavior: 'instant' });
  }
  return <section className="people-page" aria-labelledby="people-title" data-tower-status={status}>
    <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
    <div className="people-tower" ref={story} style={{
      '--tower-length': `${(TOWER_INTRO + sorted.length + TOWER_OUTRO) * 90 + 100}svh`,
    } as CSSProperties}>
      <div className="people-tower__stage" inert={showDirectory}>
        <div className="people-tower__world" ref={host} aria-hidden="true" />
        <div className="people-tower__topline"><span className="eyebrow">02 / The people</span><button onClick={revealDirectory} className="people-tower__skip">Members &amp; Alumni <ArrowDown size={14} /></button></div>
        <p className="people-tower__hint" hidden={status !== 'ready'}>Click a block to pull it out. Drag to play. Scroll to meet the team.</p>
        <div className="people-tower__hud" hidden={status !== 'ready'}>
          <div className="people-tower__counter"><span>{active < 0 ? '—' : String(active + 1).padStart(2, '0')}</span><span>/ {String(sorted.length).padStart(2, '0')}</span></div>

          <label className="people-tower__picker"><span className="sr-only">Jump to a member</span><select value={active < 0 ? '' : active} onChange={event => revealMember(Number(event.target.value))}><option value="" disabled>Meet the members</option>{sorted.map((member, index) => <option key={member.id} value={index}>{member.name}</option>)}</select></label>
          <button className="people-tower__rebuild" onClick={() => controller.current?.rebuild()}><RotateCcw size={14} /><span>Rebuild tower</span></button>
        </div>
      </div>
    </div>
    <nav className="people-directory" ref={directory} aria-label="Explore the Nucleus community" aria-hidden={!showDirectory} inert={!showDirectory} data-visible={showDirectory} onKeyDown={event => { if (event.key === 'Escape' && status === 'ready') revealMember(sorted.length - 1); }}>
      <div className="people-directory__cards">
        <Link to="/members" className="people-directory__card" aria-label="Members">
          <div className="people-directory__meta"><span>01 / The community</span><UsersRound size={22} aria-hidden="true" /></div>
          <div className="people-directory__copy"><h2>Members</h2><p>The people making it happen.</p></div>
          <div className="people-directory__footer"><span>Meet our members</span><ArrowUpRight size={23} aria-hidden="true" /></div>
        </Link>
        <Link to="/alumni" className="people-directory__card people-directory__card--alumni" aria-label="Alumni">
          <div className="people-directory__meta"><span>02 / The legacy</span><GraduationCap size={23} aria-hidden="true" /></div>
          <div className="people-directory__copy"><h2>Alumni</h2><p>Part of Nucleus. Always.</p></div>
          <div className="people-directory__footer"><span>Meet our alumni</span><ArrowUpRight size={23} aria-hidden="true" /></div>
        </Link>
      </div>
    </nav>
  </section>;
}
