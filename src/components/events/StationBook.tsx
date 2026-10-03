import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import type { Station } from '../../lib/event-navigation';
import { bookSpreads } from '../../experiences/photo-order';
import { BOOK_SCROLL_STEP, useBookScroll } from '../../experiences/use-book-scroll';
import EventArtwork from './EventArtwork';
import './station-book.css';

type Props = { station: Station; onContinue: () => void; continueLabel: string; galleryOnly: boolean };

export default function StationBook({ station, onContinue, continueLabel, galleryOnly }: Props) {
  const event = station.event, photos = event?.photos ?? [];
  const spreads = useMemo(() => bookSpreads(photos), [photos]);
  const count = spreads.length;
  const wrapper = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const storyTouch = useRef(0);
  const { cursor, reduced, turn } = useBookScroll(wrapper, content, count);
  const page = Math.min(count - 1, Math.floor(cursor + .00001));
  const progress = Math.max(0, cursor - page), turning = progress > .0001 && page < count - 1;

  // Warm only the next spread, including the back of the turning leaf.
  useEffect(() => {
    const images = (spreads[page + 1] ?? []).filter(photo => photo !== null).map(photo => {
      const image = new Image(); image.src = photo.url; return image;
    });
    return () => { images.forEach(image => { image.src = ''; }); };
  }, [page, spreads]);

  const renderPage = (spread: number, side: 0 | 1, duplicate = false) => {
    const photo = spreads[spread]?.[side];
    if (spread === 0 && side === 0) return <section className="station-book__story" data-book-scroll
      tabIndex={duplicate ? -1 : 0} aria-label={duplicate ? undefined : 'Event story'}
      onWheelCapture={event => {
        const element = event.currentTarget;
        if ((event.deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) || (event.deltaY < 0 && element.scrollTop > 1)) event.stopPropagation();
      }}
      onTouchStartCapture={event => { storyTouch.current = event.touches[0]?.clientY ?? 0; }}
      onTouchMoveCapture={event => {
        const element = event.currentTarget, next = event.touches[0]?.clientY ?? storyTouch.current, delta = storyTouch.current - next;
        storyTouch.current = next;
        if ((delta > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) || (delta < 0 && element.scrollTop > 1)) event.stopPropagation();
      }}>
      <span className="station-book__eyebrow">{event?.category || 'Nucleus'} / Issue {station.number}</span>
      <div className="station-book__title" aria-hidden="true">{station.name}</div>
      <div className="station-book__copy">
        <p>{event?.description || 'Event highlights and the story behind this photograph will be added here.'}</p>
        <div className="station-book__details">
          {event?.startsAt && <span><CalendarDays size={14} />{new Date(event.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })} IST</span>}
          {event?.location && <span><MapPin size={14} />{event.location}</span>}
        </div>
      </div>
      <span className="station-book__byline">Made of many minds. / SJEC</span>
    </section>;
    if (spread === 0 && side === 1) return <figure className={`station-book__cover-art${photo ? '' : ' nx-event-artwork'}`}>
      {photo ? <img src={photo.url} alt={duplicate ? '' : `${station.name} — opening photograph`} decoding="async" /> : <EventArtwork variant={Number(station.number) % 3} />}
    </figure>;
    return photo ? <figure className="station-book__panel">
      {duplicate ? <img src={photo.url} alt="" decoding="async" /> : <a href={photo.url} target="_blank" rel="noreferrer" aria-label={`Open ${station.name} photograph ${spread * 2 + side}`}>
        <img src={photo.url} alt={`${station.name} — photograph ${spread * 2 + side}`} decoding="async" />
      </a>}
    </figure> : <div className="station-book__blank" aria-hidden="true" />;
  };
  const links = [{ url: event?.albumUrl, label: 'View photo album' }, { url: event?.registrationUrl, label: 'Register for event' }]
    .filter(link => link.url && /^https?:\/\//i.test(link.url));

  return <div className="station-book" data-station-number={station.number} data-book-page={page + 1} data-book-turning={turning}
    data-book-progress={cursor.toFixed(3)} data-scroll-engine="lenis" onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const story = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-book-scroll]') : null;
      if (story && ((event.key === 'ArrowDown' && story.scrollTop + story.clientHeight < story.scrollHeight - 1) || (event.key === 'ArrowUp' && story.scrollTop > 1))) return;
      const delta = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (delta) { event.preventDefault(); event.stopPropagation(); turn(delta); }
    }}>
    <header className="station-book__masthead"><span>NUCLEUS <b>FIELD NOTES</b></span><span>STATION / {station.number}</span></header>
    <h2 className="nx-sr-only">{station.name}</h2>
    <div className="station-book__scroller" ref={wrapper}>
      <div className="station-book__scroll-track" ref={content} style={{ height: `calc(var(--book-height, 500px) + ${(count - 1) * BOOK_SCROLL_STEP}px)` }}>
        <div className="station-book__surface" tabIndex={0} role="region" aria-label={`${station.name} event book`} aria-describedby="station-book-instructions"
          style={{ '--book-turn': `${reduced ? 0 : -180 * progress}deg` } as CSSProperties}>
          <div className={`station-book__spread ${page === 0 ? 'station-book__cover' : 'station-book__photos'}`}>
            <div className="station-book__page station-book__page--left">{renderPage(page, 0)}</div>
            <div className="station-book__page station-book__page--right">{renderPage(turning && !reduced ? page + 1 : page, 1)}</div>
          </div>
          {turning && !reduced && <div className="station-book__leaf" aria-hidden="true">
            <div className="station-book__leaf-face station-book__leaf-front">{renderPage(page, 1, true)}</div>
            <div className="station-book__leaf-face station-book__leaf-back">{renderPage(page + 1, 0, true)}</div>
          </div>}
        </div>
      </div>
    </div>
    <footer className="station-book__footer">
      <div className="station-book__navigation">
        <button type="button" onClick={() => turn(-1)} disabled={cursor <= .0001} aria-label="Previous book page"><ArrowLeft size={18} /></button>
        <span role="status" aria-live="polite">Page {page + 1} / {count}</span>
        <button type="button" onClick={() => turn(1)} disabled={cursor >= count - 1 - .0001} aria-label="Next book page"><ArrowRight size={18} /></button>
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
