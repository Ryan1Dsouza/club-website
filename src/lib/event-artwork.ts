import type { CSSProperties } from 'react';

export function eventCategoryHash(category: string) {
  let hash = 2166136261;
  for (const char of category.toLowerCase()) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash;
}

export function eventArtwork(category: string): CSSProperties {
  const hash = eventCategoryHash(category);
  return { '--event-hue': hash % 360, '--event-angle': `${25 + hash % 130}deg` } as CSSProperties;
}

export function eventTheme(category: string) {
  const hash = eventCategoryHash(category), hue = hash % 360;
  return {
    background: `hsl(${hue}, 36%, 12%)`,
    panel: `hsl(${hue}, 34%, 23%)`,
    accent: `hsl(${hue}, 52%, 77%)`,
    variant: hash % 3,
  };
}
