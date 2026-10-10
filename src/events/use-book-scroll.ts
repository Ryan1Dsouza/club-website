import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';
import { flushSync } from 'react-dom';
import { createCinematicLenis } from '../lib/cinematic-lenis';
import { createPageTurnSound } from '../lib/interaction-sounds';

export const BOOK_SCROLL_STEP = 420;
export const BOOK_TURN_DURATION = .52;
const turnEasing = (t: number) => 1 - Math.pow(1 - t, 3);
const WHEEL_LERP = .14;
const WHEEL_IDLE_MS = 140;
// React only needs a new tree at a leaf boundary or when a turn starts/ends.
const phase = (value: number) => `${Math.floor(value)}:${value !== Math.floor(value)}`;

/** Touch pulls one leaf; wheel gestures flow through pages with Lenis interpolation. */
export function useBookScroll(wrapper: RefObject<HTMLDivElement | null>, content: RefObject<HTMLDivElement | null>, count: number, singlePage = false, onFrame?: (value: number) => void) {
  const reduced = !!useReducedMotion();
  const [cursor, setCursor] = useState(0);
  const current = useRef(0), navigate = useRef<(delta: number) => void>(() => {});
  const paint = useRef(onFrame); paint.current = onFrame;
  const format = useRef({ singlePage, count });
  const remap = (value: number) => {
    if (format.current.singlePage !== singlePage) {
      const page = Math.round(value);
      value = singlePage ? page * 2 : Math.floor(page / 2);
    }
    return format.current.singlePage !== singlePage || format.current.count !== count ? Math.min(value, Math.max(0, count - 2)) : value;
  };
  const displayedCursor = remap(cursor);
  useLayoutEffect(() => {
    current.current = remap(current.current);
    format.current = { singlePage, count }; setCursor(current.current);
    const element = wrapper.current!, track = content.current!;
    // Rebuild dimensions and restore the remapped photo before a native scroll
    // event can report the old layout's clamped position after rotation.
    element.style.setProperty('--book-height', `${element.clientHeight}px`);
    // Route normalized gestures ourselves so touch inertia cannot skip photos.
    const lenis = createCinematicLenis({ wrapper: element, content: track, eventsTarget: document.createElement('div'), autoResize: false, duration: BOOK_TURN_DURATION, easing: turnEasing });
    const clamp = (value: number) => Math.max(0, Math.min(count - 1, value));
    lenis.scrollTo(clamp(current.current) * BOOK_SCROLL_STEP, { immediate: true });
    let frame = 0, last = 0, clock = 0, snapTimer = 0;
    let renderedPhase = phase(current.current), touchPending = false, touchDistance = 1;
    let target = clamp(current.current), anchor = Math.round(target), direction = 0, gesturing = false, touchGesture = false, settling = false;
    let touchY = 0, touchStartY = 0, touchId: number | null = null, pulled = false;
    let touchStory: HTMLElement | null = null;
    let reading = false, storyVelocity = 0, touchTime = 0;
    const soundTurn = createPageTurnSound(current.current);
    const update = () => {
      const raw = clamp(Number(lenis.scroll) / BOOK_SCROLL_STEP);
      // Keep the leaf and its underlying photo on the same side of a boundary.
      const value = Math.abs(raw - Math.round(raw)) < .0001 ? Math.round(raw) : raw;
      soundTurn(value);
      current.current = value;
      const next = phase(value);
      // Commit the photo, leaf visibility and angle in the SAME animation frame.
      // Painting a reset angle against the previous React tree exposed the old
      // photograph for one frame at every completed (or reversed) turn.
      if (next !== renderedPhase) { renderedPhase = next; flushSync(() => setCursor(value)); }
      paint.current?.(value);
    };
    const flushTouch = () => {
      if (!touchPending) return;
      touchPending = false;
      // Touch position is authoritative. Do not restart a short easing curve
      // on every move, which lags behind the finger and jumps on slow frames.
      lenis.scrollTo(target * BOOK_SCROLL_STEP, { immediate: true });
      update();
    };
    const tick = (time: number) => {
      frame = 0;
      // Lenis integrates elapsed time analytically. Dropping time on a busy
      // frame stretched a half-second turn into slow motion on mobile.
      const elapsed = last ? Math.min(250, time - last) : 1000 / 60;
      clock += elapsed; last = time;
      if (touchPending) flushTouch();
      lenis.raf(clock);
      if (touchId === null && touchStory && storyVelocity) {
        const before = touchStory.scrollTop;
        touchStory.scrollTop += storyVelocity * elapsed;
        storyVelocity *= Math.exp(-elapsed / 180);
        if (Math.abs(storyVelocity) < .02 || touchStory.scrollTop === before) storyVelocity = 0;
      }
      if (lenis.isScrolling || touchPending || storyVelocity && touchId === null) frame = requestAnimationFrame(tick); else last = 0;
    };
    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); };
    const scroll = (value: number, duration = BOOK_TURN_DURATION, immediate = reduced, follow = false, easing = turnEasing) => {
      lenis.scrollTo(clamp(value) * BOOK_SCROLL_STEP, { duration, immediate, easing, lerp: follow ? WHEEL_LERP : 0 });
      if (immediate) update();
      wake();
    };
    const go = (page: number) => {
      clearTimeout(snapTimer); gesturing = false; touchPending = false; settling = false; storyVelocity = 0;
      target = clamp(page); anchor = Math.round(target);
      // A short pull should not spend a full turn's duration settling.
      const distance = Math.abs(target - current.current);
      scroll(target, Math.max(.18, BOOK_TURN_DURATION * Math.min(1, distance + .25)));
    };
    navigate.current = delta => go(Math.round(gesturing ? current.current : target) + delta);
    const settle = () => {
      if (!touchGesture) {
        const velocity = (target - current.current) * 60 * WHEEL_LERP;
        // Keep wheel travel monotonic, including just beyond a leaf boundary.
        // Rounding 1.05 down to 1 briefly reopened the page that just left.
        const boundary = Math.round(target);
        target = clamp(Math.abs(target - boundary) < .0001 ? boundary : direction > 0 ? Math.ceil(target) : Math.floor(target));
        settling = true;
        const distance = target - current.current;
        const duration = Math.max(.22, BOOK_TURN_DURATION * Math.min(1, Math.abs(distance) + .25));
        // Match the incoming velocity and finish at rest. Moving an exponential
        // target straight to the boundary produced a sudden second acceleration
        // in both the cart and leaf after each wheel gesture.
        const slope = distance ? Math.max(0, Math.min(3, velocity * duration / distance)) : 0;
        scroll(target, duration, reduced, false, t => t * t * (3 - 2 * t) + slope * t * (1 - t) * (1 - t));
        return;
      }
      const fraction = target - Math.floor(target);
      // A short touch pull can return to rest; wheel travel settles above.
      const threshold = .28;
      const page = direction > 0 && fraction > threshold ? Math.ceil(target)
        : direction < 0 && fraction < 1 - threshold ? Math.floor(target) : Math.round(target);
      go(page);
    };
    const begin = () => {
      clearTimeout(snapTimer);
      target = current.current; anchor = Math.round(target); gesturing = true; direction = 0; settling = false;
      // A new gesture takes over exactly where the previous settlement is visible.
      scroll(target, 0, true);
    };
    const pull = (pixels: number, touch = false) => {
      if (!gesturing) begin();
      touchGesture = touch;
      clearTimeout(snapTimer);
      const nextDirection = Math.sign(pixels);
      if (!nextDirection) return;
      // Wheel input may be easing toward a distant target; reverse from the
      // visible page instead of first spending the gesture cancelling that lead.
      if (!touch && (settling || direction && direction !== nextDirection)) target = current.current;
      settling = false;
      direction = nextDirection;
      const next = target + pixels / BOOK_SCROLL_STEP;
      // Only direct touch is bounded to one leaf. A trackpad can continue
      // through a boundary without waiting for an artificial gesture timeout.
      target = clamp(touch ? Math.max(anchor - 1, Math.min(anchor + 1, next)) : next);
      if (touch) { touchPending = true; wake(); }
      // Lenis' exponential interpolation is time-corrected and can be retargeted
      // without restarting a zero-velocity ease on every trackpad packet.
      else scroll(target, 0, reduced, true);
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
      snapTimer = window.setTimeout(settle, WHEEL_IDLE_MS);
    };
    const start = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      if (touchId !== null) { end(); return; }
      touchId = event.pointerId; touchY = touchStartY = event.clientY; pulled = false;
      reading = false; storyVelocity = 0; touchTime = event.timeStamp;
      touchDistance = Math.max(240, element.clientHeight * .8);
      touchStory = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-book-scroll]') : null;
      // Transfer implicit capture before any turn replaces the touched story
      // or image. Waiting for the first move can lose the rest of the swipe.
      element.setPointerCapture(event.pointerId);
      begin();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== touchId || Math.abs(event.clientY - touchStartY) < 5 && !pulled && !reading) return;
      const delta = touchY - event.clientY; touchY = event.clientY;
      event.preventDefault(); event.stopPropagation();
      if (touchStory && !pulled && (reading || storyCanScroll(touchStory, delta))) {
        // Once a swipe starts reading, retain it through the edge. A new swipe
        // at that edge turns the page; text inertia must never flip a leaf.
        reading = true;
        const elapsed = Math.max(8, event.timeStamp - touchTime);
        storyVelocity = Math.max(-2.5, Math.min(2.5, delta / elapsed));
        touchTime = event.timeStamp;
        touchStory.scrollTop += delta;
        return;
      }
      pulled = true;
      pull(delta * BOOK_SCROLL_STEP / touchDistance, true);
    };
    const end = (event?: PointerEvent) => {
      if (event && event.pointerId !== touchId) return;
      const id = touchId; touchId = null;
      if (id !== null && element.hasPointerCapture(id)) element.releasePointerCapture(id);
      flushTouch();
      if (pulled) settle(); else gesturing = false;
      if (reading && event?.type !== 'pointercancel' && !reduced) {
        if (event && event.timeStamp - touchTime > 80) storyVelocity = 0;
        wake();
      } else { storyVelocity = 0; touchStory = null; }
      pulled = false; reading = false;
    };
    const lostCapture = (event: PointerEvent) => {
      // Transferring the image's implicit capture also bubbles this event.
      if (event.target === element) end(event);
    };
    const resize = new ResizeObserver(() => {
      element.style.setProperty('--book-height', `${element.clientHeight}px`);
      lenis.resize();
      touchPending = false;
      // Keep the intended page when a layout temporarily clamps native scroll.
      // A content resize follows the wrapper resize once its CSS height resolves.
      target = clamp(gesturing ? current.current : target); scroll(target, 0, true);
    });
    resize.observe(element);
    resize.observe(track);
    lenis.on('scroll', update);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('pointerdown', start);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
    element.addEventListener('lostpointercapture', lostCapture);
    const visibility = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (!document.hidden) wake();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearTimeout(snapTimer); cancelAnimationFrame(frame); resize.disconnect();
      lenis.off('scroll', update); lenis.destroy(); navigate.current = () => {};
      element.removeEventListener('wheel', wheel); element.removeEventListener('pointerdown', start);
      element.removeEventListener('pointermove', move); element.removeEventListener('pointerup', end); element.removeEventListener('pointercancel', end); element.removeEventListener('lostpointercapture', lostCapture);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [wrapper, content, count, reduced, singlePage]);
  const turn = useCallback((delta: number) => navigate.current(delta), []);
  return { cursor: displayedCursor, current, reduced, turn };
}
