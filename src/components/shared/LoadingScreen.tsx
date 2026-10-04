import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import desktopSequence from '../../assets/loading/desktop/sequence.mp4';
import desktopPoster from '../../assets/loading/desktop/still.webp';
import mobileSequence from '../../assets/loading/mobile/sequence.mp4';
import mobilePoster from '../../assets/loading/mobile/still.webp';
import './loading-screen.css';

const compactQueries = ['(max-width: 767px)', '(max-height: 500px) and (max-width: 1024px)', '(pointer: coarse)'];
const compactMedia = compactQueries.join(', ');

export type LoadingScreenProps = { active?: boolean; message?: string; onExitComplete?: () => void };

function LoadingOverlay({ message }: { message: string }) {
  const reduced = useReducedMotion() === true;
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const media = matchMedia(compactMedia);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = videoRef.current!;
    let disposed = false;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const compactPreference = matchMedia(compactMedia);
    let request: AbortController | undefined, objectUrl = '', selected = '';
    // The browser media pipeline owns decode/playback, without a JS frame clock.
    const playback = () => {
      if (document.hidden || preference.matches) { video.pause(); return; }
      void video.play().catch(() => { if (!disposed) setReady(false); });
    };
    const select = async () => {
      const source = preference.matches ? '' : compactPreference.matches ? mobileSequence : desktopSequence;
      if (source === selected) { playback(); return; }
      selected = source; request?.abort(); video.pause(); setReady(false);
      video.removeAttribute('src'); video.load();
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = ''; }
      if (!source) return;
      const pending = request = new AbortController();
      try {
        // Reuse the high-priority HTML fetch preload. Native media requests have
        // low network priority and otherwise lose the entire intro to page assets.
        const response = await fetch(source, { signal: pending.signal });
        if (!response.ok) throw new Error('Loading artwork unavailable');
        const blob = await response.blob();
        if (disposed || pending.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob); video.src = objectUrl; playback();
      } catch { /* The branded poster remains available; startup never waits. */ }
    };
    void select();
    document.addEventListener('visibilitychange', playback);
    preference.addEventListener('change', select);
    compactPreference.addEventListener('change', select);
    return () => {
      disposed = true; request?.abort(); video.pause(); video.removeAttribute('src'); video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      document.removeEventListener('visibilitychange', playback);
      preference.removeEventListener('change', select);
      compactPreference.removeEventListener('change', select);
    };
  }, []);

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

  return <motion.div className="nucleus-loader" data-loading-screen=""
    data-frames-ready={ready && !reduced} data-art-failed={failed} data-lenis-prevent=""
    initial={{ x: '0%' }} exit={{ x: reduced ? '0%' : '-100%' }}
    transition={{ type: 'tween', duration: reduced ? 0 : compact ? .35 : .45, ease: [.77, 0, .175, 1] }}>
    <div className="nucleus-loader__art" aria-hidden="true">
      <picture className="nucleus-loader__poster">
        <source media={compactMedia} srcSet={mobilePoster} />
        <img src={desktopPoster} alt="" width={1440} height={810} decoding="async" fetchPriority="high"
          onError={() => setFailed(true)} onLoad={() => setFailed(false)} />
      </picture>
      <video ref={videoRef} className="nucleus-loader__video" autoPlay muted loop playsInline preload="auto"
        disablePictureInPicture tabIndex={-1} onPlaying={() => setReady(true)} onError={() => setReady(false)} />
      {failed && !ready && <span className="nucleus-loader__fallback">Nucleus</span>}
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
