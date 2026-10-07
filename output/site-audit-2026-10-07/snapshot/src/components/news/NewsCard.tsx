import { useId, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Logo } from '../shared/Logo';
import type { NewsItem } from '../../lib/live-news';
import './news-card.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});

export type NewsCardProps = { item: NewsItem; priority?: boolean };

export default function NewsCard({ item, priority = false }: NewsCardProps) {
  const titleId = useId();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageAvailable = Boolean(item.image_url && failedImage !== item.image_url);
  const date = [item.date, item.created_at].filter(Boolean).map(value => new Date(value!))
    .find(value => !Number.isNaN(value.getTime()));

  return <article className="news-card" aria-labelledby={titleId}>
    <div className="news-card__image">
      {imageAvailable ? <img
        src={item.image_url!}
        alt={`Poster for ${item.title}`}
        width={800} height={600}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailedImage(item.image_url)}
      /> : <div className="news-card__placeholder" aria-hidden="true">
        <Logo />
      </div>}
    </div>
    <div className="news-card__body">
      {date && <time className="news-card__date" dateTime={date.toISOString()}>
        <CalendarDays size={13} aria-hidden="true" />{dateFormatter.format(date)}
      </time>}
      <h3 id={titleId}>{item.title}</h3>
      {item.description && <p className="news-card__description">{item.description}</p>}
    </div>
  </article>;
}
