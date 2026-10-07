type ImageRequest = { src: string; srcSet?: string; sizes?: string; priority?: 'high' | 'low' };
const cache = new Map<string, HTMLImageElement>();

/** Retain a small decoded window across hover, opening and reverse navigation. */
export function preloadImage({ src, srcSet, sizes, priority = 'low' }: ImageRequest) {
  if (typeof Image === 'undefined') return;
  const key = `${srcSet ?? src}|${sizes ?? ''}`;
  const existing = cache.get(key);
  if (existing) {
    if (priority === 'high') existing.fetchPriority = 'high';
    cache.delete(key); cache.set(key, existing);
    return;
  }
  const image = new Image();
  image.decoding = 'async'; image.fetchPriority = priority;
  if (sizes) image.sizes = sizes;
  if (srcSet) image.srcset = srcSet;
  image.src = src;
  cache.set(key, image);
  void image.decode().catch(() => { if (cache.get(key) === image) cache.delete(key); });
  // Let evicted requests finish in the HTTP cache without retaining their bitmap.
  while (cache.size > 16) cache.delete(cache.keys().next().value!);
}
