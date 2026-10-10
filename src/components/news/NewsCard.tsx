import { useId, useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { sfx } from '../../lib/sound-effects';
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
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const gallery = galleryRef.current;
    if (!gallery) return;

    const onWheel = (e: WheelEvent) => {
      // Only handle vertical wheel events to scroll horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        // Scroll by the width of one image (100% of container) + gap
        const scrollAmount = gallery.clientWidth + 16;
        gallery.scrollBy({ left: e.deltaY > 0 ? scrollAmount : -scrollAmount, behavior: 'smooth' });
        sfx.toggle();
      }
    };

    gallery.addEventListener('wheel', onWheel, { passive: false });
    return () => gallery.removeEventListener('wheel', onWheel);
  }, [open]);

  let images: string[] = [];
  if (item.image_url) {
    try {
      const parsed = JSON.parse(item.image_url);
      if (Array.isArray(parsed)) images = parsed;
      else images = [item.image_url];
    } catch {
      images = [item.image_url];
    }
  }
  const posterUrl = images[0];
  const imageAvailable = Boolean(posterUrl && failedImage !== posterUrl);

  const date = [item.date, item.created_at].filter(Boolean).map(value => new Date(value!))
    .find(value => !Number.isNaN(value.getTime()));

  return (
    <>
      <article className="news-card" aria-labelledby={titleId} onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}>
        <div className="news-card__image">
          {imageAvailable ? <img
            src={posterUrl}
            {...storageImageAttributes(posterUrl, [480, 800, 1200], '(max-width: 700px) 100vw, 600px')}
            alt={item.title}
            width={800} height={600}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onError={event => { if (!restoreOriginalImage(event.currentTarget)) setFailedImage(posterUrl); }}
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
          <div className="news-modal-content" style={{ padding: '0 8px 16px', marginTop: '24px' }}>
            {images.length > 0 ? (
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div ref={galleryRef} className="news-modal-gallery" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
                  {images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${item.title} - Image ${i + 1}`}
                      loading="eager" decoding="async" fetchPriority="high"
                      style={{ flex: '0 0 auto', width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '12px', background: 'var(--surface)', scrollSnapAlign: 'start' }}
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => { galleryRef.current?.scrollBy({ left: -(galleryRef.current.clientWidth + 16), behavior: 'smooth' }); sfx.toggle(); }}
                      className="icon-button"
                      style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'var(--mint)', border: '1px solid rgba(255,255,255,0.1)' }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => { galleryRef.current?.scrollBy({ left: galleryRef.current.clientWidth + 16, behavior: 'smooth' }); sfx.toggle(); }}
                      className="icon-button"
                      style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'var(--mint)', border: '1px solid rgba(255,255,255,0.1)' }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderRadius: '12px', marginBottom: '24px', color: 'var(--mint)' }} aria-hidden="true">
                <Logo />
              </div>
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
