import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import type { Station } from '../../lib/event-navigation';
import type { EventPhoto } from '../../types';
import EventArtwork from './EventArtwork';
import './station-book.css';

type Props = { station: Station; onContinue: () => void; continueLabel: string; galleryOnly: boolean };
const caption = (photo: EventPhoto) => photo.name.replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_-]+/g, ' ');

export default function StationBook({ station, onContinue, continueLabel, galleryOnly }: Props) {
  const event = station.event, photos = event?.photos ?? [];
  const count = 1 + Math.ceil(photos.length / 2);
  const [page, setPage] = useState(0), [direction, setDirection] = useState(1);
  const surface = useRef<HTMLDivElement>(null);
  const position = useRef(0), lockedUntil = useRef(0);
  const turn = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(count - 1, position.current + delta));
    if (next === position.current) return;
    setDirection(Math.sign(delta)); position.current = next; setPage(next);
    lockedUntil.current = performance.now() + 500;
  }, [count]);

  useEffect(() => {
    const element = surface.current!;
    let total = 0, lastWheel = 0, touchY: number | null = null, touchX = 0;
    const canScrollCopy = (target: EventTarget | null, delta: number) => {
      const copy = target instanceof Element ? target.closest<HTMLElement>('[data-book-scroll]') : null;
      return !!copy && (delta > 0 ? copy.scrollTop + copy.clientHeight < copy.scrollHeight - 1 : copy.scrollTop > 1);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || canScrollCopy(event.target, event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      if (now < lockedUntil.current) { total = 0; return; }
      if (now - lastWheel > 180) total = 0;
      lastWheel = now;
      total += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      if (Math.abs(total) >= 60) { turn(Math.sign(total)); total = 0; }
    };
    const start = (event: TouchEvent) => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
      touchX = event.touches[0]?.clientX ?? 0;
    };
    const move = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return;
      const delta = touchY - event.touches[0].clientY;
      if (canScrollCopy(event.target, delta)) { touchY = event.touches[0].clientY; return; }
      if (Math.abs(delta) < 10 || Math.abs(event.touches[0].clientX - touchX) > Math.abs(delta)) return;
      event.preventDefault();
      if (Math.abs(delta) > 45 && performance.now() >= lockedUntil.current) { turn(Math.sign(delta)); touchY = null; }
    };
    const end = () => { touchY = null; };
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchmove', move, { passive: false });
    element.addEventListener('touchend', end); element.addEventListener('touchcancel', end);
    return () => {
      element.removeEventListener('wheel', wheel); element.removeEventListener('touchstart', start);
      element.removeEventListener('touchmove', move); element.removeEventListener('touchend', end); element.removeEventListener('touchcancel', end);
    };
  }, [turn]);

  // Warm only the next spread, keeping large event albums out of the initial load.
  useEffect(() => {
    const next = photos.slice(page * 2, page * 2 + 2).map(photo => { const image = new Image(); image.src = photo.url; return image; });
    return () => { next.forEach(image => { image.src = ''; }); };
  }, [page, photos]);

  const spread = photos.slice((page - 1) * 2, page * 2);
  const links = [
    { url: event?.albumUrl, label: 'View photo album' },
    { url: event?.registrationUrl, label: 'Register for event' },
  ].filter(link => link.url && /^https?:\/\//i.test(link.url));

  return <div className="station-book" data-station-number={station.number} data-book-page={page + 1} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const story = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-book-scroll]') : null;
    if (story && ((event.key === 'ArrowDown' && story.scrollTop + story.clientHeight < story.scrollHeight - 1) || (event.key === 'ArrowUp' && story.scrollTop > 1))) return;
    const delta = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
    if (delta) { event.preventDefault(); event.stopPropagation(); turn(delta); }
  }}>
    <header className="station-book__masthead"><span>NUCLEUS <b>FIELD NOTES</b></span><span>STATION / {station.number}</span></header>
    <h2 className="nx-sr-only">{station.name}</h2>
    <div className="station-book__surface" ref={surface} tabIndex={0} role="region" aria-label={`${station.name} event book`} aria-describedby="station-book-instructions">
      <div key={page} className={`station-book__spread ${page === 0 ? 'station-book__cover' : 'station-book__photos'}`} data-direction={direction}>
        {page === 0 ? <>
          <section className="station-book__story" data-book-scroll tabIndex={0} aria-label="Event story">
            <span className="station-book__eyebrow">{event?.category || 'Coming soon'} / Issue {station.number}</span>
            <div className="station-book__title" aria-hidden="true">{station.name}</div>
            <div className="station-book__copy">
              <p>{event?.description || 'A new experience is on its way. Keep exploring Nucleus.'}</p>
              <div className="station-book__details">
                {event?.startsAt && <span><CalendarDays size={14} />{new Date(event.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</span>}
                {event?.location && <span><MapPin size={14} />{event.location}</span>}
              </div>
            </div>
            <span className="station-book__byline">Made of many minds. / SJEC</span>
          </section>
          <div className={`station-book__cover-art${photos.length ? '' : ' nx-event-artwork'}`}>
            {photos.length ? <img src={photos[0].url} alt={caption(photos[0])} decoding="async" /> : <EventArtwork variant={Number(station.number) % 3} />}
            <span className="station-book__issue">No.<strong>{station.number}</strong></span>
            <span className="station-book__sticker">{photos.length ? 'The story,\nin pictures.' : 'A connection\nworth making.'}</span>
            <span className="station-book__cover-note">{photos.length ? `${photos.length} moments from this connection` : event?.albumUrl ? 'More moments in the linked album' : 'The Nucleus Club'}</span>
          </div>
        </> : spread.map((photo, index) => <figure key={photo.id} className="station-book__panel" data-single={spread.length === 1}>
          <a href={photo.url} target="_blank" rel="noreferrer" aria-label={`Open photo ${(page - 1) * 2 + index + 1}: ${photo.name}`}>
            <img src={photo.url} alt={`${station.name} — ${caption(photo)}`} decoding="async" />
          </a>
          <span className="station-book__frame">FRAME {String((page - 1) * 2 + index + 1).padStart(2, '0')}</span>
          <figcaption>{caption(photo)}</figcaption>
        </figure>)}
      </div>
    </div>
    <footer className="station-book__footer">
      <div className="station-book__navigation">
        <button type="button" onClick={() => turn(-1)} disabled={page === 0} aria-label="Previous book page"><ArrowLeft size={18} /></button>
        <span role="status" aria-live="polite">Page {page + 1} / {count}</span>
        <button type="button" onClick={() => turn(1)} disabled={page === count - 1} aria-label="Next book page"><ArrowRight size={18} /></button>
        <p id="station-book-instructions"><ArrowDown size={13} />{count > 1 ? 'Scroll or swipe to turn · arrow keys work too' : 'Every connection has a story'}</p>
      </div>
      <div className="station-book__actions">
        <div className="station-book__links">{links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowRight size={12} /></a>)}</div>
        <button className="nx-continue" onClick={onContinue}>{continueLabel}<ArrowRight size={16} /></button>
      </div>
      {galleryOnly && <p className="station-book__capacity">This event is available in the book; the track is at capacity.</p>}
    </footer>
  </div>;
}
