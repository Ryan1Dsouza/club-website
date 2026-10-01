"use client";

import { useEffect, useRef } from 'react';

export function MorphingText({ texts, className = '', active = true }: { texts: string[]; className?: string; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLSpanElement>(null);
  const second = useRef<HTMLSpanElement>(null);
  const key = texts.join('\u0000');
  useEffect(() => {
    const words = key.split('\u0000');
    const a = first.current!, b = second.current!;
    const layers = a.parentElement!;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hold = 2.6, morph = .45, cycle = hold + morph;
    let frame = 0, timer = 0, elapsed = 0, visible = true;
    let startedAt: number | null = null;
    let lastIndex = -1, lastFraction = -1;
    const paint = (fraction: number, index: number) => {
      if (lastIndex === index && lastFraction === fraction) return;
      if (lastIndex !== index) {
        a.textContent = words[index % words.length]; b.textContent = words[(index + 1) % words.length];
        lastIndex = index;
      }
      lastFraction = fraction;
      // Held words need no animation loop or DOM writes.
      if (fraction === 0) {
        layers.style.filter = 'none';
        a.style.filter = b.style.filter = 'none';
        a.style.opacity = '1'; b.style.opacity = '0';
        a.style.transform = b.style.transform = 'none';
        layers.style.willChange = 'auto';
        return;
      }
      // A sharp hand-off keeps letters distinct instead of blurring two words together.
      a.style.opacity = String(Math.max(0, 1 - fraction * 2));
      b.style.opacity = String(Math.max(0, fraction * 2 - 1));
      a.style.transform = `translateY(${Math.round(-fraction * 8)}px)`;
      b.style.transform = `translateY(${Math.round((1 - fraction) * 8)}px)`;
    };
    const animate = (now: number) => {
      if (startedAt === null) return;
      const time = elapsed + (now - startedAt) / 1000;
      const index = Math.floor(time / cycle), phase = time % cycle;
      const progress = Math.max(0, (phase - hold) / morph);
      paint(progress * progress * progress * (progress * (progress * 6 - 15) + 10), index);
      // A held word needs no animation loop. Resume only when its morph begins.
      if (phase < hold) timer = window.setTimeout(() => { frame = requestAnimationFrame(animate); }, (hold - phase) * 1000);
      else frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame); clearTimeout(timer);
      const now = performance.now();
      if (startedAt !== null) elapsed += (now - startedAt) / 1000;
      startedAt = null;
      if (!active || media.matches) { elapsed = 0; paint(0, 0); return; }
      if (visible && !document.hidden && words.length > 1) {
        startedAt = now;
        frame = requestAnimationFrame(animate);
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (ref.current) observer.observe(ref.current);
    sync(); media.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); startedAt = null; observer.disconnect(); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, [key, active]);
  return <div ref={ref} className={`mu-morph-wrap ${className}`} role="group" aria-label={texts.join('. ')}>
    <div className="mu-morph-layers" aria-hidden="true"><span className="mu-layer" ref={first}>{texts[0]}</span><span className="mu-layer" ref={second} style={{ opacity: 0 }}>{texts[1]}</span></div>
  </div>;
}
