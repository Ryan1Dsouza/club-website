import type { ClubEvent, EventPhoto } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import EventArtwork from './EventArtwork';
import { eventImageAttributes, preloadEventPhotos } from '../../events/event-images';
import { restoreOriginalImage } from '../../lib/responsive-images';

export function eventDate(date?: string) {
  return date && Number.isFinite(Date.parse(date))
    ? new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' })
    : 'Date to be added';
}

export default function EventFlipCard({ event, photo, workshopFolder, number = '01', onClick }: {
  event: ClubEvent; photo?: EventPhoto; workshopFolder: string; number?: string; onClick: () => void;
}) {
  const cover = photo ?? event.photos?.[0];
  const hasDate = Boolean(event.startsAt && Number.isFinite(Date.parse(event.startsAt)));
  // Speculative downloads should yield to the visible cover; the book promotes
  // its current photographs when opened, without changing any image sources.
  const prepare = () => preloadEventPhotos(event.photos?.slice(0, 2) ?? [], matchMedia('(max-width: 620px)').matches ? 'mobile' : 'spread', 0);
  return (
    <button type="button" className="event-card" data-sound="none" data-workshop={workshopFolder} onPointerEnter={prepare} onFocus={prepare} onTouchStart={prepare} onClick={onClick} aria-label={`Open ${event.title} event book`}>
      <span className="event-card__image-container">
        {cover ? <img className="event-card__photo" {...eventImageAttributes(cover, 'card')} src={cover.url} alt="" loading={Number(number) === 1 ? 'eager' : 'lazy'} fetchPriority={Number(number) === 1 ? 'high' : 'auto'} decoding="async" onError={event => { restoreOriginalImage(event.currentTarget); }} /> : <EventArtwork variant={Number(number) % 3} />}
        <span className="event-card__issue">FIELD NOTES / {number}</span>
        <span className="event-card__view">Open the story <ArrowUpRight size={15} /></span>
      </span>
      <span className="event-card__text-content">
        <span className="event-card__category">{event.category || 'Workshop'}<span>{String(event.photos?.length ?? 0).padStart(2, '0')} photographs</span></span>
        <span className="event-card__title">{event.title}<ArrowUpRight size={23} /></span>
        <span className="event-card__footer">
          <span className="event-card__meta">{hasDate ? eventDate(event.startsAt) : 'From the Nucleus archive'}</span>
          <span className="event-card__index">{number}</span>
        </span>
      </span>
    </button>
  );
}
