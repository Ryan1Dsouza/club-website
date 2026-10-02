// Keep a brief intro without waiting for a complete artwork loop.
export const LOADER_MINIMUM_MS = 400;
export const LOADER_MAXIMUM_MS = 1500;

const assets = import.meta.glob<string>('../../assets/loading/frame-*.webp', {
  eager: true, query: '?url', import: 'default',
});
export const LOADING_FRAME_URLS = Object.keys(assets).sort().map(key => assets[key]);

let prepared: Promise<string[]> | undefined;

/** Cache decoded artwork across overlay mounts, including Strict Mode. */
export function prepareLoadingFrames() {
  return prepared ??= Promise.all(LOADING_FRAME_URLS.map(async url => {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    try { await image.decode(); return url; }
    catch { return ''; }
  })).then(frames => {
    // A failed image must not introduce a blank beat in an otherwise ready loop.
    const fallback = frames.find(Boolean);
    return fallback ? frames.map(frame => frame || fallback) : [];
  });
}
