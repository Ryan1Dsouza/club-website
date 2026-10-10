import { useEffect, useState } from 'react';
import { VISUAL_LOADING_EVENT } from './visual-readiness';

const GRACE_MS = 180;
const MAX_WAIT_MS = 12000;
type ImageState = { source: string; settled: boolean; decoding: boolean };

/** One readiness check per Events visit. Once the initial visible covers settle,
 * disconnect completely: scrolling, books, portraits and image errors cannot replay it. */
export function useVisualReadiness(pathname: string) {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (pathname !== '/events') return;
    let finished = false, frame = 0, timer = 0, shown = false;
    const started = performance.now();
    let images: Map<HTMLImageElement, ImageState> | null = null;
    const publish = (value: boolean) => {
      if (value === shown) return;
      shown = value; setPending(value);
      document.documentElement.dataset.visualLoading = String(value);
      window.dispatchEvent(new CustomEvent(VISUAL_LOADING_EVENT, { detail: value }));
    };
    const schedule = () => { if (!finished && !frame) frame = requestAnimationFrame(check); };
    const changes = new MutationObserver(schedule);
    const stop = () => {
      finished = true; cancelAnimationFrame(frame); clearTimeout(timer); changes.disconnect();
      document.removeEventListener('load', schedule, true);
      document.removeEventListener('error', schedule, true);
      publish(false);
    };
    function check() {
      frame = 0; clearTimeout(timer);
      if (finished) return;
      const elapsed = performance.now() - started;
      if (elapsed >= MAX_WAIT_MS) { stop(); return; }
      if (!images) {
        const grid = document.querySelector('.events-grid');
        if (grid) {
          // Capture one cohort, before the visitor can scroll to more images.
          images = new Map([...grid.querySelectorAll<HTMLImageElement>('.event-card__photo')]
            .filter(image => {
              const rect = image.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
            })
            .map(image => {
              image.loading = 'eager';
              return [image, { source: '', settled: false, decoding: false }];
            }));
          changes.disconnect();
        }
      }
      let waiting = images === null;
      for (const [image, state] of images ?? []) {
        if (!image.isConnected) continue;
        const source = image.currentSrc || image.src;
        if (!source) continue;
        if (source !== state.source) Object.assign(state, { source, settled: false, decoding: false });
        if (state.settled) continue;
        if (image.complete && !image.naturalWidth) { state.settled = true; continue; }
        if (image.complete && !state.decoding) {
          state.decoding = true;
          void image.decode().catch(() => {}).finally(() => {
            if (state.source === source) state.settled = true;
            schedule();
          });
        }
        waiting = true;
      }
      if (!waiting) { stop(); return; }
      if (elapsed >= GRACE_MS) publish(true);
      timer = window.setTimeout(schedule, shown ? MAX_WAIT_MS - elapsed : GRACE_MS - elapsed);
    }
    // Only wait for the Events route to mount; never observe later image insertions.
    changes.observe(document.getElementById('main-content') ?? document.body, { childList: true, subtree: true });
    document.addEventListener('load', schedule, true);
    document.addEventListener('error', schedule, true);
    schedule();
    return () => { stop(); delete document.documentElement.dataset.visualLoading; };
  }, [pathname]);
  return pathname === '/events' && pending;
}
