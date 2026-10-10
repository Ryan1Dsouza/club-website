const fs = require('fs');
let code = fs.readFileSync('src/pages/AchievementsPage.tsx', 'utf8');

if (!code.includes('import { ChevronLeft, ChevronRight')) {
  code = code.replace(
    "import { ArrowUpRight, Search, X } from 'lucide-react';",
    "import { ArrowUpRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';"
  );
  code = code.replace(
    "import { sfx } from '../lib/sound-effects';",
    "" 
  );
  code = code.replace(
    "import { ArrowUpRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';",
    "import { ArrowUpRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';\nimport { sfx } from '../lib/sound-effects';"
  );
}

if (!code.includes('const [lightbox')) {
  code = code.replace(
    'const search = useRef<HTMLInputElement>(null);',
    `const search = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[], startIndex: number } | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!lightbox) return;
    const gallery = lightboxRef.current;
    if (!gallery) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        const scrollAmount = gallery.clientWidth + 16;
        gallery.scrollBy({ left: e.deltaY > 0 ? scrollAmount : -scrollAmount, behavior: 'smooth' });
        sfx.toggle();
      }
    };
    gallery.addEventListener('wheel', onWheel, { passive: false });
    return () => gallery.removeEventListener('wheel', onWheel);
  }, [lightbox]);`
  );
}

const oldPhotos = `{record.photos && record.photos.length > 0 && (
              <div className="ach-detail__photos" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '16px' }}>
                {record.photos.map(photoUrl => (
                  <img key={photoUrl} src={photoUrl} alt="Achievement highlight" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '1px solid var(--line-strong)', objectFit: 'cover' }} />
                ))}
              </div>
            )}`;

const newPhotos = `{record.photos && record.photos.length > 0 && (
              <div className="ach-detail__photos" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '16px' }}>
                {record.photos.map((photoUrl, idx) => (
                  <img key={photoUrl} src={photoUrl} alt="Achievement highlight" 
                    onClick={() => { setLightbox({ photos: record.photos!, startIndex: idx }); sfx.toggle(); }}
                    style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '1px solid var(--line-strong)', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.2s ease' }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            )}`;

code = code.replace(oldPhotos, newPhotos);

if (!code.includes('className="lightbox-gallery"')) {
  const lightboxJsx = `
    {lightbox && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => { setLightbox(null); sfx.toggle(); }} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 1010 }}><X size={32} /></button>
        <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', padding: '0 24px' }}>
          <div ref={lightboxRef} className="lightbox-gallery" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
            {lightbox.photos.map((url, i) => (
              <img
                key={i}
                src={url}
                ref={el => { if (el && i === lightbox.startIndex) { setTimeout(() => el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' }), 10); } }}
                style={{ flex: '0 0 auto', width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', scrollSnapAlign: 'center' }}
              />
            ))}
          </div>
          {lightbox.photos.length > 1 && (
            <>
              <button
                onClick={() => { lightboxRef.current?.scrollBy({ left: -(lightboxRef.current.clientWidth + 16), behavior: 'smooth' }); sfx.toggle(); }}
                className="icon-button"
                style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'var(--mint)', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px' }}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() => { lightboxRef.current?.scrollBy({ left: lightboxRef.current.clientWidth + 16, behavior: 'smooth' }); sfx.toggle(); }}
                className="icon-button"
                style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'var(--mint)', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px' }}
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
      </div>
    )}
  </div>;`;
  
  code = code.replace('  </div>;\n}', lightboxJsx + '\n}');
}

fs.writeFileSync('src/pages/AchievementsPage.tsx', code);
console.log('Successfully added lightbox!');
