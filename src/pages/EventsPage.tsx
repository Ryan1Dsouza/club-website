import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Orbit, X } from 'lucide-react';
import type { ClubEvent } from '../types';
import { createEventStations } from '../lib/event-stations';
import { populateWorkshopStation } from '../events/workshop-content';
import EventFlipCard from '../components/events/EventFlipCard';
import Book from '../components/events/Book';
import { useCinematicScroll } from '../lib/use-cinematic-scroll';
import './events-page.css';

const loadRide = () => import('./EventRollercoaster');
const EventRollercoaster = lazy(loadRide);

export default function EventsPage({ events, onPublished }: { events: ClubEvent[]; onPublished: (event: ClubEvent) => void }) {
  const [mode, setMode] = useState<'grid' | 'immersive'>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [portal, setPortal] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);
  const [rideReady, setRideReady] = useState(false);
  const [flightElapsed, setFlightElapsed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const portalButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPortal = useRef(0);
  const stations = useMemo(() => createEventStations(events).map(populateWorkshopStation), [events]);
  const station = stations.find(item => item.id === selected);

  useCinematicScroll(mode === 'grid');

  useEffect(() => {
    if (!flying) return;
    const timer = window.setTimeout(() => setFlightElapsed(true), reduced ? 80 : 1150);
    return () => clearTimeout(timer);
  }, [flying, reduced]);
  useEffect(() => {
    if (!flying || !rideReady || !flightElapsed) return;
    const timer = window.setTimeout(() => setFlying(false), reduced ? 0 : 420);
    return () => clearTimeout(timer);
  }, [flying, rideReady, flightElapsed, reduced]);

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
    setPortal(null); setRideReady(false); setFlightElapsed(false); setFlying(true); setMode('immersive');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const returnToEvents = () => {
    setMode('grid');
    requestAnimationFrame(() => portalButtons.current[lastPortal.current]?.focus({ preventScroll: false }));
  };

  return <section className={`events-page events-page--${mode}`} data-event-mode={mode} aria-label="Nucleus events">
    {mode === 'grid' ? <div className={`events-archive${flying ? ' events-archive--departing' : ''}`} inert={flying}>
      <header className="events-heading">
        <p className="events-eyebrow">THE NUCLEUS ARCHIVE / {String(stations.length).padStart(2, '0')} CHAPTERS</p>
        <h1>Events<span>.</span></h1>
        <p className="events-heading__intro">Good ideas bring us together. These are the moments that stay.</p>
      </header>
      <div className="events-grid">
        {stations.map((item) => (
          <article key={item.id} className="events-grid__item" style={{ '--card-index': item.index } as CSSProperties}>
            <EventFlipCard event={item.event!} photo={item.event?.photos?.[0]} number={item.number} workshopFolder={item.workshop ?? item.id} onClick={() => setSelected(item.id)} />
          </article>
        ))}
        
        <div className="events-portal-lane events-portal-lane--left">
          <button ref={element => { portalButtons.current[0] = element; }} type="button" className="events-portal" onClick={() => setPortal(0)} aria-haspopup="dialog" aria-label="The Nucleus Ride">
            <span className="events-portal__signal" /><span className="events-portal__label"><span className="events-portal__type">The Nucleus Ride</span><span className="events-portal__sub">Step inside the story</span></span><ArrowUpRight size={18} />
          </button>
        </div>
        <div className="events-portal-lane events-portal-lane--right">
          <button ref={element => { portalButtons.current[1] = element; }} type="button" className="events-portal" onClick={() => setPortal(1)} aria-haspopup="dialog" aria-label="The Nucleus Ride">
            <span className="events-portal__signal" /><span className="events-portal__label"><span className="events-portal__type">The Nucleus Ride</span><span className="events-portal__sub">Seven stops. All connected.</span></span><ArrowUpRight size={18} />
          </button>
        </div>
      </div>
      <footer className="events-footer"><span>Open a story. Relive a moment.</span><span>Made of many minds.</span></footer>
    </div> : <>
      <button className="events-return" onClick={returnToEvents}><ArrowLeft size={15} />Back to Events</button>
      <Suspense fallback={<div className="events-opening" role="status">Opening the Nucleus Ride<span /></div>}><EventRollercoaster events={events} onPublished={onPublished} onReady={() => setRideReady(true)} /></Suspense>
    </>}
    {station && <Book key={station.id} workshopFolder={station.workshop ?? station.id} imageList={station.event?.photos ?? []} event={station.event} title={station.name} stationNumber={station.number} onClose={() => setSelected(null)} />}
    {portal !== null && <dialog ref={dialog} className="events-portal-dialog" aria-labelledby="portal-title" onCancel={event => { event.preventDefault(); setPortal(null); }}>
      <button className="events-portal-dialog__close" aria-label="Close ride invitation" onClick={() => setPortal(null)}><X size={18} /></button>
      <Orbit size={38} aria-hidden="true" /><p className="events-eyebrow">A different perspective</p>
      <h2 id="portal-title">Do you want to hop into the Nucleus Ride?</h2>
      <p>Seven stations. One journey through Nucleus.</p>
      <div className="events-portal-dialog__actions"><button onClick={enterRide}>Yes, Let's Go<ArrowUpRight size={16} /></button><button onClick={() => setPortal(null)}>Maybe Later</button></div>
    </dialog>}
    {flying && <div className={`events-flight${rideReady && flightElapsed ? ' events-flight--ready' : ''}`} role="status" aria-label="Entering the Nucleus Ride" style={{ '--portal-x': `${origin.x}%`, '--portal-y': `${origin.y}%` } as CSSProperties}>
      <div className="events-flight__flash" />
      <div className="events-flight__tunnel" aria-hidden="true">{[0, 1, 2, 3, 4].map(index => <i key={index} style={{ '--ring': index } as CSSProperties} />)}</div>
      <div className="events-flight__caption"><span>CONNECTION ESTABLISHED</span><strong>The Nucleus Ride</strong><small>{rideReady ? 'You’re in. Enjoy the ride.' : 'Finding our way into Nucleus…'}</small><i /></div>
    </div>}
  </section>;
}
