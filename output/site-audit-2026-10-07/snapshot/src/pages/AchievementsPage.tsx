import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Asterisk, Search, X } from 'lucide-react';
import Modal from '../components/shared/Modal';
import { achievementCategories, createAchievementProfiles, type AchievementProfile } from '../content/achievements';
import type { Member, SiteSettings } from '../types';
import './achievements-page.css';

type Props = { members: Member[]; settings: SiteSettings };
const number = (value: number) => String(value).padStart(2, '0');
/** A folded-paper club rosette, drawn for this page rather than a stock trophy. */
function NucleusRosette() {
  return <svg className="ach-rosette" viewBox="0 0 400 430" fill="none" aria-hidden="true">
    <g className="ach-rosette__ribbons">
      <path d="M130 228 109 394 157 366 188 406 205 239Z" fill="color-mix(in srgb, var(--mint) 75%, var(--bg))" stroke="var(--surface-raised)" />
      <path d="m199 239 26 161 29-43 47 21-38-160Z" fill="var(--mint)" stroke="var(--surface-raised)" />
      <path d="m149 252-19 121m42-105-9 107m65-119 22 111m8-116 23 94" stroke="color-mix(in srgb, var(--mint) 35%, var(--bg))" strokeWidth="1.5" />
    </g>
    <g className="ach-rosette__medal">
      {Array.from({ length: 24 }, (_, index) => <g key={index} transform={`rotate(${index * 15} 200 176)`}>
        <path d="M200 176 182 63 200 49 218 63Z" fill={index % 2 ? 'var(--mint)' : 'var(--mint)'} stroke="color-mix(in srgb, var(--mint) 30%, var(--bg))" strokeWidth=".75" />
        <path d="M200 176V49L218 63Z" fill="var(--surface-raised)" fillOpacity=".6" />
      </g>)}
      <circle cx="200" cy="176" r="91" fill="var(--mint)" stroke="color-mix(in srgb, var(--mint) 30%, var(--bg))" strokeWidth="2" />
      <circle cx="200" cy="176" r="83" stroke="color-mix(in srgb, var(--mint) 30%, var(--bg))" strokeDasharray="1 4" />
      <circle cx="200" cy="176" r="57" fill="color-mix(in srgb, var(--mint) 85%, var(--bg))" stroke="color-mix(in srgb, var(--mint) 30%, var(--bg))" />
      <path d="M176 206v-60h11l27 40v-40h12v60h-11l-27-40v40Z" fill="var(--surface-raised)" />
      <path d="m188 224 12 4 12-4" stroke="color-mix(in srgb, var(--mint) 30%, var(--bg))" />
    </g>
  </svg>;
}

function MemberPortrait({ member }: { member: Member }) {
  const [failedImage, setFailedImage] = useState<string>();
  return <span className="ach-portrait"><span aria-hidden="true">{member.initials}</span>{member.image && failedImage !== member.image && <img src={member.image} alt={member.name} width="120" height="144" loading="lazy" decoding="async" onError={() => setFailedImage(member.image)} />}</span>;
}

export default function AchievementsPage({ members, settings }: Props) {
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AchievementProfile | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const { profiles, isPreview } = useMemo(() => createAchievementProfiles(members), [members]);
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
        <NucleusRosette />
      </header>

      <section className="ach-archive" id="achievement-records" aria-labelledby="ach-records-title">
        <h2 className="sr-only" id="ach-records-title">Member achievements</h2>
        <div className="ach-tools">
          <div className="ach-filters" role="group" aria-label="Filter achievements by category">{categories.map(item => <button type="button" key={item} aria-pressed={activeCategory === item} onClick={() => setCategory(item)}>{item === 'Competitive programming' ? 'Programming' : item}<span>{number(item === 'All' ? profiles.length : profiles.filter(profile => profile.achievements.some(record => record.category === item)).length)}</span></button>)}</div>
          <div className="ach-search"><Search size={16} aria-hidden="true" /><input ref={search} aria-label="Search achievements or members" type="search" placeholder="Search members or achievements" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); search.current?.focus(); }}><X size={15} /></button>}</div>
        </div>
        <div className="ach-results-note"><span aria-live="polite" aria-atomic="true">{visible.length === profiles.length ? `${number(profiles.length)} members` : `${number(visible.length)} of ${number(profiles.length)} members`}</span></div>

        <div className="ach-records">{visible.map(profile => <article className="ach-record" key={profile.member.id}>
          <div className="ach-record__topline"><span>No. {number(profiles.indexOf(profile) + 1)}</span><span>{isPreview ? 'SAMPLE RECORD' : 'MEMBER RECORD'}</span><Asterisk size={15} aria-hidden="true" /></div>
          <div className="ach-record__person"><MemberPortrait member={profile.member} /><div><span className="ach-record__role">{profile.member.role}</span><h3>{profile.member.name}</h3></div></div>
          <ul className="ach-honours">{profile.achievements.map(record => <li key={record.id} data-category-match={activeCategory === 'All' || record.category === activeCategory}>
            <span className={`ach-honours__symbol ach-honours__symbol--${record.category === 'Hackathons' ? 'award' : record.category === 'Open source' ? 'code' : record.category === 'Research' ? 'research' : 'rank'}`} aria-hidden="true">{record.category === 'Hackathons' ? '✳' : record.category === 'Open source' ? '↗' : record.category === 'Research' ? '✦' : '#'}</span>
            <div><span className="ach-honours__title">{record.title}<span>’{record.year.slice(-2)}</span></span><span className="ach-honours__result">{record.result}</span></div>
          </li>)}</ul>
          <button type="button" className="ach-record__open" onClick={() => setSelected(profile)} aria-label={`View ${profile.member.name}'s achievements`} aria-haspopup="dialog"><span>{number(profile.achievements.length)} {isPreview ? 'sample achievements' : 'achievements'}</span><span className="ach-record__arrow" aria-hidden="true"><ArrowUpRight size={18} /></span></button>
        </article>)}</div>
        {!visible.length && <div className="ach-empty"><h3>{profiles.length ? 'No matching achievements.' : 'No achievements yet.'}</h3>{profiles.length > 0 && <><p>Try another name or category.</p><button type="button" onClick={resetFilters}>Clear filters <ArrowUpRight size={16} /></button></>}</div>}
      </section>

      <footer className="ach-footer"><a href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent('Nucleus achievement')}`}>Submit an achievement <ArrowUpRight size={15} /></a><Link to="/team">Our team <ArrowUpRight size={15} /></Link></footer>
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
