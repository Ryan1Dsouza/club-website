import { useId, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Logo } from '../shared/Logo';
import Modal from '../shared/Modal';
import type { NewsItem } from '../../lib/live-news';
import { storageImageAttributes, restoreOriginalImage } from '../../lib/responsive-images';
import './news-card.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});

export type NewsCardProps = { item: NewsItem; priority?: boolean };

export default function NewsCard({ item, priority = false }: NewsCardProps) {
  const titleId = useId();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const imageAvailable = Boolean(item.image_url && failedImage !== item.image_url);
  const date = [item.date, item.created_at].filter(Boolean).map(value => new Date(value!))
    .find(value => !Number.isNaN(value.getTime()));

  return (
    <>
      <article className="news-card" aria-labelledby={titleId} onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}>
        <div className="news-card__image">
          {imageAvailable ? <img
            src={item.image_url!}
            {...storageImageAttributes(item.image_url ?? undefined, [480, 800, 1200], '(max-width: 700px) 100vw, 600px')}
            alt={item.title}
            width={800} height={600}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={event => { if (!restoreOriginalImage(event.currentTarget)) setFailedImage(item.image_url); }}
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
      </article>

      {open && (
        <Modal title={item.title} onClose={() => setOpen(false)}>
          <div className="news-modal-content" style={{ padding: '0 8px 16px' }}>
            {imageAvailable && (
              <img 
                src={item.image_url!} 
                alt={item.title} 
                style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px', marginBottom: '24px', background: 'var(--surface)' }} 
              />
            )}
            {date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '13px' }}>
                <CalendarDays size={15} />
                <span>{dateFormatter.format(date)}</span>
              </div>
            )}
            <p style={{ color: 'var(--mint)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '15px' }}>
              {item.description}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
