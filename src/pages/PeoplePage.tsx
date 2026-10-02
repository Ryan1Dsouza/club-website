import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { ArrowDown, ArrowUpRight, GraduationCap, RotateCcw, UsersRound } from 'lucide-react';
import type { Member } from '../types';
import { memberProgress, sortTowerMembers, TOWER_INTRO, TOWER_OUTRO } from '../lib/people-tower-motion';
import { enrichTowerMembers } from '../lib/people-data';
import './showcase.css';
import './people-tower.css';
import './people-directory.css';

export default function PeoplePage({ members }: { members: Member[] }) {
  const location = useLocation();
  const isReturningRef = useRef(
    typeof window !== 'undefined' && (
      sessionStorage.getItem('people_return_to_directory') === 'true' ||
      location.hash === '#directory' ||
      (location.state as { scrollToDirectory?: boolean })?.scrollToDirectory
    )
  );
  const isReturning = isReturningRef.current;
  const enrichedMembers = useMemo(() => enrichTowerMembers(members), [members]);

  const sorted = useMemo(
    () => sortTowerMembers(enrichedMembers),
    [enrichedMembers],
  );
  const story = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const directory = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'still' | 'fallback'>('loading');
  const [active, setActive] = useState(-1);
  const [directoryOpen, setDirectoryOpen] = useState(isReturning);
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
    let idle = 0, timer = 0;
    let cleanup: (() => void) | undefined;
    function stop() {
      controller.current = null;
      const dispose = cleanup; cleanup = undefined; dispose?.();
    }
    async function start() {
      if (disposed) return;
      if (idle) { cancelIdleCallback(idle); idle = 0; }
      window.clearTimeout(timer);
      const current = ++generation;
      stop(); setActive(-1);
      if (!isReturningRef.current) {
        setDirectoryOpen(false);
        directory.current?.style.removeProperty('--directory-progress');
      } else {
        directory.current?.style.setProperty('--directory-progress', '1');
      }
      if (media.matches) { setStatus('still'); return; }
      setStatus('loading');
      try {
        const { createPeopleTower } = await import('../lib/people-tower');
        if (disposed || current !== generation) return;
        const tower = await createPeopleTower(element!, section!, sorted, {
          onMember: index => { if (!disposed && current === generation) setActive(index); },
          onOutro: progress => {
            if (disposed || current !== generation) return;
            directory.current?.style.setProperty('--directory-progress', String(progress));
            setDirectoryOpen(progress > 0);
          },
          onError: () => {
            if (!disposed && current === generation) {
              generation++;
              stop(); setStatus('fallback'); setActive(-1);
            }
          },
        });
        // Navigation or a motion preference change may finish while the GPU is
        // compiling. Release that obsolete scene instead of reviving it.
        if (disposed || current !== generation) { tower.dispose(); return; }
        cleanup = tower.dispose; controller.current = tower;
        setStatus('ready');
      } catch {
        if (!disposed && current === generation) { stop(); setStatus('fallback'); setActive(-1); }
      }
    }
    if (typeof requestIdleCallback !== 'undefined') idle = requestIdleCallback(() => void start(), { timeout: 2000 });
    else timer = window.setTimeout(() => void start(), 100);
    media.addEventListener('change', start);
    return () => {
      disposed = true; generation++;
      if (idle) cancelIdleCallback(idle);
      window.clearTimeout(timer);
      media.removeEventListener('change', start); stop();
    };
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
    if (directory.current && (status === 'still' || status === 'fallback')) {
      directory.current.scrollIntoView({ behavior: 'instant' });
      return;
    }
    const section = story.current;
    if (!section) return;
    // A keyboard-accessible shortcut to the same final scroll position.
    window.scrollTo({ top: section.offsetTop + section.offsetHeight - innerHeight, behavior: 'instant' });
  }
  useIsomorphicLayoutEffect(() => {
    if (isReturning) {
      sessionStorage.removeItem('people_return_to_directory');
      if (directory.current) {
        directory.current.style.setProperty('--directory-progress', '1');
      }
      const section = story.current;
      if (section) {
        if (directory.current && (status === 'still' || status === 'fallback')) {
          directory.current.scrollIntoView({ behavior: 'instant' });
        } else {
          const top = section.offsetTop + section.offsetHeight - window.innerHeight;
          window.scrollTo({ top, behavior: 'instant' });
        }
      }
    }
  }, []);
  return <section className="people-page" aria-labelledby="people-title" data-tower-status={status}>
    <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
    <div className="people-tower" ref={story} style={{
      '--tower-length': `${sorted.length * 55 + 120}svh`,
    } as CSSProperties}>
      <div className="people-tower__stage" inert={showDirectory}>
        <div className="people-tower__world" ref={host} aria-hidden="true" />
        <div className="people-tower__topline"><span className="eyebrow">02 / The people</span></div>
        <div className="people-tower__finish" aria-hidden="true"><p>The<br /><em>whole team.</em></p><span>Meet everyone <ArrowDown size={15} /></span></div>
        <p className="people-tower__hint" hidden={status !== 'ready'}>
          <span className="people-tower__hint-mouse">Click a block to pull it out. Drag to play. Scroll to meet the team.</span>
          <span className="people-tower__hint-touch">Tap a block to pull it out. Drag sideways to play. Swipe up to meet the team.</span>
        </p>
        <div className="people-tower__hud" hidden={status !== 'ready'}>
          <div className="people-tower__counter"><span>{active < 0 ? '—' : String(active + 1).padStart(2, '0')}</span><span>/ {String(sorted.length).padStart(2, '0')}</span></div>

          <label className="people-tower__picker"><span className="sr-only">Jump to a member</span><select value={active < 0 ? '' : active} onChange={event => revealMember(Number(event.target.value))}><option value="" disabled>Meet the members</option>{sorted.map((member, index) => <option key={member.id} value={index}>{member.name}</option>)}</select></label>
          <button className="people-tower__rebuild" onClick={() => controller.current?.rebuild()}><RotateCcw size={14} /><span>Rebuild tower</span></button>
        </div>
      </div>
    </div>
    <nav className="people-directory" ref={directory} aria-label="Explore the Nucleus community" aria-hidden={!showDirectory} inert={!showDirectory} data-visible={showDirectory} onKeyDown={event => { if (event.key === 'Escape' && status === 'ready') revealMember(sorted.length - 1); }}>
      <div className="people-directory__cards">
        <Link to="/members" onClick={() => sessionStorage.setItem('people_return_to_directory', 'true')} className="people-directory__card" aria-label="Members">
          <div className="people-directory__meta"><span>01 / The community</span><UsersRound size={22} aria-hidden="true" /></div>
          <div className="people-directory__copy"><h2>Members</h2><p>The people making it happen.</p></div>
          <div className="people-directory__footer"><span>Meet our members</span><ArrowUpRight size={23} aria-hidden="true" /></div>
        </Link>
        <Link to="/alumni" onClick={() => sessionStorage.setItem('people_return_to_directory', 'true')} className="people-directory__card people-directory__card--alumni" aria-label="Alumni">
          <div className="people-directory__meta"><span>02 / The legacy</span><GraduationCap size={23} aria-hidden="true" /></div>
          <div className="people-directory__copy"><h2>Alumni</h2><p>Part of Nucleus. Always.</p></div>
          <div className="people-directory__footer"><span>Meet our alumni</span><ArrowUpRight size={23} aria-hidden="true" /></div>
        </Link>
      </div>
    </nav>
  </section>;
}
