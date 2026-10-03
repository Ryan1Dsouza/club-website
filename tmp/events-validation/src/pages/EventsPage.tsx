import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Orbit, X } from 'lucide-react';
import type { ClubEvent } from '../types';
import { createEventStations } from '../lib/event-stations';
import { populateWorkshopStation } from '../events/workshop-content';
import EventFlipCard from '../components/events/EventFlipCard';
import Book from '../components/events/Book';
import './events-page.css';

const loadRide = () => import('./EventRollercoaster');
const EventRollercoaster = lazy(loadRide);

export default function EventsPage({ events, onPublished }: { events: ClubEvent[]; onPublished: (event: ClubEvent) => void }) {
  const [mode, setMode] = useState<'grid' | 'immersive'>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [portal, setPortal] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const portalButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPortal = useRef(0);
  const stations = useMemo(() => createEventStations(events).map(populateWorkshopStation), [events]);
  const station = stations.find(item => item.id === selected);

  useEffect(() => {
    if (portal === null) return;
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, [portal]);

  const enterRide = () => {
    const bounds = portalButtons.current[portal!]?.getBoundingClientRect();
    if (bounds) setOrigin({ x: (bounds.left + bounds.width / 2) / window.innerWidth * 100, y: Math.max(10, Math.min(90, (bounds.top + bounds.height / 2) / window.innerHeight * 100)) });
    lastPortal.current = portal!;
    void loadRide();
    setPortal(null); setFlying(true);
  };
  const returnToEvents = () => {
    setMode('grid');
    requestAnimationFrame(() => portalButtons.current[lastPortal.current]?.focus({ preventScroll: false }));
  };

  return <section className={`events-page events-page--${mode}`} data-event-mode={mode} aria-label="Nucleus events">
    {mode === 'grid' ? <div className={`events-archive${flying ? ' events-archive--departing' : ''}`} inert={flying}>
      <header className="events-heading">
        <p className="events-eyebrow"><span />Nucleus / The archive</p>
        <div><h1>Events<span>.</span></h1><p>Small sparks. Lasting connections.<br />Open a chapter of our journey.</p></div>
        <div className="events-heading__rule"><span>FIELD NOTES / SJEC</span><span>{String(stations.length).padStart(2, '0')} CHAPTERS & COUNTING</span></div>
      </header>
      <div className="events-grid" style={{ '--grid-rows': Math.ceil(stations.length / 3), '--mobile-rows': stations.length } as CSSProperties}>
        {stations.map((item, index) => <article className="events-grid__item" key={item.id} style={{ '--desktop-col': index % 3 * 2 + 1, '--desktop-row': Math.floor(index / 3) + 1, '--tablet-col': index % 2 * 2 + 1, '--tablet-row': Math.floor(index / 2) + 1 } as CSSProperties}>
          <span className="events-grid__station">STATION {item.number}<ArrowUpRight size={12} /></span>
          <EventFlipCard event={item.event!} photo={item.event?.photos?.[0]} workshopFolder={item.workshop ?? item.id} onClick={() => setSelected(item.id)} />
        </article>)}
        {[0, 1].map(index => <div key={index} className={`events-portal-lane events-portal-lane--${index === 0 ? 'left' : 'right'}`}>
          <button ref={element => { portalButtons.current[index] = element; }} type="button" className="events-portal" onClick={() => setPortal(index)} aria-haspopup="dialog">
            <span className="events-portal__signal" /><span>Ride Immersive Experience</span><ArrowUpRight size={16} />
          </button>
        </div>)}
      </div>
      <footer className="events-footer"><span>Hover to discover. Click to relive.</span><span>Made of many minds.</span></footer>
    </div> : <>
      <button className="events-return" onClick={returnToEvents}><ArrowLeft size={15} />Back to Events</button>
      <Suspense fallback={<div className="events-opening" role="status">Opening the Nucleus Ride<span /></div>}><EventRollercoaster events={events} onPublished={onPublished} /></Suspense>
    </>}
    {station && <Book key={station.id} workshopFolder={station.workshop ?? station.id} imageList={station.event?.photos ?? []} event={station.event} title={station.name} stationNumber={station.number} onClose={() => setSelected(null)} />}
    {portal !== null && <dialog ref={dialog} className="events-portal-dialog" aria-labelledby="portal-title" onCancel={event => { event.preventDefault(); setPortal(null); }}>
      <button className="events-portal-dialog__close" aria-label="Close ride invitation" onClick={() => setPortal(null)}><X size={18} /></button>
      <Orbit size={38} aria-hidden="true" /><p className="events-eyebrow">A different perspective</p>
      <h2 id="portal-title">Do you want to hop into the Nucleus Ride?</h2>
      <p>Seven stations. One journey through Nucleus.</p>
      <div className="events-portal-dialog__actions"><button onClick={enterRide}>Yes, Let's Go<ArrowUpRight size={16} /></button><button onClick={() => setPortal(null)}>Maybe Later</button></div>
    </dialog>}
    {flying && <motion.div className="events-flight" role="status" aria-label="Entering the Nucleus Ride" style={{ '--portal-x': `${origin.x}%`, '--portal-y': `${origin.y}%` } as CSSProperties}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .9 }}
      onAnimationComplete={() => { setMode('immersive'); setFlying(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}>
      <div className="events-flight__tunnel">{[0, 1, 2, 3, 4].map(index => <i key={index} style={{ '--ring': index } as CSSProperties} />)}</div>
    </motion.div>}
  </section>;
}
