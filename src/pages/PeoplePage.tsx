import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Member } from '../types';
import { createTeamProfiles, type TeamProfile } from '../lib/team-profiles';
import { useReveal } from '../components/ui/reveal';
import TeamProfileOverlay from '../components/people/TeamProfileOverlay';
import TowerPlayButton from '../components/people/TowerPlayButton';
import './people-page.css';

// WebGL and physics only load when someone chooses to play.
const PeopleTower = lazy(() => import('../components/people/PeopleTower'));
class TowerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <p className="people-view-status" role="alert">The tower could not load. Go back to the team to meet everyone.</p> : this.props.children;
  }
}

function MemberCard({ person, index, onSelect }: { person: TeamProfile; index: number; onSelect: (person: TeamProfile) => void }) {
  const card = useRef<HTMLLIElement>(null);
  useReveal(card, { delay: (index % 3) * 60, enabled: index > 5 });
  return <li ref={card} className="people-card">
    <button type="button" onClick={() => onSelect(person)} aria-label={`Meet ${person.name}, ${person.role}`}>
      <span className="people-card__portrait">
        <span className="people-card__initials" aria-hidden="true">{person.initials}</span>
        {/* Main portraits bypass the resize service; only download timing changes. */}
        {person.cardImage && <img src={person.cardImage} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} style={person.previewImage ? { backgroundImage: `url("${person.previewImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          width="400" height="500" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />}
        <span className="people-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')} / NUCLEUS</span>
        <span className="people-card__open" aria-hidden="true"><ArrowUpRight size={20} /></span>
      </span>
      <span className="people-card__copy"><span className="people-card__role">{person.role}</span><span className="people-card__name">{person.name}</span></span>
    </button>
  </li>;
}

export default function PeoplePage({ members }: { members: Member[] }) {
  const [view, setView] = useState<'grid' | 'tower'>('grid');
  const [group, setGroup] = useState<'member' | 'alumni'>('member');
  const [towerStatus, setTowerStatus] = useState<'loading' | 'ready' | 'still' | 'fallback'>('loading');
  const [selected, setSelected] = useState<TeamProfile | null>(null);
  const roster = useRef<HTMLElement>(null);
  const profiles = useMemo(() => createTeamProfiles(members), [members]);
  const currentMembers = useMemo(() => members.filter(person => person.status !== 'alumni'), [members]);
  const visibleProfiles = profiles.filter(person => (person.status ?? 'member') === group);
  const closeProfile = useCallback(() => setSelected(null), []);
  const previousView = useRef(view);
  const previousGroup = useRef(group);

  useEffect(() => {
    if (view !== 'tower') return;
    document.documentElement.classList.add('people-tower-open');
    return () => document.documentElement.classList.remove('people-tower-open');
  }, [view]);

  useEffect(() => {
    if (previousGroup.current === group) return;
    previousGroup.current = group;
    meetTeam();
  }, [group]);

  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector<HTMLElement>(view === 'grid' ? '#people-title' : '.people-view-toggle')?.focus({ preventScroll: true });
  }, [view]);

  function meetTeam() {
    roster.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    roster.current?.focus({ preventScroll: true });
  }

  return <section className="people-page" data-view={view} data-tower-status={view === 'tower' ? towerStatus : undefined}>
    <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
    <div className="people-toolbar">
      {view === 'grid' ? null : <button type="button" className="people-view-toggle" onClick={() => setView('grid')}>
        <ArrowLeft size={16} />Back to the team
      </button>}
    </div>
    {view === 'grid' ? <div key="grid" className="people-directory people-view">
      <div className="people-intro">
        <div className="people-groups" role="group" aria-label="Browse the community" style={{ margin: 0, padding: 0, border: 'none' }}>
          <div>{(['member', 'alumni'] as const).map(option => <button key={option} type="button" aria-pressed={group === option} aria-controls="people-roster"
            onClick={() => setGroup(option)}>{option === 'member' ? 'Members' : 'Alumni'}<ArrowUpRight size={16} /></button>)}</div>
        </div>

      </div>
      <section ref={roster} id="people-roster" className="people-directory__roster" aria-labelledby="people-roster-title" tabIndex={-1}>
        <div className="people-directory__heading">
          <h2 id="people-roster-title">{group === 'member' ? 'The minds behind it.' : 'Always part of the nucleus.'}</h2>
          <p aria-live="polite">{String(visibleProfiles.length).padStart(2, '0')} {group === 'member' ? 'members' : 'alumni'}<span>Choose a card. Get to know us.</span></p>
        </div>
        {visibleProfiles.length ? <ul className="people-grid" aria-label={group === 'member' ? 'Members' : 'Alumni'}>
          {visibleProfiles.map((person, index) => <MemberCard key={`${group}-${person.id}`} person={person} index={index} onSelect={setSelected} />)}
        </ul> : <p className="people-empty" role="status">{group === 'member' ? 'The team will be announced here soon.' : 'Alumni profiles are coming soon.'}</p>}
      </section>
      <TowerPlayButton disabled={!currentMembers.length} paused={!!selected}
        onClick={() => { setTowerStatus('loading'); setView('tower'); }} />
    </div> : <div key="tower" className="people-view">
      <TowerBoundary><Suspense fallback={<p className="people-view-status" role="status">Building the interactive tower...</p>}>
        <PeopleTower members={currentMembers} onStatusChange={setTowerStatus} />
      </Suspense></TowerBoundary>
    </div>}
    {selected && <TeamProfileOverlay person={selected} onClose={closeProfile} />}
  </section>;
}
