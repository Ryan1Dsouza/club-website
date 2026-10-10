import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sfx } from '../lib/sound-effects';
import Modal from '../components/shared/Modal';
import { achievementCategories, createAchievementProfiles, type AchievementProfile, type Achievement } from '../content/achievements';
import type { Member, SiteSettings } from '../types';
import { AchievementCard } from '../components/achievements/AchievementCard';
import './achievements-page.css';

type Props = { members: Member[]; settings: SiteSettings };
const number = (value: number) => String(value).padStart(2, '0');

export default function AchievementsPage({ members, settings }: Props) {
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AchievementProfile | null>(null);
  const search = useRef<HTMLInputElement>(null);
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
  }, [lightbox]);
  
  const [fetchedAchievements, setFetchedAchievements] = useState<Achievement[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    import('../content/achievements').then(m => m.fetchAchievements(controller.signal))
      .then(setFetchedAchievements).catch(() => {});
    return () => controller.abort();
  }, []);

  const { profiles, isPreview } = useMemo(() => createAchievementProfiles(members, fetchedAchievements), [members, fetchedAchievements]);
  const categories = achievementCategories.filter(item => item === 'All' || profiles.some(profile => profile.achievements.some(record => record.category === item)));
  const activeCategory = categories.some(item => item === category) ? category : 'All';
  const visible = profiles.filter(profile => {
    const eligible = profile.achievements.filter(record => activeCategory === 'All' || record.category === activeCategory);
    return eligible.length > 0 && [profile.member.name, profile.member.role, ...eligible.flatMap(record => [record.title, record.result, record.category, record.year])].join(' ').toLowerCase().includes(query.trim().toLowerCase());
  });
  const resetFilters = () => { setCategory('All'); setQuery(''); search.current?.focus(); };

  return <div className="ach-page">
    <div className="ach-wrap">
      <header className="ach-hero" aria-labelledby="ach-title">
        <h1 id="ach-title">Achievements</h1>
      </header>

      <section className="ach-archive" id="achievement-records" aria-labelledby="ach-records-title">
        <h2 className="sr-only" id="ach-records-title">Member achievements</h2>
        <div className="ach-tools">
          <div className="ach-filters" role="group" aria-label="Filter achievements by category">
            {categories.map(item => <button type="button" key={item} aria-pressed={activeCategory === item} onClick={() => setCategory(item)}>{item === 'Competitive programming' ? 'Programming' : item}<span>{number(item === 'All' ? profiles.length : profiles.filter(profile => profile.achievements.some(record => record.category === item)).length)}</span></button>)}
          </div>
          <div className="ach-search"><Search size={16} aria-hidden="true" /><input ref={search} aria-label="Search achievements or members" type="search" placeholder="Search members or achievements" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); search.current?.focus(); }}><X size={15} /></button>}</div>
        </div>

        <div className="ach-records">
          {visible.map(profile => (
            <AchievementCard 
              key={profile.member.id}
              profile={profile}
              index={profiles.indexOf(profile)}
              totalProfiles={profiles.length}
              isPreview={isPreview}
              activeCategory={activeCategory}
              onClick={() => setSelected(profile)}
            />
          ))}
        </div>
        {!visible.length && <div className="ach-empty"><h3>{profiles.length ? 'No matching achievements.' : 'No achievements yet.'}</h3>{profiles.length > 0 && <><p>Try another name or category.</p><button type="button" onClick={resetFilters}>Clear filters <ArrowUpRight size={16} /></button></>}</div>}
      </section>


    </div>

    {selected && <Modal title={selected.member.name} onClose={() => setSelected(null)}>
      <div className="ach-detail" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          {selected.member.image && (
            <img 
              src={selected.member.image} 
              alt={selected.member.name} 
              width={80} height={80} loading="eager" decoding="async"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line-strong)' }} 
            />
          )}
          <div>
            <p style={{ fontSize: '20px', color: 'var(--mint)', margin: 0, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{selected.member.role}</p>
            <p style={{ fontSize: '15px', color: 'var(--muted)', margin: '4px 0 0' }}>Nucleus SJEC</p>
          </div>
        </div>
      
        {isPreview && <p className="ach-preview">SAMPLE ACHIEVEMENTS</p>}
        <div className="ach-detail__records">{selected.achievements.map(record => <section key={record.id}>
          <div className="ach-detail__meta"><span>{record.category}</span><span>{record.year}</span></div>
          <h3>{record.title}</h3><span className="ach-detail__result">{record.result}</span>{record.description && <p>{record.description}</p>}
          {record.href && /^https:\/\//.test(record.href) && <a className="ach-detail__link" href={record.href} target="_blank" rel="noreferrer">View the result <ArrowUpRight size={17} /></a>}
                    {record.photos && record.photos.length > 0 && (
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
            )}
          </section>)}</div>
      </div>
    </Modal>}

    {lightbox && (
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
    )}
  </div>;
}
