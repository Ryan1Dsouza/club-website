import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
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
        <div className="ach-results-note"><span aria-live="polite" aria-atomic="true">{visible.length === profiles.length ? `${number(profiles.length)} members` : `${number(visible.length)} of ${number(profiles.length)} members`}</span></div>

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

      <footer className="ach-footer">
        <Link to="/team">Our team <ArrowUpRight size={15} /></Link>
      </footer>
    </div>

    {selected && <Modal title={selected.member.name} onClose={() => setSelected(null)}><div className="ach-detail">
      <p className="ach-detail__role">{selected.member.role} · Nucleus SJEC</p>
      {isPreview && <p className="ach-preview">SAMPLE ACHIEVEMENTS</p>}
      <div className="ach-detail__records">{selected.achievements.map(record => <section key={record.id}>
        <div className="ach-detail__meta"><span>{record.category}</span><span>{record.year}</span></div>
        <h3>{record.title}</h3><span className="ach-detail__result">{record.result}</span>{record.description && <p>{record.description}</p>}
        {record.href && /^https:\/\//.test(record.href) && <a className="ach-detail__link" href={record.href} target="_blank" rel="noreferrer">View the result <ArrowUpRight size={17} /></a>}
      </section>)}</div>
    </div></Modal>}
  </div>;
}
