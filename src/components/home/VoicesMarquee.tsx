import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../ui/reveal';
import { TextReveal } from '../ui/text-reveal';
import './voices-marquee.css';

const reviews = [
  {
    name: "Ken Masters",
    username: "@kmasters",
    body: "“Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”",
  },
  {
    name: "Kira Athrun",
    username: "@kathrun",
    body: "“What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”",
  },
  {
    name: "Lirael Nassun",
    username: "@lnassun",
    body: "“This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”",
  },
  {
    name: "Jessica",
    username: "@jessica",
    body: "“Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "“We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”",
  },
];

const firstRow = reviews; // Reusing all reviews to have enough cards
const secondRow = [...reviews].reverse(); // A bit of variety for the second row

const ReviewCard = ({ name, username, body }: { name: string; username: string; body: string }) => {
  return (
    <div className="vm-card">
      <div className="vm-card-header">
        <span className="vm-avatar" aria-hidden="true">{name.slice(0, 1)}</span>
        <div className="vm-meta">
          <p className="vm-name">{name}</p>
          <p className="vm-username">{username}</p>
        </div>
      </div>
      <p className="vm-body">{body}</p>
    </div>
  );
};

export default function VoicesMarquee() {
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
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
    <section ref={ref} className="vm-container section-space" data-paused={paused} aria-label="Community voices">
      <div className="vm-header">
        <TextReveal as="h2" className="vm-title" text="THE VOICES OF NUCLEUS" />
        <button className="button vm-pause" aria-pressed={paused} onClick={() => setPaused(value => !value)}>Pause moving voices</button>
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
