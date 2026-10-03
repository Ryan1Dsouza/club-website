import { useEffect, useId, useMemo, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, MapPin, X } from 'lucide-react';
import type { ClubEvent, EventPhoto } from '../../types';
import { bookSpreads } from '../../events/photo-order';
import { BOOK_SCROLL_STEP, useBookScroll } from '../../events/use-book-scroll';
import { WORKSHOP_STATIONS, workshopStory } from '../../events/stations';
import { eventDate } from './EventFlipCard';
import EventArtwork from './EventArtwork';
import './station-book.css';

type Props = { workshopFolder: string; imageList: EventPhoto[]; event?: ClubEvent | null; title?: string; stationNumber?: string; onClose: () => void; continueLabel?: string; galleryOnly?: boolean };

export default function Book({ workshopFolder, imageList, event, title, stationNumber = '01', onClose, continueLabel = 'Back to Events', galleryOnly = false }: Props) {
  const name = title ?? WORKSHOP_STATIONS.find(item => item.id === workshopFolder)?.title ?? workshopFolder;
  const spreads = useMemo(() => bookSpreads(imageList), [imageList]);
  const count = spreads.length;
  const dialog = useRef<HTMLDialogElement>(null), closed = useRef(false);
  const instructions = useId();
  const wrapper = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const storyTouch = useRef(0);
  // The final scroll step folds the cover shut and dismisses the modal.
  const { cursor, reduced, turn } = useBookScroll(wrapper, content, count + 1);
  const page = Math.min(count - 1, Math.floor(cursor + .00001));
  const progress = Math.min(1, Math.max(0, cursor - page)), turning = progress > .005 && progress < .995;
  const closing = page === count - 1 && turning;

  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal(); element.querySelector<HTMLElement>('.station-book__surface')?.focus({ preventScroll:true });
    return () => { element.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll:true }); };
  }, []);
  useEffect(() => {
    if (cursor >= count - .001 && !closed.current) { closed.current = true; onClose(); }
  }, [cursor, count, onClose]);

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
      <span className="station-book__eyebrow">{event?.category || 'Workshop'} / Issue {stationNumber}</span>
      <div className="station-book__title" aria-hidden="true">{name}</div>
      <div className="station-book__copy">
        <p>{event?.description || workshopStory(name)}</p>
        <div className="station-book__details">
          <span><CalendarDays size={14} />{eventDate(event?.startsAt)}</span>
          {event?.location && <span><MapPin size={14} />{event.location}</span>}
        </div>
        <p className="station-book__highlights"><b>Key highlights</b><br />Ideas shared. Skills explored. Connections made.</p>
      </div>
      <span className="station-book__byline">Made of many minds. / SJEC</span>
    </section>;
    if (spread === 0 && side === 1) return <figure className={`station-book__cover-art${photo ? '' : ' nx-event-artwork'}`}>
      {photo ? <img src={photo.url} alt={duplicate ? '' : `${name} — opening photograph`} decoding="async" /> : <EventArtwork variant={Number(stationNumber) % 3} />}
    </figure>;
    return photo ? <figure className="station-book__panel">
      {duplicate ? <img src={photo.url} alt="" decoding="async" /> : <a href={photo.url} target="_blank" rel="noreferrer" aria-label={`Open ${name} photograph ${spread * 2 + side}`}>
        <img src={photo.url} alt={`${name} — photograph ${spread * 2 + side}`} decoding="async" />
      </a>}
    </figure> : <div className="station-book__blank" aria-hidden="true" />;
  };
  const links = [{ url: event?.albumUrl, label: 'View photo album' }, { url: event?.registrationUrl, label: 'Register for event' }]
    .filter(link => link.url && /^https?:\/\//i.test(link.url));

  // Hinged strips form one continuous leaf: its bend peaks midway through a turn.
  const leafStrip = (index: number): React.ReactNode => <div className="station-book__strip" key={index} style={{ '--strip': index, '--reverse-strip': 7 - index } as CSSProperties}>
    <div className="station-book__leaf-face station-book__leaf-front"><div className="station-book__slice">{renderPage(page, 1, true)}</div></div>
    <div className="station-book__leaf-face station-book__leaf-back"><div className="station-book__slice">{closing ? <div className="station-book__end-cover" /> : renderPage(page + 1, 0, true)}</div></div>
    {index < 7 && leafStrip(index + 1)}
  </div>;

  return createPortal(<dialog ref={dialog} className="nx-dialog nx-book-dialog" aria-label={name} data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }}>
    <button className="nx-close" aria-label="Close event" onClick={onClose}><X size={18} /></button>
    <div className="station-book" data-workshop={workshopFolder} data-station-number={stationNumber} data-book-page={page + 1} data-book-turning={turning} data-book-closing={closing}
    data-book-progress={cursor.toFixed(3)} data-scroll-engine="lenis" onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const story = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-book-scroll]') : null;
      if (story && ((event.key === 'ArrowDown' && story.scrollTop + story.clientHeight < story.scrollHeight - 1) || (event.key === 'ArrowUp' && story.scrollTop > 1))) return;
      const delta = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (delta) { event.preventDefault(); event.stopPropagation(); turn(delta); }
    }}>
    <header className="station-book__masthead"><span>NUCLEUS <b>FIELD NOTES</b></span><span>STATION / {stationNumber}</span></header>
    <h2 className="sr-only">{name}</h2>
    <div className="station-book__scroller" ref={wrapper}>
      <div className="station-book__scroll-track" ref={content} style={{ height: `calc(var(--book-height, 500px) + ${count * BOOK_SCROLL_STEP}px)` }}>
        <div className="station-book__surface" tabIndex={0} role="region" aria-label={`${name} event book`} aria-describedby={instructions}
          style={{ '--book-turn': `${reduced ? 0 : -180 * progress}deg`, '--book-bend': `${Math.sin(progress * Math.PI) * -3}deg`, '--book-close': closing && !reduced ? progress : 0 } as CSSProperties}>
          <div className={`station-book__spread ${page === 0 ? 'station-book__cover' : 'station-book__photos'}`}>
            <div className="station-book__page station-book__page--left">{renderPage(page, 0)}</div>
            <div className="station-book__page station-book__page--right">{closing && !reduced ? <div className="station-book__end-cover" /> : renderPage(turning && !reduced ? page + 1 : page, 1)}</div>
          </div>
          {!reduced && <div className="station-book__leaf" aria-hidden="true" style={{ opacity: turning ? 1 : 0 }}>
            {leafStrip(0)}
          </div>}
        </div>
      </div>
    </div>
    <footer className="station-book__footer">
      <div className="station-book__navigation">
        <button type="button" onClick={() => turn(-1)} disabled={cursor <= .0001} aria-label="Previous book page"><ArrowLeft size={18} /></button>
        <span role="status" aria-live="polite">Page {page + 1} / {count}</span>
        <button type="button" onClick={() => turn(1)} aria-label={page === count - 1 ? 'Close book after last page' : 'Next book page'}><ArrowRight size={18} /></button>
        <p id={instructions}><ArrowDown size={13} />{page === count - 1 ? 'Scroll to close this chapter' : 'Scroll or swipe to turn · arrow keys work too'}</p>
      </div>
      <div className="station-book__actions">
        <div className="station-book__links">{links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowRight size={12} /></a>)}</div>
        <button className="nx-continue" onClick={onClose}>{continueLabel}<ArrowRight size={16} /></button>
      </div>
      {galleryOnly && <p className="station-book__capacity">This event is available in the book; the track is at capacity.</p>}
    </footer>
  </div></dialog>, document.body);
}
