import { useEffect, useRef } from 'react';
import seed from '../../../shared/public-data.json';
import { createTeamProfiles, type TeamProfile } from '../../lib/team-profiles';
import { Reveal } from '../ui/reveal';
import { TextReveal } from '../ui/text-reveal';
import './voices-marquee.css';

// Credit the original authors separately from the club members on each card.
const quotes = [
  {
    memberId: 'poorvik',
    body: 'What I cannot create, I do not understand.',
    author: 'Richard Feynman',
  },
  {
    memberId: 'dinol',
    body: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
  },
  {
    memberId: 'joylin',
    body: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
  },
  {
    memberId: 'prajwal',
    body: 'Science is what we understand well enough to explain to a computer. Art is everything else we do.',
    author: 'Donald Knuth',
  },
  {
    memberId: 'rakshith',
    body: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson & Gerald Jay Sussman',
  },
  {
    memberId: 'navya',
    body: 'The programmer, like the poet, works only slightly removed from pure thought.',
    author: 'Fred Brooks',
  },
];

type Voice = { member: TeamProfile; body: string; author: string };
const coreMembers = createTeamProfiles(seed.team);
const firstRow: Voice[] = quotes.flatMap(({ memberId, ...quote }) => {
  const member = coreMembers.find(member => member.id === memberId);
  return member ? [{ member, ...quote }] : [];
});
const secondRow = [...firstRow].reverse();

const ReviewCard = ({ member, body, author }: Voice) => {
  return (
    <div className="vm-card">
      <div className="vm-card-header">
        <img className="vm-avatar" src={member.avatarImage} alt={member.name} width={48} height={48} loading="lazy" decoding="async" />
        <div className="vm-meta">
          <p className="vm-name">{member.name}</p>
          <p className="vm-role">{member.role}</p>
        </div>
      </div>
      <blockquote className="vm-quote">
        <p className="vm-body">“{body}”</p>
      </blockquote>
    </div>
  );
};

export default function VoicesMarquee() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current!;
    const rows = section.querySelectorAll<HTMLElement>('.vm-marquee-wrapper');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visible = new Set<Element>();
    const sync = () => rows.forEach(row => {
      row.dataset.running = String(visible.has(row) && !document.hidden && !media.matches);
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      sync();
    });
    rows.forEach(row => observer.observe(row));
    sync();
    document.addEventListener('visibilitychange', sync);
    media.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      media.removeEventListener('change', sync);
    };
  }, []);
  return (
    <section ref={ref} className="vm-container section-space" aria-label="Community voices">
      <div className="vm-header">
        <TextReveal as="h2" className="vm-title" text="THE VOICES OF NUCLEUS" />
      </div>

      <Reveal className="vm-marquee-wrapper" delay={70} tabIndex={0} role="region" aria-label="Community voices, first row">
        <div className="vm-marquee-content">
          {firstRow.map((review, i) => <ReviewCard key={`f1-${i}`} {...review} />)}
        </div>
        {/* Duplicate for infinite loop */}
        <div className="vm-marquee-content" aria-hidden="true">
          {firstRow.map((review, i) => <ReviewCard key={`f2-${i}`} {...review} />)}
        </div>
        <div className="vm-fade-left"></div>
        <div className="vm-fade-right"></div>
      </Reveal>

      <Reveal className="vm-marquee-wrapper reverse" delay={140} tabIndex={0} role="region" aria-label="Community voices, second row">
        <div className="vm-marquee-content">
          {secondRow.map((review, i) => <ReviewCard key={`s1-${i}`} {...review} />)}
        </div>
        {/* Duplicate for infinite loop */}
        <div className="vm-marquee-content" aria-hidden="true">
          {secondRow.map((review, i) => <ReviewCard key={`s2-${i}`} {...review} />)}
        </div>
        <div className="vm-fade-left"></div>
        <div className="vm-fade-right"></div>
      </Reveal>
    </section>
  );
}
