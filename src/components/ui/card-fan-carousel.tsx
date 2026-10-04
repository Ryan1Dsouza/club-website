import { useState, useEffect, useRef, useCallback, useMemo, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
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
  { rot: -21, scale: .7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: .8498, x: -22, y: 4, zIndex: 2 },
  { rot: -7, scale: .9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1, x: 0, y: 0, zIndex: 10 },
  { rot: 7, scale: .9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: .8498, x: 22, y: 4, zIndex: 2 },
  { rot: 21, scale: .7756, x: 30, y: 7.3, zIndex: 1 },
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
  return { rot: distance * 21, scale: 1 - .2244 * distance ** 2, x: distance * 30, y: distance ** 2 * 7.3, zIndex: 10 - Math.abs(slot - center) };
}

/** The supplied GSAP fan, with bounded image mounting and idle-only autoplay. */
export default function SocialCards({ cards, activeIndex, onActiveIndexChange, onCardClick, autoPlayInterval = 3000, paused = false }: SocialCardsProps) {
  const root = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef<'left' | 'right'>('right');
  const prevVisible = useRef(new Set<number>());
  const [internalIndex, setInternalIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manualPause, setManualPause] = useState(false);
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

  const cycle = useCallback((direction: 'left' | 'right') => {
    if (isAnimating.current || totalCards < 2) return;
    directionRef.current = direction;
    const next = (centerIndex + (direction === 'right' ? 1 : -1) + totalCards) % totalCards;
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

  const playing = totalCards > 1 && !paused && !manualPause && !hidden && reduced === false && visible;
  useEffect(() => {
    if (!playing || autoPlayInterval <= 0) return;
    const timer = window.setInterval(() => cycle('right'), autoPlayInterval);
    return () => window.clearInterval(timer);
  }, [playing, autoPlayInterval, cycle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards || reduced === null) return;
    const elements = Array.from(container.querySelectorAll<HTMLElement>('.fan-card'));
    const previous = prevVisible.current;
    const first = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(container.clientWidth);
    const heightMultiplier = getHeightMultiplier(container.clientWidth);
    let hoverSlot: number | null = null;
    let completed = 0;
    const done = () => {
      if (++completed < visibleMap.size) return;
      isAnimating.current = false;
      hasEntered.current = true;
      setSettledMap(visibleMap);
    };
    isAnimating.current = !reduced;
    {
      for (const element of elements) {
        const index = Number(element.dataset.index);
        const slot = visibleMap.get(index);
        if (slot === undefined) {
          gsap.to(element, { x: `${(directionRef.current === 'right' ? -40 : 40) * multiplier}rem`, opacity: 0, scale: .5, duration: reduced ? 0 : .3, ease: 'power2.in' });
          continue;
        }
        const { x, y, rot, scale, zIndex } = getSlotConfig(slotCount, slot);
        const target = { x: `${x * multiplier}rem`, y: `${y * heightMultiplier}rem`, rotation: rot, scale, opacity: 1, zIndex };
        if (reduced) { gsap.set(element, target); done(); }
        else if (first) {
          gsap.set(element, { x: 0, y: `${12 * heightMultiplier}rem`, rotation: 0, scale: .5, opacity: 0 });
          gsap.to(element, { ...target, duration: .85, ease: 'elastic.out(1.05,.78)', delay: slot * .04, onComplete: done });
        } else if (!previous.has(index)) {
          gsap.set(element, { x: `${(directionRef.current === 'right' ? 40 : -40) * multiplier}rem`, y: `${y * heightMultiplier}rem`, rotation: directionRef.current === 'right' ? 30 : -30, scale: .5, opacity: 0 });
          gsap.to(element, { ...target, duration: .5, ease: 'power2.out', onComplete: done });
        } else gsap.to(element, { ...target, duration: .45, ease: 'power2.out', onComplete: done });
      }
    }
    prevVisible.current = new Set(visibleMap.keys());

    const hoverLayout = (active: number | null, immediate = false) => {
      const mult = getResponsiveMultiplier(container.clientWidth);
      const height = getHeightMultiplier(container.clientWidth);
      const center = slotCount >> 1;
      for (const element of elements) {
        const slot = visibleMap.get(Number(element.dataset.index));
        if (slot === undefined) continue;
        const base = getSlotConfig(slotCount, slot);
        let x = base.x * mult, y = base.y * height, rot = base.rot, scale = base.scale;
        if (active !== null) {
          if (active === slot) { y -= 2.5 * height; scale *= 1.08; }
          else {
            const distance = Math.abs(slot - active);
            const normalized = center ? (slot - center) / center : 0;
            const push = 8 * (1 - Math.abs(normalized)) * (1 + .2 * Math.max(0, 3 - distance));
            x += (slot < active ? -1 : 1) * push * mult;
            rot += (slot < active ? -3 : 3) / (distance + 1);
          }
        }
        gsap.to(element, { x: `${x}rem`, y: `${y}rem`, rotation: rot, scale, opacity: 1, zIndex: active === slot ? 20 : base.zIndex, duration: reduced || immediate ? 0 : .4, ease: 'elastic.out(1,.75)', overwrite: 'auto' });
      }
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || isAnimating.current || reduced) return;
      const element = (event.target as Element).closest<HTMLElement>('.fan-card');
      const slot = element ? visibleMap.get(Number(element.dataset.index)) : undefined;
      if (slot === undefined || slot === hoverSlot) return;
      hoverSlot = slot; hoverLayout(slot);
    };
    const leave = () => { hoverSlot = null; if (!isAnimating.current) hoverLayout(null); };
    const resize = () => {
      // Always settle after rotation, even if it interrupts the entry animation.
      isAnimating.current = false; hasEntered.current = true;
      gsap.killTweensOf(elements);
      hoverLayout(null, true);
      setSettledMap(visibleMap);
    };
    container.addEventListener('pointerover', enter);
    container.addEventListener('pointerleave', leave);
    window.addEventListener('resize', resize);
    return () => {
      container.removeEventListener('pointerover', enter);
      container.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
      gsap.killTweensOf(elements);
      // Keep the current transforms between cycles so the next tween starts
      // where the card is. React removes the inline styles on unmount.
      isAnimating.current = false;
    };
  }, [centerIndex, totalCards, visibleMap, slotCount, reduced]);

  if (!totalCards) return <section ref={root}><p className="fan-empty">The team will be announced here soon.</p></section>;
  return <section ref={root} className="fan-carousel" aria-label="Team members" aria-roledescription="carousel"
    data-active-index={centerIndex} data-autoplay={playing ? 'playing' : 'paused'}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
    onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(event.key === 'ArrowRight' ? 'right' : 'left'); }
    }}>
    <div className="fan-viewport">
      <div ref={containerRef} className="fan-layout" data-settled={settled}>
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
      <button className="fan-arrow" onClick={() => cycle('left')} disabled={totalCards < 2} aria-label="Previous team member"><ArrowLeft size={18} /></button>
      <span className="fan-counter" aria-live={playing ? 'off' : 'polite'}><strong>{String(centerIndex + 1).padStart(2, '0')}</strong><span>/ {String(totalCards).padStart(2, '0')}</span></span>
      <button className="fan-arrow" onClick={() => cycle('right')} disabled={totalCards < 2} aria-label="Next team member"><ArrowRight size={18} /></button>
      <button className="fan-pause" disabled={reduced !== false || totalCards < 2} aria-label={manualPause ? 'Start automatic rotation' : 'Pause automatic rotation'} aria-pressed={manualPause || reduced === true} onClick={() => setManualPause(value => !value)}>{manualPause || reduced ? <Play size={14} /> : <Pause size={14} />}</button>
    </div>
    <p className="fan-hint">Choose a card to meet the person behind it.</p>
  </section>;
}
