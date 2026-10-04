import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';
import { createCinematicLenis } from '../lib/cinematic-lenis';

export const BOOK_SCROLL_STEP = 420;

/** One gesture pulls one leaf. Lenis owns the scroll position and settling motion. */
export function useBookScroll(wrapper: RefObject<HTMLDivElement | null>, content: RefObject<HTMLDivElement | null>, count: number) {
  const reduced = !!useReducedMotion();
  const [cursor, setCursor] = useState(0);
  const current = useRef(0), navigate = useRef<(delta: number) => void>(() => {});
  useEffect(() => {
    const element = wrapper.current!, track = content.current!;
    // Route normalized gestures ourselves so touch inertia cannot skip photos.
    const lenis = createCinematicLenis({ wrapper: element, content: track, eventsTarget: document.createElement('div'), autoResize: false, duration: .46 });
    const clamp = (value: number) => Math.max(0, Math.min(count - 1, value));
    let frame = 0, last = 0, clock = 0, snapTimer = 0;
    let target = clamp(current.current), anchor = Math.round(target), direction = 0, gesturing = false;
    let touchY = 0, touchStartY = 0, touchId: number | null = null, pulled = false;
    let touchStory: HTMLElement | null = null;
    const update = () => {
      const value = clamp(Number(lenis.scroll) / BOOK_SCROLL_STEP);
      current.current = value; setCursor(value);
    };
    const tick = (time: number) => {
      frame = 0; clock += last ? Math.min(100, time - last) : 1000 / 60; last = time;
      lenis.raf(clock);
      if (lenis.isScrolling) frame = requestAnimationFrame(tick); else last = 0;
    };
    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); };
    const scroll = (value: number, duration = .46, immediate = reduced) => {
      lenis.scrollTo(clamp(value) * BOOK_SCROLL_STEP, { duration, immediate });
      if (immediate) update();
      wake();
    };
    const go = (page: number) => {
      clearTimeout(snapTimer); gesturing = false;
      target = clamp(page); anchor = Math.round(target); scroll(target);
    };
    navigate.current = delta => go(Math.round(gesturing ? current.current : target) + delta);
    const settle = () => {
      const fraction = target - Math.floor(target);
      const page = direction > 0 && fraction > .22 ? Math.ceil(target)
        : direction < 0 && fraction < .78 ? Math.floor(target) : Math.round(target);
      go(page);
    };
    const begin = () => {
      clearTimeout(snapTimer);
      target = current.current; anchor = Math.round(target); gesturing = true;
    };
    const pull = (pixels: number, touch = false) => {
      if (!gesturing) begin();
      clearTimeout(snapTimer); direction = Math.sign(pixels);
      target = clamp(Math.max(anchor - 1, Math.min(anchor + 1, target + pixels / BOOK_SCROLL_STEP)));
      scroll(target, touch ? .08 : .18);
    };
    const storyCanScroll = (target: EventTarget | null, delta: number) => {
      const story = target instanceof Element ? target.closest<HTMLElement>('[data-book-scroll]') : null;
      return !!story && (delta > 0 ? story.scrollTop + story.clientHeight < story.scrollHeight - 2 : story.scrollTop > 2);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      if (storyCanScroll(event.target, event.deltaY)) { event.stopPropagation(); return; }
      event.preventDefault(); event.stopPropagation();
      pull(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1));
      snapTimer = window.setTimeout(settle, 180);
    };
    const start = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      if (touchId !== null) { end(); return; }
      touchId = event.pointerId; touchY = touchStartY = event.clientY; pulled = false;
      touchStory = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-book-scroll]') : null;
      begin();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== touchId || Math.abs(event.clientY - touchStartY) < 5 && !element.hasPointerCapture(event.pointerId)) return;
      // Keep receiving the release when the visible page replaces its image DOM.
      element.setPointerCapture(event.pointerId);
      const delta = touchY - event.clientY; touchY = event.clientY;
      event.preventDefault(); event.stopPropagation();
      if (touchStory && storyCanScroll(touchStory, delta) && !pulled) { touchStory.scrollTop += delta; return; }
      pulled = true;
      pull(delta * BOOK_SCROLL_STEP / Math.max(240, element.clientHeight * .65), true);
    };
    const end = (event?: PointerEvent) => {
      if (event && event.pointerId !== touchId) return;
      const id = touchId; touchId = null;
      if (id !== null && element.hasPointerCapture(id)) element.releasePointerCapture(id);
      if (pulled) settle(); else gesturing = false;
      pulled = false; touchStory = null;
    };
    const resize = new ResizeObserver(() => {
      element.style.setProperty('--book-height', `${element.clientHeight}px`);
      lenis.resize();
      target = clamp(current.current); scroll(target, 0, true);
    });
    resize.observe(element);
    lenis.on('scroll', update);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', start);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
    element.addEventListener('lostpointercapture', end);
    const visibility = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (!document.hidden) wake();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(snapTimer); cancelAnimationFrame(frame); resize.disconnect();
      lenis.off('scroll', update); lenis.destroy(); navigate.current = () => {};
      element.removeEventListener('wheel', wheel); element.removeEventListener('pointerdown', start);
      element.removeEventListener('pointermove', move); element.removeEventListener('pointerup', end); element.removeEventListener('pointercancel', end); element.removeEventListener('lostpointercapture', end);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [wrapper, content, count, reduced]);
  const turn = useCallback((delta: number) => navigate.current(delta), []);
  return { cursor, reduced, turn };
}
