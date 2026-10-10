import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { sfx } from '../../lib/sound-effects';
import './card-fan-carousel.css';

export interface CardItem {
  id: string;
  imgUrl?: string;
  alt?: string;
  linkUrl?: string;
  name: string;
  role?: string;
  initials?: string;
}
interface SocialCardsProps {
  cards: CardItem[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onCardClick?: (card: CardItem, index: number) => void;
  autoPlayInterval?: number;
  paused?: boolean;
}
const MAX_VISIBLE = 7;
const FAN_POSITIONS = [
  { rot: -21, scale: .7756, x: -30, y: 7.3 },
  { rot: -14, scale: .8498, x: -22, y: 4 },
  { rot: -7, scale: .9346, x: -11, y: 1.3 },
  { rot: 0, scale: 1, x: 0, y: 0 },
  { rot: 7, scale: .9346, x: 11, y: 1.3 },
  { rot: 14, scale: .8498, x: 22, y: 4 },
  { rot: 21, scale: .7756, x: 30, y: 7.3 },
];
function getResponsiveMultiplier(width: number) {
  return width < 480 ? .28 : width < 640 ? .38 : width < 768 ? .5 : width < 1024 ? .75 : 1;
}
function getHeightMultiplier(width: number) {
  const ideal = (width < 480 ? 22 : width < 640 ? 26 : width < 768 ? 28 : width < 1024 ? 34 : 38) * 16;
  return Math.min(1, window.innerHeight * .7 / ideal);
}
function getSlotConfig(count: number, slot: number) {
  if (count >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = count >> 1;
  const distance = count > 1 ? (slot - center) / center : 0;
  return { rot: distance * 21, scale: 1 - .2244 * distance ** 2, x: distance * 30, y: distance ** 2 * 7.3 };
}
function getCardPose(count: number, slot: number, width: number, height: number) {
  const { x, y, rot, scale } = getSlotConfig(count, slot);
  // Tilting away from the center lets overlapping card planes pass gradually.
  // A stepped z-index would replace the entire overlap in a single frame.
  const depth = rot / 7;
  // Keep hit-test ranks in sync as well: Chromium can otherwise target a back
  // card's flattened contents even though it paints the front card above it.
  return { x: `${x * width}rem`, y: `${y * height}rem`, z: -12 * depth ** 2, rotation: rot, rotationY: -depth * 6, scale, opacity: 1, zIndex: 10 - Math.abs(depth) };
}

/** Continuous motion with only the visible fan and outgoing card mounted. */
export default function SocialCards({ cards, activeIndex, onActiveIndexChange, onCardClick, autoPlayInterval = 3600, paused = false }: SocialCardsProps) {
  const root = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<'left' | 'right'>('right');
  const prevVisible = useRef(new Set<number>());
  const motion = useRef<{ timeline: gsap.core.Timeline; kind: 'entry' | 'auto' | 'manual' } | null>(null);
  const requestedMotion = useRef<{ index: number; kind: 'auto' | 'manual' } | null>(null);
  const [internalIndex, setInternalIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [settledMap, setSettledMap] = useState(new Map<number, number>());
  const totalCards = cards.length;
  const centerIndex = totalCards ? ((activeIndex ?? internalIndex) % totalCards + totalCards) % totalCards : 0;
  const slotCount = Math.min(MAX_VISIBLE, totalCards);
  const visibleMap = useMemo(() => {
    const map = new Map<number, number>();
    for (let slot = 0; slot < slotCount; slot++) map.set((centerIndex + slot - (slotCount >> 1) + totalCards) % totalCards, slot);
    return map;
  }, [centerIndex, totalCards, slotCount]);
  // Keep only the visible fan plus the outgoing card during a transition.
  const mounted = new Set([...visibleMap.keys(), ...settledMap.keys()]);
  const settled = settledMap === visibleMap;

  const cycle = useCallback((direction: 'left' | 'right', automatic = false) => {
    // A deliberate selection can interrupt autoplay, including a frozen frame.
    if (totalCards < 2 || (isAnimating.current && (automatic || motion.current?.kind !== 'auto'))) return;
    if (!automatic) sfx.cardFan();
    directionRef.current = direction;
    const next = (centerIndex + (direction === 'right' ? 1 : -1) + totalCards) % totalCards;
    requestedMotion.current = { index: next, kind: automatic ? 'auto' : 'manual' };
    isAnimating.current = true;
    if (activeIndex === undefined) setInternalIndex(next);
    onActiveIndexChange?.(next);
  }, [activeIndex, centerIndex, totalCards, onActiveIndexChange]);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    if (root.current) observer.observe(root.current);
    preference(); visibility();
    media.addEventListener('change', preference);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  const suspended = paused || hidden || !visible;
  const playing = totalCards > 1 && autoPlayInterval > 0 && !suspended && reduced === false;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards || reduced === null) return;
    const elements = Array.from(container.querySelectorAll<HTMLElement>('.fan-card'));
    const previous = prevVisible.current;
    const first = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(container.clientWidth);
    const heightMultiplier = getHeightMultiplier(container.clientWidth);
    const kind = first ? 'entry' : requestedMotion.current?.index === centerIndex ? requestedMotion.current.kind : 'manual';
    requestedMotion.current = null;
    const duration = kind === 'auto' ? autoPlayInterval / 1000 : .65;
    // The wheel keeps moving at a steady pace through successive passes.
    const ease = kind === 'auto' ? 'none' : 'power3.inOut';
    const edgePose = (side: number) => ({
      x: `${side * 40 * multiplier}rem`, y: `${12.5 * heightMultiplier}rem`,
      z: -192, rotation: side * 28, rotationY: -side * 24, scale: .66, opacity: 0, zIndex: 0,
    });
    const done = () => {
      isAnimating.current = false;
      hasEntered.current = true;
      setSettledMap(visibleMap);
    };
    const timeline = gsap.timeline({ paused: true, onComplete: done });
    motion.current = { timeline, kind };
    isAnimating.current = !reduced;
    {
      for (const element of elements) {
        const index = Number(element.dataset.index);
        const slot = visibleMap.get(index);
        if (slot === undefined) {
          timeline.to(element, { ...edgePose(directionRef.current === 'right' ? -1 : 1), duration: reduced ? 0 : duration, ease }, 0);
          continue;
        }
        const target = getCardPose(slotCount, slot, multiplier, heightMultiplier);
        if (reduced) gsap.set(element, target);
        else if (first) {
          gsap.set(element, { x: 0, y: `${12 * heightMultiplier}rem`, z: -192, rotation: 0, rotationY: 0, scale: .66, opacity: 0 });
          timeline.to(element, { ...target, duration: 1, ease: 'power3.out' }, slot * .035);
        } else if (!previous.has(index)) {
          gsap.set(element, edgePose(directionRef.current === 'right' ? 1 : -1));
          timeline.to(element, { ...target, duration, ease }, 0);
        } else timeline.to(element, { ...target, duration, ease }, 0);
      }
    }
    prevVisible.current = new Set(visibleMap.keys());

    const resize = () => {
      timeline.kill();
      const mult = getResponsiveMultiplier(container.clientWidth);
      const height = getHeightMultiplier(container.clientWidth);
      for (const element of elements) {
        const slot = visibleMap.get(Number(element.dataset.index));
        if (slot === undefined) continue;
        gsap.set(element, getCardPose(slotCount, slot, mult, height));
      }
      done();
    };
    if (reduced) done();
    else timeline.play();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      timeline.kill();
      motion.current = null;
      // Keep the current transforms between cycles so the next tween starts
      // where the card is. React removes the inline styles on unmount.
      isAnimating.current = false;
    };
  }, [centerIndex, totalCards, visibleMap, slotCount, reduced, autoPlayInterval]);

  useLayoutEffect(() => {
    const current = motion.current;
    if (!current) return;
    // Pause the existing playhead; rebuilding a tween here would snap the fan.
    current.timeline.paused(current.kind === 'manual' ? hidden || !visible : current.kind === 'entry' ? suspended : !playing);
  }, [playing, suspended, hidden, visible, centerIndex, reduced, settledMap, autoPlayInterval]);

  useEffect(() => {
    // Each completed pass starts the next immediately, with no interval or dwell.
    if (playing && hasEntered.current && !isAnimating.current) cycle('right', true);
  }, [playing, cycle, settledMap]);

  if (!totalCards) return <section ref={root}><p className="fan-empty">The team will be announced here soon.</p></section>;
  return <section ref={root} className="fan-carousel" aria-label="Team members" aria-roledescription="carousel"
    data-active-index={centerIndex} data-autoplay={playing ? 'playing' : 'paused'}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(event.key === 'ArrowRight' ? 'right' : 'left'); }
    }}>
    <div className="fan-viewport">
      <div ref={containerRef} className="fan-layout" data-settled={settled} data-ready={hasEntered.current}>
        {cards.map((card, index) => {
          if (!mounted.has(index)) return null;
          const slot = visibleMap.get(index);
          const current = slot !== undefined;
          const content = <>
            <span className="fan-card__initials" aria-hidden="true">{card.initials || card.name.charAt(0)}</span>
            {card.imgUrl && <img src={card.imgUrl} alt={card.alt ?? ''} loading="eager" decoding="async"
              onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />}
            <span className="fan-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="fan-card__caption"><span>{card.role}</span><strong>{card.name}</strong><span className="fan-card__invitation">Meet {card.name.split(' ')[0]} <span aria-hidden="true">↗</span></span></span>
          </>;
          const props = {
            className: 'fan-card', 'data-index': index, 'data-active': index === centerIndex,
            'aria-hidden': !current, inert: !current, tabIndex: index === centerIndex ? 0 : -1,
            style: { '--fan-slot': slot ?? 0 } as CSSProperties,
          };
          return card.linkUrl && !onCardClick
            ? <a {...props} key={card.id} href={card.linkUrl} target={card.linkUrl.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{content}</a>
            : <button {...props} key={card.id} type="button" aria-label={`View ${card.name}, ${card.role ?? 'team member'}`} onClick={() => onCardClick?.(card, index)}>{content}</button>;
        })}
      </div>
    </div>
    <div className="fan-controls">
      <button className="fan-arrow" data-sound="none" onClick={() => cycle('left')} disabled={totalCards < 2} aria-label="Previous team member"><ArrowLeft size={18} /></button>
      <span className="fan-counter" aria-live={playing ? 'off' : 'polite'}><strong>{String(centerIndex + 1).padStart(2, '0')}</strong><span>/ {String(totalCards).padStart(2, '0')}</span></span>
      <button className="fan-arrow" data-sound="none" onClick={() => cycle('right')} disabled={totalCards < 2} aria-label="Next team member"><ArrowRight size={18} /></button>
    </div>
    <p className="fan-hint">Choose a card to meet the person behind it.</p>
  </section>;
}
