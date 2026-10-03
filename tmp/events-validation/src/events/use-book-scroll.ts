import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';
import { createCinematicLenis } from '../lib/cinematic-lenis';

export const BOOK_SCROLL_STEP = 420;

/** Lenis' animated scroll position directly drives the physical page angle. */
export function useBookScroll(wrapper: RefObject<HTMLDivElement | null>, content: RefObject<HTMLDivElement | null>, count: number) {
  const reduced = !!useReducedMotion();
  const [cursor, setCursor] = useState(0);
  const current = useRef(0), navigate = useRef<(page: number) => void>(() => {});
  useEffect(() => {
    const element = wrapper.current!, track = content.current!;
    const lenis = createCinematicLenis({ wrapper: element, content: track, smoothWheel: !reduced, syncTouch: !reduced });
    let frame = 0, last = 0, clock = 0, snapTimer = 0;
    const update = () => {
      const value = Math.max(0, Math.min(count - 1, Number(lenis.scroll) / BOOK_SCROLL_STEP));
      current.current = value; setCursor(value);
    };
    const tick = (time: number) => {
      frame = 0; clock += last ? Math.min(100, time - last) : 1000 / 60; last = time;
      lenis.raf(clock);
      if (lenis.isScrolling) frame = requestAnimationFrame(tick); else last = 0;
    };
    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); };
    const go = (page: number) => {
      clearTimeout(snapTimer);
      lenis.scrollTo(Math.max(0, Math.min(count - 1, page)) * BOOK_SCROLL_STEP, { immediate: reduced }); wake();
    };
    navigate.current = go;
    const input = () => {
      wake(); clearTimeout(snapTimer);
      // Finish the closest spread after the gesture and its Lenis easing settle.
      snapTimer = window.setTimeout(() => go(Math.round(current.current)), 750);
    };
    const resize = new ResizeObserver(() => {
      element.style.setProperty('--book-height', `${element.clientHeight}px`);
      lenis.resize(); go(Math.round(current.current));
    });
    resize.observe(element);
    lenis.on('scroll', update);
    element.addEventListener('wheel', input, { passive: true });
    element.addEventListener('touchmove', input, { passive: true });
    const visibility = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (!document.hidden) wake();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(snapTimer); cancelAnimationFrame(frame); resize.disconnect();
      lenis.off('scroll', update); lenis.destroy(); navigate.current = () => {};
      element.removeEventListener('wheel', input); element.removeEventListener('touchmove', input);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [wrapper, content, count, reduced]);
  const turn = useCallback((delta: number) => navigate.current(Math.round(current.current) + delta), []);
  return { cursor, reduced, turn };
}
