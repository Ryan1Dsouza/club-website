import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Code2, Database, Globe, Github, Linkedin, Terminal } from 'lucide-react';
import type { Member } from '../types';
import { directoryMembers } from '../lib/people-data';
import { sortTowerMembers } from '../lib/people-tower-motion';
import './people-tower.css';
import './people-directory.css';

function MemberSocials({ member }: { member: Member }) {
  const icons = { linkedin: Linkedin, github: Github, leetcode: Code2, gfg: Globe, kaggle: Database, codeforces: Terminal };
  const labels = { linkedin: 'LinkedIn', github: 'GitHub', leetcode: 'LeetCode', gfg: 'GeeksforGeeks', kaggle: 'Kaggle', codeforces: 'Codeforces' };
  const links = (Object.keys(icons) as (keyof typeof icons)[]).filter(key => member.socials?.[key] && member.socials[key] !== '#');
  if (!links.length) return null;
  return <div className="people-roster__footer"><div className="people-roster__socials">
    {links.map(key => {
      const Icon = icons[key];
      return <a key={key} href={member.socials![key]} target="_blank" rel="noreferrer" aria-label={`${member.name} on ${labels[key]}`}><Icon size={15} /></a>;
    })}
  </div></div>;
}

function MemberAvatar({ member }: { member: Member }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imagePath = member.image;
  if (imagePath && imagePath !== failedImage) return <div className="people-roster__avatar">
    <img src={imagePath} alt={member.name} className="people-roster__image" loading="lazy" decoding="async" onError={() => setFailedImage(imagePath)} />
  </div>;
  return <div className="people-roster__initials" aria-hidden="true">{member.initials}</div>;
}

const emptyTeam: Member[] = [];
export default function PeopleDirectoryPage({ kind, members = emptyTeam }: { kind: 'members' | 'alumni'; members?: Member[] }) {
  const people = useMemo(() => sortTowerMembers(directoryMembers(kind, members)), [kind, members]);
  const alumni = kind === 'alumni';

  useEffect(() => {
    sessionStorage.setItem('people_return_to_directory', 'true');
  }, []);

  return <section className="people-page people-directory-page section-wrap" aria-labelledby="directory-title">
    <div className="people-directory-page__nav">
      <Link to="/team" state={{ scrollToDirectory: true }} onClick={() => sessionStorage.setItem('people_return_to_directory', 'true')} className="text-link"><ArrowLeft size={16} />The people</Link>
      <Link to={alumni ? '/members' : '/alumni'} className="text-link">{alumni ? 'Members' : 'Alumni'}<ArrowUpRight size={16} /></Link>
    </div>
    <div className="people-directory-page__heading">
      <span className="eyebrow">Nucleus / {alumni ? 'The legacy' : 'The community'}</span>
      <h1 id="directory-title">{alumni ? 'Alumni' : 'Members'}</h1>
      <p>{alumni ? 'Part of Nucleus. Always.' : 'The people making it happen.'}</p>
    </div>
    <div className="people-roster__grid">{people.map((member, index) => <article className="people-roster__member" key={member.id}>
      <span className="people-roster__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <MemberAvatar member={member} />
      <div className="people-roster__details">
        <h2>{member.name}</h2>
        <p className="people-roster__role">{member.role}</p>
        {member.tagline && <p className="people-roster__tagline">“{member.tagline}”</p>}
      </div>
      <MemberSocials member={member} />
    </article>)}</div>
    {!people.length && <p className="people-directory-page__empty">{alumni ? 'Alumni profiles will be added soon.' : 'Member profiles will be added soon.'}</p>}
  </section>;
}
