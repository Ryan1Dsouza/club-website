import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LOADING_FRAME_URLS, MOBILE_LOADING_FRAME_URLS, prepareLoadingFrames } from './loading-frames';
import './loading-screen.css';

export type LoadingScreenProps = {
  /** Keep the component mounted and toggle active to play the curtain exit. */
  active?: boolean;
  message?: string;
  onExitComplete?: () => void;
};

function LoadingOverlay({ message }: { message: string }) {
  const reduced = useReducedMotion() === true;
  const [compact, setCompact] = useState<boolean | null>(null);
  const [frames, setFrames] = useState<string[] | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = matchMedia('(max-width: 767px), (max-height: 500px) and (max-width: 1024px), (pointer: coarse)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setFrames(null);
    if (reduced || compact === null) return;
    let disposed = false;
    void prepareLoadingFrames(compact).then(ready => { if (!disposed) setFrames(ready); });
    return () => { disposed = true; };
  }, [compact, reduced]);

  useEffect(() => {
    if (reduced || !frames?.length) return;
    const element = frameRef.current!;
    let request = 0, started = 0, previous = -1;
    const paint = (time: number) => {
      if (!started) started = time;
      // Skip missed beats on a busy device; never queue frame updates or React renders.
      const index = Math.floor((time - started) / 50) % frames.length;
      if (index !== previous) {
        element.style.setProperty('--frame-image', `url("${frames[index]}")`);
        element.dataset.frame = String(index);
        previous = index;
      }
      request = requestAnimationFrame(paint);
    };
    const visibility = () => {
      cancelAnimationFrame(request);
      if (!document.hidden) request = requestAnimationFrame(paint);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(request);
      document.removeEventListener('visibilitychange', visibility);
      element.style.removeProperty('--frame-image');
      delete element.dataset.frame;
    };
  }, [frames, reduced]);

  useEffect(() => {
    const root = document.documentElement, body = document.body;
    const rootOverflow = root.style.overflow, bodyOverflow = body.style.overflow;
    const gutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = rootOverflow; body.style.overflow = bodyOverflow;
      root.style.scrollbarGutter = gutter;
    };
  }, []);

  return <motion.div
    className="nucleus-loader"
    data-loading-screen=""
    data-frames-ready={Boolean(frames?.length) && !reduced}
    data-lenis-prevent=""
    initial={{ x: '0%', clipPath: 'inset(0% 0% 0% 0%)' }}
    exit={compact
      ? { x: reduced ? '0%' : '-100%' }
      : { x: reduced ? '0%' : '-20%', clipPath: 'inset(0% 100% 0% 0%)' }}
    transition={{ type: 'tween', duration: reduced ? 0 : compact ? .35 : .45, ease: [.77, 0, .175, 1] }}
  >
    <div className="nucleus-loader__art" aria-hidden="true">
      <div ref={frameRef} className="nucleus-loader__frame" style={{
        '--desktop-frame-image': `url("${LOADING_FRAME_URLS[0]}")`,
        '--mobile-frame-image': `url("${MOBILE_LOADING_FRAME_URLS[0]}")`,
      } as CSSProperties} />
      {frames?.length === 0 && <span className="nucleus-loader__fallback">Nucleus</span>}
    </div>
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</span>
  </motion.div>;
}

/** Mount once, outside transformed containers. The parent controls readiness. */
export default function LoadingScreen({ active = true, message = 'Connecting the dots…', onExitComplete }: LoadingScreenProps) {
  return <AnimatePresence onExitComplete={onExitComplete}>
    {active && <LoadingOverlay key="nucleus-loading-screen" message={message} />}
  </AnimatePresence>;
}
