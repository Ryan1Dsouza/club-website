import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Member } from '../types';
import { createTeamProfiles, type TeamProfile } from '../lib/team-profiles';
import SocialCards from '../components/ui/card-fan-carousel';
import TeamProfileOverlay from '../components/people/TeamProfileOverlay';
import TowerPlayButton from '../components/people/TowerPlayButton';
import './people-page.css';

// The module, portrait cache, CSS, WebGL and physics all stay behind this boundary.
const PeopleTower = lazy(() => import('../components/people/PeopleTower'));
class TowerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <p className="people-view-status" role="alert">The tower could not load. Return to Quick view to meet the team.</p> : this.props.children;
  }
}

export default function PeoplePage({ members }: { members: Member[] }) {
  const [view, setView] = useState<'carousel' | 'tower'>('carousel');
  const [towerStatus, setTowerStatus] = useState<'loading' | 'ready' | 'still' | 'fallback'>('loading');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<TeamProfile | null>(null);
  const page = useRef<HTMLElement>(null);
  const profiles = useMemo(() => createTeamProfiles(members), [members]);
  const cards = useMemo(() => profiles.map(person => ({
    id: person.id, name: person.name, role: person.role, initials: person.initials, imgUrl: person.cardImage,
  })), [profiles]);
  const closeProfile = useCallback(() => setSelected(null), []);
  const currentIndex = profiles.length ? activeIndex % profiles.length : 0;

  useEffect(() => {
    // The tower uses the shell as its mobile scroller; the quick view uses the page.
    page.current?.closest('.site-shell')?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  return <section ref={page} className="people-page" aria-labelledby="people-title" data-view={view} data-tower-status={view === 'tower' ? towerStatus : undefined}>
    {view === 'carousel' && <div className="people-jenga-backdrop" aria-hidden="true">
      <svg viewBox="0 0 1440 1100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <g id="people-jenga-tier"><path d="M0 26 112 0 212 36 100 64Z" fill="#e9e6cc" /><path d="M0 26 100 64V92L0 54Z" fill="#b2c0a0" /><path d="M100 64 212 36V64L100 92Z" fill="#93ab8c" /><path d="M0 26 112 0 212 36V64L100 92 0 54ZM0 26 100 64 212 36M100 64V92M34 39V67M67 51V79M37 17 137 55M75 9 175 45" fill="none" stroke="currentColor" /></g>
        </defs>
        <g className="people-jenga-backdrop__tower people-jenga-backdrop__tower--left" transform="translate(40 100) rotate(-12 100 300)">
          {[5, 4, 3, 2, 1, 0].map(level => <use key={level} href="#people-jenga-tier" x={level === 2 ? -26 : 0} y={level * 57} />)}
        </g>
        <g className="people-jenga-backdrop__tower people-jenga-backdrop__tower--right" transform="translate(1170 70) rotate(14 100 300)">
          {[6, 5, 4, 3, 2, 1, 0].map(level => <use key={level} href="#people-jenga-tier" x={level === 3 ? 35 : 0} y={level * 57} />)}
        </g>
        <g className="people-jenga-backdrop__loose" transform="translate(1120 820) rotate(-12)"><path d="M0 20 110 0 190 28 80 50Z" /><path d="M0 20V43L80 73 190 51V28M80 50V73" /><path d="M0 20 80 50 190 28" /></g>
        <path className="people-jenga-backdrop__guide" d="M90 880H370M1070 670H1370M113 866V894M1347 656V684" />
      </svg>
    </div>}
    <div className="people-toolbar">
      {view === 'carousel' && <span className="eyebrow">02 / The people</span>}
      {view === 'tower' && <button type="button" className="people-view-toggle" onClick={() => setView('carousel')}>
        <ArrowLeft size={16} />Back to Quick view
      </button>}
    </div>
    {view === 'carousel' ? <div key="carousel" className="people-quick-view people-view">
      <div className="people-intro">
        <div><h1 id="people-title">Many minds.<br /><em>One nucleus.</em></h1><p>The people turning curiosity into something real.</p></div>
        {!!profiles.length && <label className="people-member-picker"><span>Meet the team <span>({String(profiles.length).padStart(2, '0')})</span></span>
          <select aria-label="Find a team member" value={currentIndex} onChange={event => setActiveIndex(Number(event.target.value))}>
            {profiles.map((person, index) => <option key={person.id} value={index}>{person.name} / {person.role}</option>)}
          </select>
        </label>}
      </div>
      <SocialCards cards={cards} activeIndex={currentIndex} onActiveIndexChange={setActiveIndex} paused={!!selected}
        onCardClick={(_, index) => setSelected(profiles[index])} />
      <TowerPlayButton disabled={!profiles.length} paused={!!selected}
        onClick={() => { setTowerStatus('loading'); setView('tower'); }} />
    </div> : <div key="tower" className="people-view">
      <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
      <TowerBoundary><Suspense fallback={<p className="people-view-status" role="status">Building the interactive tower...</p>}>
        <PeopleTower members={members} onStatusChange={setTowerStatus} />
      </Suspense></TowerBoundary>
    </div>}
    {selected && <TeamProfileOverlay person={selected} onClose={closeProfile} />}
  </section>;
}
