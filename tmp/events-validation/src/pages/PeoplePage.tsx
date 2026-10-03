import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';
import type { Member } from '../types';
import { memberProgress, sortTowerMembers } from '../lib/people-tower-motion';
import './showcase.css';
import './people-tower.css';

export default function PeoplePage({ members }: { members: Member[] }) {
  const sorted = useMemo(
    () => sortTowerMembers(members),
    [members],
  );
  const story = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'still' | 'fallback'>('loading');
  const [active, setActive] = useState(-1);
  const memberKey = useMemo(() => JSON.stringify(sorted), [sorted]);
  const controller = useRef<{ rebuild: () => void } | null>(null);
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
      if (media.matches) { setStatus('still'); return; }
      if (matchMedia('(max-width: 768px), (pointer: coarse)').matches) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      setStatus('loading');
      try {
        const { createPeopleTower } = await import('../lib/people-tower');
        if (disposed || current !== generation) return;
        const tower = await createPeopleTower(element!, section!, sorted, {
          onMember: index => { if (!disposed && current === generation) setActive(index); },
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
  return <section className="people-page" aria-labelledby="people-title" data-tower-status={status}>
    <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
    <div className="people-tower" ref={story} style={{
      '--tower-length': `${sorted.length * 55 + 120}svh`,
    } as CSSProperties}>
      <div className="people-tower__stage">
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









  </section>;
}
