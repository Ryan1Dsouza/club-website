import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './tower-play-button.css';

export default function TowerPlayButton({ disabled, paused, onClick }: { disabled: boolean; paused: boolean; onClick: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (button.current) observer.observe(button.current);
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  const row = (level: number, upper = false) => <span key={level} className="jenga-preview__row"
    style={{ '--level': upper ? level - 3 : level, '--cross': level % 2 } as CSSProperties}>
    {[0, 1, 2].map(column => <span key={column} className={`jenga-preview__piece${level === 2 && column === 1 ? ' jenga-preview__block' : ''}`}
      style={{ '--column': column } as CSSProperties}>
      <span className="jenga-preview__face jenga-preview__face--front" />
      <span className="jenga-preview__face jenga-preview__face--side" />
      <span className="jenga-preview__face jenga-preview__face--left" />
      <span className="jenga-preview__face jenga-preview__face--top" />
    </span>)}
  </span>;

  return <button ref={button} type="button" className="people-tower-button" disabled={disabled} onClick={onClick}
    aria-labelledby="people-tower-button-title" aria-describedby="people-tower-button-description"
    data-animating={visible && !hidden && !paused && !disabled}>
    <span className="people-tower-button__copy">
      <span className="people-tower-button__eyebrow"><span /> A little balance. A lot of us.</span>
      <span className="people-tower-button__title">Your <em>move.</em></span>
      <span id="people-tower-button-description" className="people-tower-button__description">Pull a block. Meet a mind.<br />Get to know the team, one piece at a time.</span>
      <span className="people-tower-button__cta"><span id="people-tower-button-title">Play Interactive Tower</span><ArrowUpRight size={18} strokeWidth={1.8} /></span>
    </span>
    <span className="jenga-preview" aria-hidden="true">
      <span className="jenga-preview__caption">THE NUCLEUS TOWER <span>01—18</span></span>
      <span className="jenga-preview__ground" />
      <span className="jenga-preview__stack">
        <span className="jenga-preview__upper">
          {[3, 4, 5].map(level => row(level, true))}
        </span>
        {[0, 1, 2].map(level => row(level))}
      </span>
      <span className="jenga-preview__hint">ONE BLOCK. YOUR NEXT CONNECTION.</span>
    </span>
  </button>;
}
