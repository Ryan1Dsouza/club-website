// Keep a brief intro without waiting for a complete artwork loop.
export const LOADER_MINIMUM_MS = 1400;
export const LOADER_MAXIMUM_MS = 1500;

const assets = import.meta.glob<string>('../../assets/loading/frame-*.webp', {
  eager: true, query: '?url', import: 'default',
});
export const LOADING_FRAME_URLS = Object.keys(assets).sort().map(key => assets[key]);

let prepared: Promise<string[]> | undefined;

/** Cache decoded artwork across overlay mounts, including Strict Mode. */
export function prepareLoadingFrames() {
  if (prepared) return prepared;
  const urls = LOADING_FRAME_URLS;
  const frames = Array<string>(urls.length).fill('');
  let next = 0;
  // Avoid starting 17 image decodes together during hydration on a phone.
  const worker = async () => {
    while (next < urls.length) {
      const index = next++;
      const image = new Image();
      image.decoding = 'async';
      image.src = urls[index];
      try { await image.decode(); frames[index] = urls[index]; }
      catch { /* Substitute a decoded frame below. */ }
    }
  };
  const ready = Promise.all([worker(), worker()]).then(() => {
    // A failed image must not introduce a blank beat in an otherwise ready loop.
    const fallback = frames.find(Boolean);
    return fallback ? frames.map(frame => frame || fallback) : [];
  });
  return prepared = ready;
}
