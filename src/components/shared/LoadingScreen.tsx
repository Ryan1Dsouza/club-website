import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LOADING_FRAME_URLS, prepareLoadingFrames } from './loading-frames';
import './loading-screen.css';

export type LoadingScreenProps = {
  /** Keep the component mounted and toggle active to play the curtain exit. */
  active?: boolean;
  message?: string;
  onExitComplete?: () => void;
};

function LoadingOverlay({ message }: { message: string }) {
  const reduced = useReducedMotion() === true;
  const [compact, setCompact] = useState(false);
  const [frames, setFrames] = useState<string[] | null>(null);

  useEffect(() => {
    const media = matchMedia('(max-width: 480px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let disposed = false;
    void prepareLoadingFrames().then(ready => { if (!disposed) setFrames(ready); });
    return () => { disposed = true; };
  }, [reduced]);

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

  const visibleFrames = reduced || !frames ? [LOADING_FRAME_URLS[0]] : frames;

  return <motion.div
    className="nucleus-loader"
    data-loading-screen=""
    data-frames-ready={Boolean(frames?.length) && !reduced}
    data-lenis-prevent=""
    initial={{ x: '0%', clipPath: 'inset(0% 0% 0% 0%)' }}
    exit={{ x: reduced ? '0%' : '-20%', clipPath: 'inset(0% 100% 0% 0%)' }}
    transition={{
      type: 'tween', duration: reduced ? 0 : compact ? .35 : .45,
      ease: [.77, 0, .175, 1],
    }}
  >
    <div className="nucleus-loader__art" aria-hidden="true">
      {visibleFrames.map((url, index) => <div
        key={index}
        className="nucleus-loader__frame"
        style={{ '--frame-image': `url("${url}")`, '--frame-delay': `${index * 50}ms` } as CSSProperties}
      />)}
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
