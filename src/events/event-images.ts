import type { EventPhoto } from '../types';
import manifest from './workshop-images.json';
import { preloadImage } from '../lib/preload-image';
import { storageImageAttributes } from '../lib/responsive-images';

type DisplayPhoto = { images: { url: string; width: number }[]; preview: string };
export type EventImageLayout = 'card' | 'mobile' | 'spread';
const sizes = {
  card: '(max-width: 620px) 100vw, (max-width: 900px) 50vw, 440px',
  mobile: '100vw',
  spread: '(max-width: 1540px) 50vw, 770px',
};

export function eventImageAttributes(photo: EventPhoto, layout: EventImageLayout) {
  const display = (manifest as Record<string, DisplayPhoto>)[photo.id];
  if (!display) return { ...storageImageAttributes(photo.url, [320, 640, 960, 1440], sizes[layout]), style: undefined };
  return {
    srcSet: display?.images.map(image => `${image.url} ${image.width}w`).join(', '),
    sizes: display ? sizes[layout] : undefined,
    style: display ? { backgroundImage: `url("${display.preview}")` } : undefined,
  };
}

export function preloadEventPhotos(photos: EventPhoto[], layout: EventImageLayout, urgent = 1) {
  photos.forEach((photo, index) => {
    const { srcSet, sizes } = eventImageAttributes(photo, layout);
    preloadImage({ src: photo.url, srcSet, sizes, priority: index < urgent ? 'high' : 'low' });
  });
}
