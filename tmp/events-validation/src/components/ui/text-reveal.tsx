"use client";

import { createElement, useEffect, useMemo, useRef, type HTMLAttributes } from 'react';
import { clampProgress, observeScroll } from '../../lib/scroll-effects';
import './text-reveal.css';

export interface TextRevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  text: string;
  mode?: 'letter' | 'word';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  delay?: number;
  stagger?: number;
  duration?: number;
  blur?: string;
  y?: number;
  /** False ties the stagger to scroll position, including reverse scrolling. */
  once?: boolean;
}

/** The same reversible stagger, with plain spans and updates only while scrolling. */
export function TextReveal({
  text, mode = 'letter', as = 'span', delay = .1, stagger = .025,
  duration = .5, blur = '8px', y = 10, once = false, className, ...props
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  useEffect(() => {
    const root = ref.current!;
    const units = Array.from(root.querySelectorAll<HTMLElement>('.text-reveal__unit'));
    const total = Math.max(.01, delay + duration + Math.max(0, units.length - 1) * stagger);
    const pixels = Math.min(8, Math.max(0, parseFloat(blur) || 0));
    let held = 0, previous = -1;
    return observeScroll(root, ({ top, viewport, reduced }) => {
      if (root.dataset.revealReady !== String(!reduced)) root.dataset.revealReady = String(!reduced);
      const current = clampProgress((viewport * .99 - top) / (viewport * .13));
      held = once ? Math.max(held, current) : current;
      const progress = reduced ? 1 : held;
      if (progress === previous) return;
      previous = progress;
      units.forEach((unit, index) => {
        const amount = clampProgress((progress * total - delay - index * stagger) / Math.max(.01, duration));
        unit.style.opacity = String(1 - (1 - amount) ** 2);
        unit.style.filter = amount === 1 ? 'none' : `blur(${((1 - amount) * pixels).toFixed(2)}px)`;
        unit.style.transform = amount === 1 ? 'none' : `translateY(${((1 - amount) * y).toFixed(2)}px)`;
      });
    });
  }, [text, mode, delay, stagger, duration, blur, y, once]);

  return createElement(as, { ...props, ref, className: `text-reveal${className ? ` ${className}` : ''}`, 'data-text-reveal': '', 'data-reveal-ready': 'false' },
    <span className="sr-only">{text}</span>,
    <span aria-hidden="true">{words.map((word, wordIndex) => /^\s*$/.test(word) ? word : <span className="text-reveal__word" key={wordIndex}>
      {(mode === 'word' ? [word] : Array.from(word)).map((unit, index) => <span className="text-reveal__unit" key={index}>{unit}</span>)}
    </span>)}</span>,
  );
}
