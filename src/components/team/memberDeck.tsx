import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MemberCard from './MemberCard';
import type { CoreMember } from './types';

interface MemberDeckProps {
  core: CoreMember[];
  onSelect: (member: CoreMember) => void;
  reducedMotion?: boolean;
}

function ArchedFanCard({
  member,
  index,
  total,
  progress,
  onSelect,
}: {
  member: CoreMember;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onSelect: (member: CoreMember) => void;
}) {
  const activeIndex = useTransform(progress, [0, 1], [0, total - 1]);

  const offset = useTransform(activeIndex, current => {
    let distance = index - current;
    if (distance > total / 2) distance -= total;
    if (distance < -total / 2) distance += total;
    return distance;
  });

  const rotate = 0;
  const x = useTransform(offset, value => `calc(${value} * clamp(340px, 30vw, 440px))`);
  const y = useTransform(offset, value => Math.abs(value) * 16);
  const scale = useTransform(offset, value => Math.max(0.85, 1 - Math.abs(value) * 0.08));
  const opacity = useTransform(offset, value => Math.max(0, 1 - Math.abs(value) * 0.32));
  const zIndex = useTransform(offset, value => Math.round(100 - Math.abs(value) * 10));
  const visibility = useTransform(opacity, value => (value > 0.01 ? 'visible' : 'hidden'));
  const pointerEvents = useTransform(opacity, value => (value > 0.01 ? 'auto' : 'none'));

  return (
    <motion.li
      className="deck-card-wrapper"
      style={{ rotate, x, y, scale, opacity, zIndex, visibility, pointerEvents }}
    >
      <MemberCard member={member} index={index} total={total} onSelect={onSelect} />
    </motion.li>
  );
}

function AnimatedMemberDeck({ core, onSelect }: Omit<MemberDeckProps, 'reducedMotion'>) {
  const containerRef = useRef<HTMLElement>(null);
  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, { stiffness: 200, damping: 32, restDelta: 0.001 });
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const total = core.length;
    if (total <= 1) return;

    let target = 0;

    const handleWheel = (e: WheelEvent) => {
      if (document.body.style.overflow === 'hidden') return;

      e.preventDefault();
      const delta = e.deltaY;
      const step = 1 / (total - 1);

      target = Math.max(0, Math.min(1, target + Math.sign(delta) * step));
      rawProgress.set(target);
      setCurrentIdx(Math.round(target * (total - 1)));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [core.length, rawProgress]);

  const touchStartRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null || core.length <= 1) return;
    const deltaX = touchStartRef.current - e.touches[0].clientX;
    if (Math.abs(deltaX) > 30) {
      const step = 1 / (core.length - 1);
      const current = rawProgress.get();
      const next = Math.max(0, Math.min(1, current + Math.sign(deltaX) * step));
      rawProgress.set(next);
      setCurrentIdx(Math.round(next * (core.length - 1)));
      touchStartRef.current = e.touches[0].clientX;
    }
  };

  return (
    <section
      ref={containerRef}
      id="core-team-deck"
      className="member-deck-section static-deck-stage"
      aria-label="Members Core Deck"
      tabIndex={-1}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="member-deck-glow" aria-hidden="true" />

      {/* Top Right Action Controls: Dropdown & Prev/Next */}
      <div className="deck-top-right-bar">
        <label className="member-select-label">
          <span className="sr-only">Jump to member</span>
          <select
            className="member-select-dropdown"
            value={currentIdx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              const step = 1 / (core.length - 1);
              const next = idx * step;
              rawProgress.set(next);
              setCurrentIdx(idx);
            }}
          >
            <option value="" disabled>
              Find member...
            </option>
            {core.map((member, idx) => (
              <option key={member.id} value={idx}>
                {idx + 1}. {member.name} ({member.role})
              </option>
            ))}
          </select>
        </label>

        <div className="deck-controls">
          <button
            type="button"
            className="deck-nav-btn"
            onClick={() => {
              const step = 1 / (core.length - 1);
              const next = Math.max(0, rawProgress.get() - step);
              rawProgress.set(next);
              setCurrentIdx(Math.round(next * (core.length - 1)));
            }}
            aria-label="Previous member"
            disabled={currentIdx === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="deck-scroll-hint">
            {String(currentIdx + 1).padStart(2, '0')} / {String(core.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="deck-nav-btn"
            onClick={() => {
              const step = 1 / (core.length - 1);
              const next = Math.min(1, rawProgress.get() + step);
              rawProgress.set(next);
              setCurrentIdx(Math.round(next * (core.length - 1)));
            }}
            aria-label="Next member"
            disabled={currentIdx === core.length - 1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <ul className="member-deck-viewport">
        {core.map((member, index) => (
          <ArchedFanCard
            key={member.id}
            member={member}
            index={index}
            total={core.length}
            progress={progress}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </section>
  );
}

export default function MemberDeck({ core, onSelect, reducedMotion = false }: MemberDeckProps) {
  if (!reducedMotion) {
    return <AnimatedMemberDeck core={core} onSelect={onSelect} />;
  }

  return (
    <section id="core-team-deck" className="member-deck-reduced" aria-label="Members Core Deck" tabIndex={-1}>
      <ul className="core-deck-list-reduced">
        {core.map((member, index) => (
          <li key={member.id}>
            <MemberCard member={member} index={index} total={core.length} onSelect={onSelect} reducedMotion />
          </li>
        ))}
      </ul>
    </section>
  );
}
