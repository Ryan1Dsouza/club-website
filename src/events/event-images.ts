import type { EventPhoto } from '../types';
import manifest from './workshop-images.json';
import { preloadImage } from '../lib/preload-image';

type DisplayPhoto = { images: { url: string; width: number }[]; preview: string };
export type EventImageLayout = 'card' | 'mobile' | 'spread';

export function eventImageAttributes(photo: EventPhoto, layout: EventImageLayout) {
  const display = (manifest as Record<string, DisplayPhoto>)[photo.id];
  if (!display) {
    return { srcSet: undefined, sizes: undefined, style: undefined };
  }

  const srcSet = display.images.map(img => `${img.url} ${img.width}w`).join(', ');
  
  let sizes;
  if (layout === 'card') {
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';
  } else if (layout === 'mobile') {
    sizes = '100vw';
  } else {
    sizes = '(max-width: 800px) 100vw, 50vw';
  }

  return {
    srcSet,
    sizes,
    style: { backgroundImage: `url("${display.preview}")` },
  };
}

export function preloadEventPhotos(photos: EventPhoto[], layout: EventImageLayout, urgent = 1) {
  photos.forEach((photo, index) => {
    const { srcSet, sizes } = eventImageAttributes(photo, layout);
    preloadImage({ src: photo.url, srcSet, sizes, priority: index < urgent ? 'high' : 'low' });
  });
}
