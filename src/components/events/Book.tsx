import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, MapPin, Scan, X } from 'lucide-react';
import type { ClubEvent, EventPhoto } from '../../types';
import { bookSpreads } from '../../events/photo-order';
import { eventImageAttributes, preloadEventPhotos } from '../../events/event-images';
import { sfx } from '../../lib/sound-effects';
import { restoreOriginalImage } from '../../lib/responsive-images';
import { BOOK_SCROLL_STEP, useBookScroll } from '../../events/use-book-scroll';
import { WORKSHOP_STATIONS, workshopStory } from '../../events/stations';
import { eventDate } from './EventFlipCard';
import EventArtwork from './EventArtwork';
import RailwayTrack from './RailwayTrack';
import SoundToggle from '../shared/SoundToggle';
import './station-book.css';

type Props = { workshopFolder: string; imageList: EventPhoto[]; event?: ClubEvent | null; title?: string; stationNumber?: string; onClose: () => void; continueLabel?: string; galleryOnly?: boolean };
const mobileBook = '(max-width: 620px), (max-height: 500px) and (pointer: coarse)';

export default function Book({ workshopFolder, imageList, event, title, stationNumber = '01', onClose, continueLabel = 'Back to Events', galleryOnly = false }: Props) {
  const name = title ?? WORKSHOP_STATIONS.find(item => item.id === workshopFolder)?.title ?? workshopFolder;
  const [isMobile, setIsMobile] = useState(() => matchMedia(mobileBook).matches);
  const [fitPhoto, setFitPhoto] = useState(true);
  useEffect(() => {
    const media = matchMedia(mobileBook);
    const listener = () => setIsMobile(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  const spreads = useMemo(() => bookSpreads(imageList), [imageList]);
  const count = isMobile ? imageList.length + 1 : spreads.length;
  const dialog = useRef<HTMLDialogElement>(null), closed = useRef(false), opened = useRef(false);
  const closeBook = () => { if (!closed.current) { closed.current = true; sfx.bookClose(); onClose(); } };
  const instructions = useId();
  const wrapper = useRef<HTMLDivElement>(null), content = useRef<HTMLDivElement>(null);
  const book = useRef<HTMLDivElement>(null), surface = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null), progressBar = useRef<HTMLDivElement>(null);
  const stripLayers = useRef<(HTMLDivElement | null)[]>([]), shadeLayers = useRef<(HTMLDivElement | null)[]>([]);
  const storyOffset = useRef(0);
  const strips = isMobile ? 4 : 8;
  // Open before the scroll hook measures its wrapper: closed dialogs have no
  // layout and would seed Lenis with a zero-height content range.
  useLayoutEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal(); element.querySelector<HTMLElement>('.station-book__surface')?.focus({ preventScroll:true });
    if (!opened.current) { opened.current = true; sfx.bookOpen(); }
    return () => { element.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll:true }); };
  }, []);
  function paint(value: number) {
    const index = Math.min(count - 1, Math.floor(value));
    const progress = Math.min(1, Math.max(0, value - index));
    const shade = Math.sin(progress * Math.PI);
    if (book.current) book.current.dataset.bookProgress = value.toFixed(3);
    if (leaf.current) {
      leaf.current.style.transform = `rotate${isMobile ? 'X' : 'Y'}(${(isMobile ? 180 : -180) * progress}deg)`;
      const bend = `rotate${isMobile ? 'X' : 'Y'}(${shade * (isMobile ? 2.8 : -1.4)}deg)`;
      // Transform/opacity updates stay on composited layers instead of cascading
      // inherited CSS variables through every copy of the page content.
      stripLayers.current.forEach(layer => { if (layer) layer.style.transform = bend; });
      const opacity = String(shade * .22);
      shadeLayers.current.forEach(layer => { if (layer) layer.style.opacity = opacity; });
    }
    if (surface.current) surface.current.style.opacity = String(1 - (index === count - 1 && !reduced ? progress * .7 : 0));
    progressBar.current?.style.setProperty('--rail-progress', String(Math.min(1, value / count)));
  }
  const { cursor, current, reduced, turn } = useBookScroll(wrapper, content, count + 1, isMobile, paint);
  // A boundary can mount a new leaf after the frame callback. Give it the
  // latest pose before paint, without routing every animation frame via React.
  useLayoutEffect(() => paint(current.current));
  const page = Math.min(count - 1, Math.floor(cursor));
  const progress = Math.min(1, Math.max(0, cursor - page));
  const turning = progress > .0001 && progress < .9999;
  const closing = page === count - 1 && turning;
  const showNext = turning && !reduced;

  useEffect(() => {
    if (cursor >= count - .0001 && !closed.current) { closeBook(); }
  }, [cursor, count, onClose]);
  useEffect(() => {
    // Current and upcoming images get first priority; keep a decoded window
    // behind them for reversal, using the same originals as the page.
    const first = isMobile ? Math.max(0, page - 1) : Math.max(0, page * 2 - 1);
    const ahead = isMobile ? 4 : 6;
    const photos = [...imageList.slice(first, first + ahead), ...imageList.slice(Math.max(0, first - 2), first)];
    preloadEventPhotos(photos, isMobile ? 'mobile' : 'spread', isMobile ? 1 : 2);
  }, [page, spreads, imageList, isMobile]);

  // Reuse the same content nodes throughout a gesture. Only leaf transforms change per frame.
  const pages = useMemo(() => {
    const story = (duplicate = false) => <section className="station-book__story" data-book-scroll ref={element => { if (element) element.scrollTop = storyOffset.current; }} onScroll={duplicate ? undefined : event => { storyOffset.current = event.currentTarget.scrollTop; }} tabIndex={duplicate ? -1 : 0} role={duplicate ? undefined : 'region'} aria-label={duplicate ? undefined : 'Event story'}>
      <span className="station-book__eyebrow">{event?.category || 'Workshop'} / Issue {stationNumber}</span>
      <div className="station-book__title" aria-hidden="true">{name}</div>
      <div className="station-book__copy">
        <p>{event?.description || workshopStory(name)}</p>
        <div className="station-book__details"><span><CalendarDays size={14} />{eventDate(event?.startsAt)}</span>{event?.location && <span><MapPin size={14} />{event.location}</span>}</div>
        {!isMobile && <p className="station-book__highlights"><b>Key highlights</b><br />Ideas shared. Skills explored. Connections made.</p>}
      </div>
      <span className="station-book__byline">Made of many minds. / SJEC</span>
    </section>;
    const photo = (index: number, duplicate = false) => {
      const item = imageList[index];
      if (!item) return index === 0 ? <figure className="station-book__cover-art nx-event-artwork"><EventArtwork variant={Number(stationNumber) % 3} /></figure> : <div className="station-book__blank" />;
      const image = eventImageAttributes(item, isMobile ? 'mobile' : 'spread');
      // Reuse the tiny preview when available; uploaded photos share their cached source.
      const backdrop = isMobile ? { '--book-photo-backdrop': image.style?.backgroundImage ?? `url(${JSON.stringify(item.url)})` } as CSSProperties : undefined;
      return <figure className={!isMobile && index === 0 ? 'station-book__cover-art' : 'station-book__panel'} style={backdrop}>
        {duplicate ? <img key={item.url} {...image} src={item.url} alt="" decoding="async" draggable={false} onError={event => { restoreOriginalImage(event.currentTarget); }} /> : <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${name} photograph ${index + 1}`}><img key={item.url} {...image} src={item.url} alt={`${name} — photograph ${index + 1}`} fetchPriority="high" decoding="async" draggable={false} onError={event => { restoreOriginalImage(event.currentTarget); }} /></a>}
      </figure>;
    };
    const item = (index: number, duplicate = false) => index === 0 ? story(duplicate) : photo(index - 1, duplicate);
    const end = <div className="station-book__end-cover" />;
    const front = isMobile ? item(page, true) : item(page * 2 + 1, true);
    const back = page === count - 1 ? end : isMobile ? <div className="station-book__reverse-paper" /> : item(page * 2 + 2, true);
    const strip = (index: number): ReactNode => <div className="station-book__strip" key={index} ref={element => { stripLayers.current[index] = element; }} style={{ '--strip': index, '--reverse-strip': strips - 1 - index } as CSSProperties}>
      <div className="station-book__leaf-face station-book__leaf-front"><div className="station-book__slice">{front}</div><div className="station-book__leaf-shade" ref={element => { shadeLayers.current[index * 2] = element; }} /></div>
      <div className="station-book__leaf-face station-book__leaf-back"><div className="station-book__slice">{back}</div><div className="station-book__leaf-shade" ref={element => { shadeLayers.current[index * 2 + 1] = element; }} /></div>
      {index < strips - 1 && strip(index + 1)}
    </div>;
    return {
      spread: (revealNext: boolean) => <div className={`station-book__spread ${page === 0 ? 'station-book__cover' : 'station-book__photos'}`}>
        {!isMobile && <div className="station-book__page station-book__page--left">{item(page * 2)}</div>}
        <div className="station-book__page station-book__page--right">{page === count - 1 && revealNext ? end : isMobile ? item(revealNext ? page + 1 : page) : item(revealNext ? page * 2 + 3 : page * 2 + 1)}</div>
      </div>,
      leaf: strip(0),
    };
  }, [page, count, isMobile, strips, imageList, event, name, stationNumber]);
  const links = [{ url: event?.albumUrl, label: 'View photo album' }, { url: event?.registrationUrl, label: 'Register for event' }].filter(link => link.url && /^https?:\/\//i.test(link.url));

  return createPortal(<dialog ref={dialog} className="nx-dialog nx-book-dialog" aria-label={name} data-lenis-prevent onCancel={event => { event.preventDefault(); closeBook(); }}>
    <button className="nx-close" aria-label="Close event" data-sound="none" onClick={closeBook}><X size={18} /></button>
    <SoundToggle className="station-book__sound" />
    <div className="station-book" ref={book} style={{ '--book-strips': strips } as CSSProperties} data-layout={isMobile ? 'mobile' : 'spread'} data-photo-fit={fitPhoto ? 'contain' : 'cover'} data-workshop={workshopFolder} data-station-number={stationNumber} data-book-page={page + 1} data-book-turning={turning} data-book-closing={closing} data-scroll-engine="lenis" onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const story = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-book-scroll]') : null;
      if (story && ((event.key === 'ArrowDown' && story.scrollTop + story.clientHeight < story.scrollHeight - 1) || (event.key === 'ArrowUp' && story.scrollTop > 1))) return;
      const delta = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (delta) { event.preventDefault(); event.stopPropagation(); turn(delta); }
    }}>
      <header className="station-book__masthead">
        <span>NUCLEUS <b>FIELD NOTES</b></span>
        {isMobile && page > 0 ? <button type="button" className="station-book__fit" aria-label="Fit full photo" onClick={() => setFitPhoto(value => !value)} aria-pressed={fitPhoto}>
          <Scan size={18} /><span>Fit full photo</span>
        </button> : <span>STATION / {stationNumber}</span>}
      </header>
      <h2 className="sr-only">{name}</h2>
      <div className="station-book__scroller" ref={wrapper}>
        <div className="station-book__scroll-track" ref={content} style={{ height: `calc(var(--book-height, 500px) + ${count * BOOK_SCROLL_STEP}px)` }}>
          <div className="station-book__surface" ref={surface} tabIndex={0} role="region" aria-label={`${name} event book`} aria-describedby={instructions}>
            {pages.spread(showNext)}
            {!reduced && <div className="station-book__leaf" key={`${isMobile}:${page}`} ref={leaf} aria-hidden="true" inert style={{ visibility: turning ? 'visible' : 'hidden' }}>{pages.leaf}</div>}
          </div>
        </div>
      </div>
      <footer className="station-book__footer">
        <div className="station-book__progress" ref={progressBar} aria-hidden="true"><RailwayTrack className="railway-track--horizontal" /></div>
        <div className="station-book__navigation">
          <button type="button" data-sound="none" onClick={() => turn(-1)} disabled={cursor <= .0001} aria-label="Previous book page"><ArrowLeft size={18} /></button>
          <span role="status" aria-live="polite">Page {page + 1} / {count}</span>
          <button type="button" data-sound="none" onClick={() => turn(1)} aria-label={page === count - 1 ? 'Close book after last page' : 'Next book page'}><ArrowRight size={18} /></button>
          <p id={instructions}><ArrowDown size={13} />{page === count - 1 ? 'Scroll to close this chapter' : isMobile ? 'Pull up to turn. Pull down to return.' : 'Scroll to turn · arrow keys work too'}</p>
        </div>
        <div className="station-book__actions"><div className="station-book__links">{links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowRight size={12} /></a>)}</div><button className="nx-continue" data-sound="none" onClick={closeBook}>{continueLabel}<ArrowRight size={16} /></button></div>
        {galleryOnly && <p className="station-book__capacity">This event is available in the book; the track is at capacity.</p>}
      </footer>
    </div>
  </dialog>, document.body);
}
