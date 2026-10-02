import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, MoveDown, Orbit } from 'lucide-react';
import type { ClubEvent } from '../types';
import EventArtwork from '../components/events/EventArtwork';
import './events-page.css';

const EventRollercoaster = lazy(() => import('./EventRollercoaster'));
const EventCarousel = lazy(() => import('./EventCarousel'));
type Mode = 'choice' | 'immersive' | 'superficial';

export default function EventsPage({ events, onPublished }: { events: ClubEvent[]; onPublished: (event: ClubEvent) => void }) {
  const [mode, setMode] = useState<'choice' | 'immersive' | 'superficial'>('choice');
  const reduced = useReducedMotion();
  const lastMode = useRef<Mode>('choice');
  const root = useRef<HTMLElement>(null);
  const count = events.filter(event => event.published).length;
  const choose = (next: Mode) => { lastMode.current = mode; setMode(next); };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [mode]);
  const focusChoice = () => {
    if (mode === 'choice' && lastMode.current !== 'choice') root.current?.querySelector<HTMLButtonElement>(`[data-mode="${lastMode.current}"]`)?.focus();
  };

  return <section className={`events-page events-page--${mode}`} ref={root} data-event-mode={mode} aria-label="Nucleus experiences">
    {mode !== 'choice' && <motion.button className="events-return" onClick={() => choose('choice')} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <ArrowLeft size={15} /><span>Change experience</span>
    </motion.button>}
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={mode} className="events-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : .28, ease: [.22, 1, .36, 1] }} onAnimationComplete={focusChoice}>
        {mode === 'choice' ? <div className="events-choice">
          <header className="events-choice__heading">
            <p className="events-eyebrow"><span />Nucleus / Experiences</p>
            <div><h1>Two ways <em>in.</em></h1><p>Follow your curiosity.<br />Choose how you want to explore.</p></div>
          </header>
          <div className="events-choice__options">
            <motion.button className="events-choice-card events-choice-card--browse" data-mode="superficial" onClick={() => choose('superficial')}
              whileHover={reduced ? undefined : { y: -6 }} whileTap={reduced ? undefined : { scale: .985 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }}>
              <span className="events-choice-card__top"><span>01 / At your pace</span><MoveDown size={19} /></span>
              <div className="events-choice-card__visual" aria-hidden="true"><span className="events-choice-card__plate" /><EventArtwork variant={0} /></div>
              <span className="events-choice-card__bottom"><span><small>Superficial experience</small><strong>Quick Browse</strong><span>A fast, visual overview of all upcoming events.</span></span><i><ArrowUpRight size={27} /></i></span>
            </motion.button>
            <motion.button className="events-choice-card events-choice-card--ride" data-mode="immersive" onClick={() => choose('immersive')}
              whileHover={reduced ? undefined : { y: -6 }} whileTap={reduced ? undefined : { scale: .985 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }}>
              <span className="events-choice-card__top"><span>02 / Into the unexpected</span><Orbit size={21} /></span>
              <div className="events-choice-card__visual events-choice-card__track" aria-hidden="true">
                <svg viewBox="0 0 600 360" fill="none"><defs><linearGradient id="choice-track" x1="50" y1="20" x2="520" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#e0ffe4" /><stop offset=".5" stopColor="#6bc78d" /><stop offset="1" stopColor="#d5edba" /></linearGradient></defs>
                  <path d="M-30 276C115 290 34 116 157 136S307 308 376 168 292 8 256 94 376 294 505 198 545 58 650 127" stroke="url(#choice-track)" strokeWidth="3" />
                  <path d="M-30 291C115 305 34 131 157 151S307 323 376 183 292 23 256 109 376 309 505 213 545 73 650 142" stroke="url(#choice-track)" strokeWidth="2" opacity=".6" />
                  <path d="M72 240V345M156 147V329M254 234V350M377 176V339M489 212V347" stroke="#baf3cd" strokeOpacity=".15" />
                  <circle cx="377" cy="175" r="11" fill="#c3e5c8" /><circle cx="377" cy="175" r="21" stroke="#c3e5c8" strokeOpacity=".4" />
                </svg>
              </div>
              <span className="events-choice-card__bottom"><span><small>Immersive experience</small><strong>The Nucleus Ride</strong><span>Step into our 3D rollercoaster and experience the journey.</span></span><i><ArrowUpRight size={27} /></i></span>
            </motion.button>
          </div>
          <footer className="events-choice__footer"><span>{String(count).padStart(2, '0')} {count === 1 ? 'event' : 'events'}. Countless connections.</span><span>Made of many minds.</span></footer>
        </div> : <Suspense fallback={<div className="events-opening" role="status">Opening your experience<span /></div>}>
          {mode === 'immersive' ? <EventRollercoaster events={events} onPublished={onPublished} /> : <EventCarousel events={events} />}
        </Suspense>}
      </motion.div>
    </AnimatePresence>
  </section>;
}
