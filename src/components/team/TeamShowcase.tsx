import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import MemberDeck from './memberDeck';
import MemberProfileOverlay from './MemberProfileOverlay';
import type { CoreMember, ClubMember, ProfileSubject } from './types';
import './team-showcase.css';

interface TeamShowcaseProps {
  clubName?: string;
  core: CoreMember[];
  members?: ClubMember[];
  isAlumni?: boolean;
}

export default function TeamShowcase({
  clubName = 'Nucleus',
  core,
  members = [],
  isAlumni = false,
}: TeamShowcaseProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [selectedMember, setSelectedMember] = useState<ProfileSubject | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleSelectMember = useCallback((member: ProfileSubject) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedMember(member);
  }, []);

  const allMembers = core.length > 0 ? core : members;

  return (
    <div className="members-page-fullscreen">
      <header className="members-hero-intro">
        <span className="meta-tag hero-eyebrow">
          NUCLEUS / {isAlumni ? 'THE LEGACY' : 'THE COMMUNITY'}
        </span>
        <h1 className="hero-heading">
          {isAlumni ? 'Alumni.' : 'Meet the community.'}
        </h1>
        <p className="hero-subtext">
          {isAlumni
            ? 'Part of Nucleus. Always.'
            : 'Different skills, shared curiosity. The people who turn a community into a force.'}
        </p>
      </header>

      {allMembers.length > 0 && (
        <MemberDeck core={allMembers as CoreMember[]} onSelect={handleSelectMember} reducedMotion={reducedMotion} />
      )}

      <AnimatePresence>
        {selectedMember && (
          <MemberProfileOverlay
            key={selectedMember.id}
            member={selectedMember}
            index={allMembers.findIndex((m) => m.id === selectedMember.id)}
            total={allMembers.length}
            group={isAlumni ? 'ALUMNI' : 'MEMBERS'}
            clubName={clubName}
            reducedMotion={reducedMotion}
            returnFocus={returnFocusRef.current}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
