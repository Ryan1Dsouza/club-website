import type { ClubEvent, EventPhoto } from '../../types';

export function eventDate(date?: string) {
  return date && Number.isFinite(Date.parse(date))
    ? new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' })
    : 'Date to be added';
}

export default function EventFlipCard({ event, photo, workshopFolder, onClick }: {
  event: ClubEvent; photo?: EventPhoto; workshopFolder: string; onClick: () => void;
}) {
  const cover = photo ?? event.photos?.[0];
  const hasDate = Boolean(event.startsAt && Number.isFinite(Date.parse(event.startsAt)));
  return (
    <button type="button" className="event-card" data-workshop={workshopFolder} onClick={onClick} aria-label={`Open ${event.title} event book`}>
      <span className="event-card__image-container">
        {cover && <img className="event-card__photo" src={cover.url} alt="" loading="lazy" decoding="async" />}
      </span>
      <span className="event-card__text-content">
        <span className="event-card__title">{event.title}</span>
        <span className="event-card__desc">Hover to discover the complete gallery and details for {event.title}. Click to relive the experience.</span>
        <span className="event-card__footer">
          <span className="event-card__meta">{hasDate ? eventDate(event.startsAt) : 'TBA'}</span>
          <span className="event-card__meta">{event.category || 'Workshop'}</span>
        </span>
      </span>
    </button>
  );
}
