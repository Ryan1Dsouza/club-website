import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Member } from '../../types';
import { memberProgress, sortTowerMembers } from '../../lib/people-tower-motion';
import { createTowerPortraits } from '../../lib/people-tower-portraits';
import '../../pages/people-tower.css';

export default function PeopleTower({ members, onStatusChange }: { members: Member[]; onStatusChange: (status: 'loading' | 'ready' | 'still' | 'fallback') => void }) {
  const sorted = useMemo(
    () => sortTowerMembers(members),
    [members],
  );
  const story = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'still' | 'fallback'>('loading');
  const [active, setActive] = useState(-1);
  useEffect(() => { onStatusChange(status); }, [status, onStatusChange]);
  const memberKey = useMemo(() => JSON.stringify(sorted), [sorted]);
  const controller = useRef<{ rebuild: () => void; seek: (progress: number) => void } | null>(null);
  useEffect(() => {
    const element = host.current, section = story.current;
    if (!element || !section || !sorted.length) { setStatus('still'); return; }
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const portraits = createTowerPortraits(sorted, matchMedia('(max-width: 768px), (pointer: coarse)').matches);
    // Start the first portraits before importing/compiling the 3D scene.
    if (!media.matches) portraits.prepare(0);
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
      portraits.prepare(0);
      setStatus('loading');
      try {
        const { createPeopleTower } = await import('../../lib/people-tower');
        if (disposed || current !== generation) return;
        const tower = await createPeopleTower(element!, section!, sorted, {
          onMember: index => { if (!disposed && current === generation) setActive(index); },
          onError: () => {
            if (!disposed && current === generation) {
              generation++;
              stop(); setStatus('fallback'); setActive(-1);
            }
          },
        }, portraits);
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
      media.removeEventListener('change', start); stop(); portraits.dispose();
    };
    // Equivalent API refreshes should preserve the current scene.
  }, [memberKey]);
  function revealMember(index: number) {
    const section = story.current;
    if (!section || status !== 'ready') return;
    controller.current?.seek(memberProgress(index, sorted.length));
    section.querySelector<HTMLSelectElement>('select')?.focus({ preventScroll: true });
  }
  return <section className="people-tower-view" aria-label="Interactive team tower" data-tower-status={status}>
    {(status === 'loading' || status === 'still' || status === 'fallback') && <p className="people-tower__status" role="status">
      {status === 'loading' ? 'Building the interactive tower...' : status === 'still' ? 'The tower is paused for reduced motion. Go back to the team to meet everyone.' : 'The tower could not start on this device. Go back to the team to meet everyone.'}
    </p>}
    <div className="people-tower" ref={story} style={{
      '--tower-length': `${sorted.length * 55 + 120}svh`,
    } as CSSProperties}>
      <div className="people-tower__stage">
        <div className="people-tower__world" ref={host} aria-hidden="true" />
        <div className="people-tower__finish" aria-hidden="true"><p>The<br /><em>whole team.</em></p><span>Keep throwing, or scroll back to revisit.</span></div>
        <p className="people-tower__hint" hidden={status !== 'ready'}>
          <span className="people-tower__hint-mouse">Click to pull. Grab, drag and release to throw. Scroll to meet the team.</span>
          <span className="people-tower__hint-touch">Grab any block. Drag and release to throw. Swipe on the background to meet the team.</span>
        </p>
        <div className="people-tower__hud" hidden={status !== 'ready'}>
          <label className="people-tower__picker"><span className="sr-only">Jump to a member</span><select value={active < 0 ? '' : active} onChange={event => revealMember(Number(event.target.value))}><option value="" disabled>Meet the members</option>{sorted.map((member, index) => <option key={member.id} value={index}>{member.name}</option>)}</select></label>
          <button type="button" className="people-tower__rebuild" aria-label="Rebuild tower" onClick={() => controller.current?.rebuild()}><RotateCcw size={14} /><span>Rebuild tower</span></button>
        </div>
      </div>
    </div>
  </section>;
}
