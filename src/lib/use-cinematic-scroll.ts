import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

/** Gentle desktop wheel movement for the homepage's scroll-driven scenes. */
export function useCinematicScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    // ScrollTrigger temporarily repositions the document when measuring scenes.
    // Keep those measurements instant, including live preference changes.
    document.documentElement.classList.add('cinematic-page');
    const preference = window.matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
    let lenis: Lenis | undefined;
    let frame = 0, lastTick = 0, animationTime = 0;
    let disposed = false;
    let stopTracking: (() => void) | undefined;

    void import('./scroll-motion').then(({ ScrollTrigger }) => {
      if (disposed) return;
      // Rebuilding all scenes can clear ScrollTrigger's saved scroll position.
      // Preserve the reader's place through motion and viewport media changes.
      let savedScroll: number | undefined;
      const remember = () => { savedScroll = window.scrollY; };
      const restore = () => {
        if (savedScroll === undefined) return;
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(savedScroll, { immediate: true });
        }
        else window.scrollTo({ top: savedScroll, behavior: 'instant' });
        savedScroll = undefined;
        ScrollTrigger.update();
      };
      ScrollTrigger.addEventListener('refreshInit', remember);
      ScrollTrigger.addEventListener('refresh', restore);
      stopTracking = () => {
        ScrollTrigger.removeEventListener('refreshInit', remember);
        ScrollTrigger.removeEventListener('refresh', restore);
      };
    }).catch(() => { /* Wheel smoothing also works without the scene enhancement. */ });

    const destroy = () => {
      cancelAnimationFrame(frame); frame = 0; lastTick = 0;
      lenis?.stop();
      lenis?.destroy();
      lenis = undefined;
    };
    const tick = (time: number) => {
      frame = 0;
      // A virtual clock prevents an idle tab's first wheel input from jumping.
      animationTime += lastTick ? Math.min(32, time - lastTick) : 16;
      lastTick = time;
      lenis?.raf(animationTime);
      if (lenis?.isScrolling) frame = requestAnimationFrame(tick);
      else lastTick = 0;
    };
    const wake = () => {
      if (lenis && !frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      destroy();
      if (!preference.matches) return;
      lenis = new Lenis({ smoothWheel: true, syncTouch: false, wheelMultiplier: .6, lerp: .085 });
      animationTime = 0;
      wake();
    };
    // Let keyboard navigation, focusing controls, and scrollbar dragging take over
    // immediately instead of competing with unfinished wheel momentum.
    const settle = () => lenis?.scrollTo(window.scrollY, { immediate: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab'].includes(event.key)) settle();
    };
    sync();
    preference.addEventListener('change', sync);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', settle);
    window.addEventListener('focusin', settle);
    window.addEventListener('wheel', wake, { passive: true });
    return () => {
      disposed = true;
      stopTracking?.();
      destroy();
      document.documentElement.classList.remove('cinematic-page');
      preference.removeEventListener('change', sync);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', settle);
      window.removeEventListener('focusin', settle);
      window.removeEventListener('wheel', wake);
    };
  }, [enabled]);
}
