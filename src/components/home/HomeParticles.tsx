import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { createHomeParticles, prefersStaticParticles } from '../../lib/home-particles';
import './home-particles.css';

export default function HomeParticles({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<Awaited<ReturnType<typeof createHomeParticles>>>(undefined);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const enabled = useRef(false);
  enabled.current = active && !paused;

  useEffect(() => {
    const element = host.current!;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let abort: AbortController | undefined;
    let timer = 0, idle = 0;
    const stop = () => {
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
      abort?.abort();
      controller.current = undefined;
      setReady(false);
    };
    const start = () => {
      stop();
      if (prefersStaticParticles()) return;
      abort = new AbortController();
      const signal = abort.signal;
      const init = () => {
        if (signal.aborted) return;
        void createHomeParticles(element, signal).then(instance => {
          if (signal.aborted || !instance) return;
          controller.current = instance;
          instance.setRunning(enabled.current);
          setReady(true);
        }).catch(() => { /* The static mint field remains if the library cannot load. */ });
      };
      // Give the logo and page content first use of the main thread.
      timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(init, { timeout: 1500 });
        else init();
      }, 600);
    };
    start();
    preference.addEventListener('change', start);
    return () => { stop(); preference.removeEventListener('change', start); };
  }, []);

  useEffect(() => { controller.current?.setRunning(active && !paused); }, [active, paused]);

  return <>
    <div className="home-particles" aria-hidden="true" data-ready={ready}>
      <div ref={host} id="home-particles-canvas" className="home-particles__canvas" />
    </div>
    <button className="home-particles-toggle" type="button" hidden={!ready || !active}
      aria-label={paused ? 'Resume background animation' : 'Pause background animation'}
      title={paused ? 'Resume background animation' : 'Pause background animation'}
      aria-pressed={paused} onClick={() => setPaused(value => !value)}>
      {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
    </button>
  </>;
}
