import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react';
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUp, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import type { ClubEvent } from '../types';
import { eventTheme } from '../lib/event-artwork';
import { createExperienceStations } from '../lib/experience-stations';
import EventArtwork from '../components/events/EventArtwork';
import Modal from '../components/shared/Modal';
import './event-carousel.css';

// The reference settles in ~0.5s with a small amount of lag between layers.
const ART_SPRING = { stiffness: 115, damping: 25, mass: 1.05 };
const PANEL_SPRING = { stiffness: 180, damping: 30, mass: .8 };
const BACKGROUND_SPRING = { stiffness: 85, damping: 28, mass: 1.1 };
type BrowseEvent = ClubEvent & { placeholder?: boolean };

function titleLines(title: string) {
  const words = title.trim().split(/\s+/), lines: string[] = [];
  const lineLength = Math.max(13, Math.ceil(title.length / 3));
  for (const word of words) {
    const last = lines.length - 1;
    if (last >= 0 && (`${lines[last]} ${word}`.length <= lineLength || lines.length === 3)) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

function dateLabel(event: ClubEvent) {
  const date = new Date(event.startsAt);
  return Number.isNaN(date.getTime()) ? 'Date to be announced' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

function EventCard({ event, index, active, container, onOpen }: {
  event: BrowseEvent; index: number; active: boolean; container: RefObject<HTMLDivElement | null>; onOpen: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { root: container, amount: .55 });
  const { scrollYProgress } = useScroll({ container, target: ref, offset: ['start end', 'end start'] });
  const imageY = useSpring(useTransform(scrollYProgress, [0, .5, 1], [150, 0, -150]), ART_SPRING);
  const imageScale = useSpring(useTransform(scrollYProgress, [0, .25, .5, .75, 1], [.66, .8, 1.08, .8, .66]), ART_SPRING);
  const imageRotate = useSpring(useTransform(scrollYProgress, [0, .5, 1], [9, -5, -12]), ART_SPRING);
  const panelScale = useSpring(useTransform(scrollYProgress, [0, .5, 1], [.78, 1, .78]), PANEL_SPRING);
  const backdropY = useSpring(useTransform(scrollYProgress, [0, 1], [95, -95]), BACKGROUND_SPRING);
  const ghostY = useSpring(useTransform(scrollYProgress, [0, 1], [65, -65]), BACKGROUND_SPRING);
  const theme = eventTheme(event.category);
  const lines = titleLines(event.title);
  const longestLine = Math.max(...lines.map(line => line.length), 1);
  const [imageFailed, setImageFailed] = useState(false);
  const photo = event.photos?.[0];
  useEffect(() => { setImageFailed(false); }, [photo?.url]);
  const hasPhoto = photo && !imageFailed;
  const past = new Date(event.endsAt || event.startsAt).getTime() < Date.now();

  return <article ref={ref} className="ec-card" data-event-card={event.id} data-active={active} data-placeholder={event.placeholder || undefined} inert={!active}
    aria-label={event.title} aria-roledescription="slide"
    style={{ '--event-accent': theme.accent, '--event-panel': theme.panel } as CSSProperties}>
    <motion.div className="ec-backdrop" style={{ y: reduced ? 0 : backdropY }} aria-hidden="true">
      {hasPhoto && <img src={photo.url} alt="" loading="lazy" />}
      <span className="ec-backdrop__line" />
    </motion.div>
    <motion.span className="ec-ghost-type" style={{ y: reduced ? 0 : ghostY }} aria-hidden="true">{String(index + 1).padStart(2, '0')}</motion.span>
    <div className="ec-copy">
      <motion.p className="ec-category" initial={false} animate={{ opacity: inView || reduced ? 1 : 0, y: inView || reduced ? 0 : 14 }} transition={{ duration: reduced ? 0 : .35 }}>
        <span />{event.category || 'Nucleus event'}<i />{event.placeholder ? 'Details coming soon' : past ? 'From the archive' : 'Coming up'}
      </motion.p>
      <h2 className="ec-title" aria-label={event.title} style={{ '--title-size': `${Math.min(8.6, 85 / longestLine)}vw`, '--title-mobile-size': `${Math.min(12.8, 128 / longestLine)}vw` } as CSSProperties}>
        {lines.map((line, lineIndex) => <span className="ec-title__mask" key={lineIndex} aria-hidden="true">
          <motion.span initial={{ y: '110%' }} animate={{ y: inView || reduced ? '0%' : '110%' }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 135, damping: 27, mass: .9, delay: lineIndex * .065 }}>{line}</motion.span>
        </span>)}
      </h2>
      <motion.div className="ec-copy__details" initial={false} animate={{ opacity: inView || reduced ? 1 : 0, y: inView || reduced ? 0 : 22 }}
        transition={{ duration: reduced ? 0 : .5, delay: reduced ? 0 : .14, ease: [.22, 1, .36, 1] }}>
        <p className="ec-description">{event.description}</p>
        {!event.placeholder && <>
          <div className="ec-meta"><span><CalendarDays size={14} />{dateLabel(event)}</span><span><MapPin size={14} />{event.location || 'Location to be announced'}</span></div>
          <button className="ec-open" onClick={onOpen} aria-label={`Explore ${event.title}`}><span>Explore event</span><ArrowUpRight size={20} /></button>
        </>}
      </motion.div>
    </div>
    <div className="ec-scene" aria-hidden="true">
      <motion.div className="ec-slab" style={{ scale: reduced ? 1 : panelScale }}><span>NUCLEUS / {String(index + 1).padStart(2, '0')}</span><i /></motion.div>
      <motion.div className={`ec-foreground${hasPhoto ? ' ec-foreground--photo' : ''}`} data-event-art
        style={{ y: reduced ? 0 : imageY, scale: reduced ? 1 : imageScale, rotate: reduced ? -5 : imageRotate }}>
        {hasPhoto ? <>
          {event.photos?.[1] && <img className="ec-photo-support" src={event.photos[1].url} alt="" loading="lazy" />}
          <img className="ec-photo-main" src={photo.url} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" onError={() => setImageFailed(true)} />
        </> : <EventArtwork variant={theme.variant} />}
      </motion.div>
      <span className="ec-art-caption">A connection worth making.</span>
    </div>
    <span className="ec-card__edge" aria-hidden="true">Nucleus / SJEC / Made of many minds</span>
  </article>;
}

function CarouselScene({ events }: { events: BrowseEvent[] }) {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [selected, setSelected] = useState<ClubEvent | null>(null);
  const { scrollY, scrollYProgress } = useScroll({ container });
  const progress = useSpring(scrollYProgress, BACKGROUND_SPRING);
  const themes = useMemo(() => events.map(event => eventTheme(event.category)), [events]);
  const stops = themes.length > 1 ? themes.map((_, index) => index / (themes.length - 1)) : [0, 1];
  const colors = themes.length > 1 ? themes.map(theme => theme.background) : [themes[0].background, themes[0].background];
  const background = useTransform(progress, stops, colors);
  const current = Math.min(active, events.length - 1);

  useMotionValueEvent(scrollY, 'change', y => {
    const height = container.current?.clientHeight || 1;
    const next = Math.max(0, Math.min(events.length - 1, Math.round(y / height)));
    activeRef.current = next;
    setActive(previous => previous === next ? previous : next);
  });

  useEffect(() => {
    const element = container.current!;
    element.focus({ preventScroll: true });
    const resize = new ResizeObserver(() => {
      const index = Math.min(activeRef.current, events.length - 1);
      element.scrollTo({ top: index * element.clientHeight, behavior: 'instant' });
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, [events.length]);

  function go(index: number) {
    container.current?.scrollTo({ top: Math.max(0, Math.min(events.length - 1, index)) * container.current.clientHeight, behavior: reduced ? 'instant' : 'smooth' });
  }
  function keyNavigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    const targets: Record<string, number> = { ArrowDown: current + 1, PageDown: current + 1, ArrowUp: current - 1, PageUp: current - 1, Home: 0, End: events.length - 1 };
    if (event.key in targets) { event.preventDefault(); go(targets[event.key]); }
  }

  return <motion.div className="event-carousel" data-active-event={events[current].id} data-reduced-motion={Boolean(reduced)}
    style={{ backgroundColor: reduced ? themes[current].background : background }}>
    <h1 className="sr-only">Nucleus events — Quick Browse</h1>
    <p id="event-carousel-help" className="sr-only">Scroll to explore events. Use the up and down arrow keys, Page Up, Page Down, Home, or End when the carousel is focused. Open available event details with the Explore event button.</p>
    <div ref={container} className="ec-scroll" tabIndex={0} role="region" aria-label="Event carousel" aria-roledescription="carousel" aria-describedby="event-carousel-help" data-lenis-prevent onKeyDown={keyNavigate}>
      {events.map((event, index) => <EventCard key={event.id} event={event} index={index} active={index === current} container={container} onOpen={() => setSelected(event)} />)}
    </div>
    <div className="ec-edition" aria-hidden="true"><span>The event collection</span><span>N / {new Date().getFullYear()}</span></div>
    <div className="ec-rail" aria-hidden="true"><motion.span style={{ scaleY: reduced ? (events.length > 1 ? current / (events.length - 1) : 1) : progress }} /></div>
    <footer className="ec-navigation">
      <div className="ec-counter"><span>{String(current + 1).padStart(2, '0')}</span><i /><span>{String(events.length).padStart(2, '0')}</span></div>
      <span className="ec-scroll-hint"><ArrowDown size={13} />Scroll to explore</span>
      <div className="ec-nav-buttons"><button onClick={() => go(current - 1)} disabled={current === 0} aria-label="Previous event"><ArrowUp size={19} /></button><button onClick={() => go(current + 1)} disabled={current === events.length - 1} aria-label="Next event"><ArrowDown size={19} /></button></div>
    </footer>
    <span className="sr-only" role="status" aria-live="polite">Event {current + 1} of {events.length}: {events[current].title}</span>
    {selected && <Modal title={selected.title} onClose={() => setSelected(null)}>
      <div className="ec-event-details"><span className="ec-category">{selected.category}</span><p>{selected.description}</p>
        <div className="ec-meta"><span><CalendarDays size={16} />{dateLabel(selected)}</span><span><MapPin size={16} />{selected.location || 'Location to be announced'}</span></div>
        {!!selected.photos?.length && <div className="ec-gallery">{selected.photos.map(photo => <a href={photo.url} key={photo.id} target="_blank" rel="noreferrer"><img src={photo.url} alt={photo.name || selected.title} loading="lazy" /></a>)}</div>}
        {selected.registrationUrl && /^https?:\/\//i.test(selected.registrationUrl) && <a className="ec-open" href={selected.registrationUrl} target="_blank" rel="noreferrer">Register for event<ArrowUpRight size={18} /></a>}
        {selected.albumUrl && /^https?:\/\//i.test(selected.albumUrl) && <a className="ec-open" href={selected.albumUrl} target="_blank" rel="noreferrer">View photo album<ArrowUpRight size={18} /></a>}
      </div>
    </Modal>}
  </motion.div>;
}

export default function EventCarousel({ events }: { events: ClubEvent[] }) {
  const collection = useMemo<BrowseEvent[]>(() => {
    if (!events.some(event => event.published)) return [];
    return createExperienceStations(events).map(station => station.event ?? {
      id: station.id, title: `Event ${station.number}`, placeholder: true,
      description: 'Details and highlights from this club event will be added soon.',
      startsAt: '', endsAt: '', location: '', category: 'Nucleus event', registrationUrl: '', published: false,
    });
  }, [events]);
  if (!collection.length) return <div className="ec-empty"><span className="events-eyebrow">Nucleus / What's next</span><EventArtwork variant={0} /><h1>The next connection<br /><em>is taking shape.</em></h1><p>New events will appear here. Come back soon.</p></div>;
  return <CarouselScene events={collection} />;
}
