import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Layers3 } from 'lucide-react';
import type { Member } from '../types';
import { createTeamProfiles, type TeamProfile } from '../lib/team-profiles';
import SocialCards from '../components/ui/card-fan-carousel';
import TeamProfileOverlay from '../components/people/TeamProfileOverlay';
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
  const [choosing, setChoosing] = useState(false);
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
    <div className="people-toolbar">
      {view === 'carousel' && <span className="eyebrow">02 / The people</span>}
      <button type="button" className="people-view-toggle" aria-pressed={view === 'tower'} disabled={!profiles.length}
        onClick={() => { setTowerStatus('loading'); setView(current => current === 'carousel' ? 'tower' : 'carousel'); }}>
        {view === 'carousel' ? <><Layers3 size={16} />Play Interactive Tower<ArrowUpRight size={15} /></> : <><ArrowLeft size={16} />Back to Quick view</>}
      </button>
    </div>
    {view === 'carousel' ? <div key="carousel" className="people-quick-view people-view">
      <div className="people-intro">
        <div><h1 id="people-title">Many minds.<br /><em>One nucleus.</em></h1><p>The people turning curiosity into something real.</p></div>
        {!!profiles.length && <label className="people-member-picker"><span>Meet the team <span>({String(profiles.length).padStart(2, '0')})</span></span>
          <select aria-label="Find a team member" value={currentIndex} onChange={event => setActiveIndex(Number(event.target.value))}
            onFocus={() => setChoosing(true)} onBlur={() => setChoosing(false)}>
            {profiles.map((person, index) => <option key={person.id} value={index}>{person.name} / {person.role}</option>)}
          </select>
        </label>}
      </div>
      <SocialCards cards={cards} activeIndex={currentIndex} onActiveIndexChange={setActiveIndex} paused={!!selected || choosing}
        onCardClick={(_, index) => setSelected(profiles[index])} />
    </div> : <div key="tower" className="people-view">
      <h1 id="people-title" className="sr-only">The people behind Nucleus</h1>
      <TowerBoundary><Suspense fallback={<p className="people-view-status" role="status">Building the interactive tower...</p>}>
        <PeopleTower members={members} onStatusChange={setTowerStatus} />
      </Suspense></TowerBoundary>
    </div>}
    {selected && <TeamProfileOverlay person={selected} onClose={closeProfile} />}
  </section>;
}
