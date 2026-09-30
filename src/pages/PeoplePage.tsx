import { useMemo } from 'react';
import type { Member } from '../types';
import './showcase.css';
import './people-tower.css';

const ROLE_RANK: Record<string, number> = {
  president: 0, 'vice president': 1, vp: 1, secretary: 2, treasurer: 3,
  'plan & strategy lead': 4, 'technical lead': 5, 'tech lead': 5,
  'ai & ml lead': 6, 'development lead': 7, 'dsa lead': 8,
  'event lead': 9, 'media lead': 10, 'discipline head': 11,
};
function roleRank(role: string) {
  const key = role.trim().toLowerCase();
  return ROLE_RANK[key] ?? (/lead|head/.test(key) ? 50 : 100);
}

export function sortTowerMembers<T extends { role: string; createdAt?: string }>(members: readonly T[]): T[] {
  const created = (member: T) => Date.parse(member.createdAt ?? '') || 0;
  return [...members].sort((a, b) => created(a) - created(b) || roleRank(a.role) - roleRank(b.role));
}

export default function PeoplePage({ members }: { members: Member[] }) {
  const sorted = useMemo(
    () => sortTowerMembers(members),
    [members],
  );

  return <section className="people-page" aria-labelledby="people-title">
    <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
    <div className="people-roster section-wrap" id="team-roster">
      <div className="people-roster__heading">
        <div>
          <span className="eyebrow">The whole nucleus</span>
          <h2>Stronger <em>together.</em></h2>
        </div>
        <span className="eyebrow">{sorted.length} people · One community</span>
      </div>
      <div className="people-roster__grid">
        {sorted.map((member, index) => <article className="people-roster__member" key={member.id}>
          <div className="people-roster__initials" aria-hidden="true">{member.initials}</div>
          <span className="people-roster__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h3>{member.name}</h3>
          <p>{member.role}</p>
        </article>)}
      </div>
      {!sorted.length && <div className="empty-state">The team will be announced here soon.</div>}
    </div>
  </section>;
}
