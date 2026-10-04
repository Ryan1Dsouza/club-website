import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
  const [isMobile, setIsMobile] = useState(() => matchMedia('(max-width: 620px)').matches);
  useEffect(() => {
    const media = matchMedia('(max-width: 620px)');
    const listener = () => setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  const spreads = useMemo(() => bookSpreads(imageList), [imageList]);
  const count = isMobile ? Math.max(1, imageList.length) : spreads.length;
  const dialog = useRef<HTMLDialogElement>(null), closed = useRef(false);
  const instructions = useId();
  const wrapper = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const { cursor, reduced, turn } = useBookScroll(wrapper, content, count + 1);
  const page = Math.min(count - 1, Math.floor(cursor + .00001));
  const progress = Math.min(1, Math.max(0, cursor - page));
  const turning = progress > .0001 && progress < .9999;
  const closing = page === count - 1 && turning;
  const showNext = turning && !reduced;

  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal(); element.querySelector<HTMLElement>('.station-book__surface')?.focus({ preventScroll:true });
    return () => { element.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll:true }); };
  }, []);
  useEffect(() => {
    if (cursor >= count - .0001 && !closed.current) { closed.current = true; onClose(); }
  }, [cursor, count, onClose]);
  useEffect(() => {
    const photos = isMobile ? imageList.slice(page, page + 3) : (spreads[page + 1] ?? []).filter(photo => photo !== null);
    photos.forEach(photo => { const image = new Image(); image.src = photo.url; void image.decode().catch(() => {}); });
  }, [page, spreads, imageList, isMobile]);

  // Reuse the same content nodes throughout a gesture. Only leaf transforms change per frame.
  const pages = useMemo(() => {
    const story = (duplicate = false) => <section className="station-book__story" data-book-scroll tabIndex={duplicate ? -1 : 0} role={duplicate ? undefined : 'region'} aria-label={duplicate ? undefined : 'Event story'}>
      <span className="station-book__eyebrow">{event?.category || 'Workshop'} / Issue {stationNumber}</span>
      <div className="station-book__title" aria-hidden="true">{name}</div>
      <div className="station-book__copy">
        <p>{event?.description || workshopStory(name)}</p>
        <div className="station-book__details"><span><CalendarDays size={14} />{eventDate(event?.startsAt)}</span>{event?.location && <span><MapPin size={14} />{event.location}</span>}</div>
        {!isMobile && <p className="station-book__highlights"><b>Key highlights</b><br />Ideas shared. Skills explored. Connections made.</p>}
      </div>
      {!isMobile && <span className="station-book__byline">Made of many minds. / SJEC</span>}
    </section>;
    const photo = (index: number, duplicate = false) => {
      const item = imageList[index];
      if (!item) return index === 0 ? <figure className="station-book__cover-art nx-event-artwork"><EventArtwork variant={Number(stationNumber) % 3} /></figure> : <div className="station-book__blank" />;
      return <figure className={index === 0 ? 'station-book__cover-art' : 'station-book__panel'}>
        {duplicate ? <img src={item.url} alt="" decoding="async" draggable={false} /> : <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${name} photograph ${index + 1}`}><img src={item.url} alt={`${name} — photograph ${index + 1}`} decoding="async" draggable={false} /></a>}
      </figure>;
    };
    const item = (index: number, duplicate = false) => index === 0 ? story(duplicate) : photo(index - 1, duplicate);
    const report = (index: number, duplicate = false) => index === 0 ? <div className="station-book__report">{story(duplicate)}{photo(0, duplicate)}</div> : photo(index, duplicate);
    const end = <div className="station-book__end-cover" />;
    const front = isMobile ? report(page, true) : item(page * 2 + 1, true);
    const back = closing ? end : isMobile ? <div className="station-book__reverse-paper" /> : item(page * 2 + 2, true);
    const strip = (index: number): ReactNode => <div className="station-book__strip" key={index} style={{ '--strip': index, '--reverse-strip': 7 - index } as CSSProperties}>
      <div className="station-book__leaf-face station-book__leaf-front"><div className="station-book__slice">{front}</div></div>
      <div className="station-book__leaf-face station-book__leaf-back"><div className="station-book__slice">{back}</div></div>
      {index < 7 && strip(index + 1)}
    </div>;
    return {
      spread: <div className={`station-book__spread ${page === 0 ? 'station-book__cover' : 'station-book__photos'}`}>
        {!isMobile && <div className="station-book__page station-book__page--left">{item(page * 2)}</div>}
        <div className="station-book__page station-book__page--right">{closing && !reduced ? end : isMobile ? report(showNext ? page + 1 : page) : item(showNext ? page * 2 + 3 : page * 2 + 1)}</div>
      </div>,
      leaf: strip(0),
    };
  }, [page, closing, reduced, showNext, isMobile, imageList, event, name, stationNumber]);
  const links = [{ url: event?.albumUrl, label: 'View photo album' }, { url: event?.registrationUrl, label: 'Register for event' }].filter(link => link.url && /^https?:\/\//i.test(link.url));

  return createPortal(<dialog ref={dialog} className="nx-dialog nx-book-dialog" aria-label={name} data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }}>
    <button className="nx-close" aria-label="Close event" onClick={onClose}><X size={18} /></button>
    <div className="station-book" data-layout={isMobile ? 'report' : 'spread'} data-workshop={workshopFolder} data-station-number={stationNumber} data-book-page={page + 1} data-book-turning={turning} data-book-closing={closing} data-book-progress={cursor.toFixed(3)} data-scroll-engine="lenis" onKeyDown={event => {
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
          <div className="station-book__surface" tabIndex={0} role="region" aria-label={`${name} event book`} aria-describedby={instructions} style={{ '--book-turn': `${reduced ? 0 : (isMobile ? 180 : -180) * progress}deg`, '--book-bend': `${Math.sin(progress * Math.PI) * (isMobile ? 1.4 : -1.4)}deg`, '--book-shade': Math.sin(progress * Math.PI) * .22, '--book-close': closing && !reduced ? progress : 0 } as CSSProperties}>
            {pages.spread}
            {!reduced && <div className="station-book__leaf" aria-hidden="true" inert style={{ visibility: turning ? 'visible' : 'hidden' }}>{pages.leaf}</div>}
          </div>
        </div>
      </div>
      <footer className="station-book__footer">
        <div className="station-book__progress" aria-hidden="true"><i style={{ transform: `scaleX(${Math.min(1, (cursor + 1) / count)})` }} /></div>
        <div className="station-book__navigation">
          <button type="button" onClick={() => turn(-1)} disabled={cursor <= .0001} aria-label="Previous book page"><ArrowLeft size={18} /></button>
          <span role="status" aria-live="polite">Page {page + 1} / {count}</span>
          <button type="button" onClick={() => turn(1)} aria-label={page === count - 1 ? 'Close book after last page' : 'Next book page'}><ArrowRight size={18} /></button>
          <p id={instructions}><ArrowDown size={13} />{page === count - 1 ? 'Scroll to close this chapter' : isMobile ? 'Pull up to turn. Pull down to return.' : 'Scroll to turn · arrow keys work too'}</p>
        </div>
        <div className="station-book__actions"><div className="station-book__links">{links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowRight size={12} /></a>)}</div><button className="nx-continue" onClick={onClose}>{continueLabel}<ArrowRight size={16} /></button></div>
        {galleryOnly && <p className="station-book__capacity">This event is available in the book; the track is at capacity.</p>}
      </footer>
    </div>
  </dialog>, document.body);
}
