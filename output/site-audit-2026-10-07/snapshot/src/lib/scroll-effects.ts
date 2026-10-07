type View = { top: number; height: number; viewport: number; reduced: boolean };
type Effect = { element: HTMLElement; paint: (view: View) => void; top: number; height: number };
const effects = new Set<Effect>();
let frame = 0, dirty = true;
let stop: (() => void) | undefined;
function schedule() { if (!frame) frame = requestAnimationFrame(flush); }
function measure() { dirty = true; schedule(); }
function flush() {
  frame = 0;
  const viewport = window.innerHeight, scroll = window.scrollY;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Read layout together, only when it changes. Animated transforms are excluded.
  if (dirty) for (const effect of effects) {
    let top = 0;
    for (let node: HTMLElement | null = effect.element; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
    effect.top = top;
    effect.height = effect.element.offsetHeight;
  }
  dirty = false;
  for (const effect of effects) effect.paint({ top: effect.top - scroll, height: effect.height, viewport, reduced });
}
/** One event-driven scheduler; no idle loop or per-letter subscriptions. */
export function observeScroll(element: HTMLElement, paint: Effect['paint']) {
  const effect: Effect = { element, paint, top: 0, height: 0 };
  effects.add(effect);
  if (!stop) {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    media.addEventListener('change', measure);
    document.fonts.addEventListener('loadingdone', measure);
    stop = () => {
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      media.removeEventListener('change', measure);
      document.fonts.removeEventListener('loadingdone', measure);
      cancelAnimationFrame(frame);
      frame = 0;
      stop = undefined;
    };
  }
  measure();
  return () => { effects.delete(effect); if (!effects.size) stop?.(); };
}
export const clampProgress = (value: number) => Math.max(0, Math.min(1, value));
