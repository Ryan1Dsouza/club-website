import { useEffect, useRef, useState } from 'react';
import logoUrl from '../../assets/nucleus-logo.webp';
import { MorphingText } from '../magicui/morphing-text';
import { clampProgress, observeScroll } from '../../lib/scroll-effects';
import './logo-landing.css';

export default function LogoLanding({ active = true }: { active?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('loading');
  const [formed, setFormed] = useState(false);
  const textReady = formed || status === 'still' || status === 'fallback';

  useEffect(() => {
    const section = sectionRef.current!;
    const text = section.querySelector<HTMLElement>('.logo-landing__text')!;
    let previous = -1;
    return observeScroll(section, ({ top, height, reduced }) => {
      const progress = reduced ? 0 : clampProgress(-top / Math.max(1, height));
      if (progress === previous) return;
      previous = progress;
      host.current!.style.transform = `translateY(${progress * 12}%) scale(${1 - progress * .06})`;
      host.current!.style.opacity = String(1 - progress * .88);
      text.style.transform = `translateY(${-progress * 28}%)`;
      text.style.opacity = String(1 - progress);
    });
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!active) {
      // Fetch scene code under the loader, but start its clock only after exit.
      if (!motion.matches) void import('../../lib/logo-scene').catch(() => {});
      return;
    }
    const element = host.current!;
    let disposed = false;
    let generation = 0;
    let disposeScene: (() => void) | undefined;
    let idle = 0, timer = 0;
    let visible = false;

    async function start() {
      const current = ++generation;
      disposeScene?.();
      disposeScene = undefined;
      setFormed(false);
      setStatus('loading');
      if (motion.matches) { setStatus('still'); return; }
      if (!visible || document.hidden) return;
      try {
        const { createLogoScene } = await import('../../lib/logo-scene');
        if (disposed || current !== generation) return;
        const cleanup = await createLogoScene(element, logoUrl, () => {
          if (!disposed && current === generation) setStatus('fallback');
        }, () => {
          if (!disposed && current === generation) setFormed(true);
        });
        if (disposed || current !== generation) cleanup();
        else {
          disposeScene = cleanup;
          setStatus('ready');
        }
      } catch (err) {
        console.error('Logo animation failed:', err);
        if (!disposed && current === generation) setStatus('fallback');
      }
    }

    const schedule = () => {
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
      // Allow the page to paint before compiling the scene's shaders.
      timer = window.setTimeout(() => void start(), 10);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !disposeScene) schedule();
    });
    observer.observe(element);
    if (motion.matches) setStatus('still');
    const visibility = () => { if (!document.hidden && !disposeScene) schedule(); };
    motion.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true;
      generation++;
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
      observer.disconnect();
      motion.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', visibility);
      disposeScene?.();
    };
  }, [active]);

  return <section ref={sectionRef} className="logo-landing" aria-label="Nucleus" data-status={status} data-active={active} data-text-ready={textReady}>
    <h1 className="sr-only">Nucleus SJEC — A connection worth making.</h1>
    <div className="logo-landing__scene" ref={host} role="img" aria-label="The Nucleus brain logo assembles from a field of luminous particles." />
    <svg className="logo-landing__fallback" viewBox="430 128 672 625" aria-hidden="true">
      <image href={logoUrl} width="1599" height="899" />
    </svg>
    <div className="logo-landing__text">
      <MorphingText texts={['THE NUCLEUS CLUB', 'CREATE', 'EXPLORE', 'INNOVATE']} active={textReady} />
    </div>
  </section>;
}
