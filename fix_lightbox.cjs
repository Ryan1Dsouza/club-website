const fs = require('fs');
let code = fs.readFileSync('src/pages/AchievementsPage.tsx', 'utf8');

const oldLightbox = `    {lightbox && (
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
    )}`;

const newLightbox = `    {lightbox && (
      <dialog 
        ref={el => { if (el && !el.open) { el.showModal(); } }}
        onCancel={(e) => { e.preventDefault(); setLightbox(null); sfx.toggle(); }}
        onClick={(e) => { if (e.target === e.currentTarget) { setLightbox(null); sfx.toggle(); } }}
        style={{ margin: 'auto', padding: 0, width: '100vw', maxWidth: 'none', height: '100vh', maxHeight: 'none', background: 'rgba(0,0,0,0.9)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      >
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
      </dialog>
    )}`;

if (code.includes(oldLightbox)) {
  code = code.replace(oldLightbox, newLightbox);
  fs.writeFileSync('src/pages/AchievementsPage.tsx', code);
  console.log('Successfully updated lightbox to use dialog!');
} else {
  console.log('Could not find old lightbox code block!');
}
