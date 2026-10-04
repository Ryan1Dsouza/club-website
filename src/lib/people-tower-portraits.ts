import type { Member } from '../types';
import variants from './team-portraits.json';

export type TowerPortraits = ReturnType<typeof createTowerPortraits>;

/** Keep only the current, previous and next two portraits decoded. A bounded
 * queue avoids competing downloads/decodes on older phones. The actual decoded
 * image is moved into the banner, so revealing it does not start another load. */
export function createTowerPortraits(members: Member[], small: boolean) {
  type Portrait = { image: HTMLImageElement; source: string; loaded: boolean; started: boolean };
  const cache = new Map<number, Portrait>();
  let wanted: number[] = [], inFlight = 0, disposed = false, active = -1;
  let host: HTMLElement | undefined;

  function attach(index: number, portrait: Portrait) {
    if (!disposed && active === index && portrait.loaded && cache.get(index) === portrait && host) {
      host.querySelector('.tower-profile__photo')?.remove();
      host.insertBefore(portrait.image, host.querySelector('.tower-profile__photo-fade'));
    }
  }
  function pump() {
    if (disposed) return;
    for (const index of wanted) {
      if (inFlight >= 2) break;
      const portrait = cache.get(index);
      if (!portrait || portrait.started) continue;
      portrait.started = true; inFlight++;
      const image = portrait.image;
      image.fetchPriority = index === wanted[0] ? 'high' : 'low';
      image.src = portrait.source;
      void image.decode().then(() => {
        portrait.loaded = true; attach(index, portrait);
      }).catch(() => {
        // Missing or unsupported portraits leave the member's initials visible.
      }).finally(() => {
        inFlight--;
        if (disposed || cache.get(index) !== portrait) image.removeAttribute('src');
        pump();
      });
    }
  }
  function prepare(index: number) {
    if (disposed) return;
    const next = [index, index + 1, index + 2, index - 1]
      .filter(value => value >= 0 && value < members.length);
    if (next.length === wanted.length && next.every((value, i) => value === wanted[i])) return;
    wanted = next;
    for (const [key, portrait] of cache) {
      if (wanted.includes(key)) continue;
      // Let an in-flight decode finish before dropping its source; aborting it
      // would allow a fast scrub to repeatedly restart the same download.
      if (portrait.loaded) portrait.image.removeAttribute('src');
      cache.delete(key);
    }
    for (const key of wanted) {
      const source = members[key].image;
      if (!source || cache.has(key)) continue;
      const bundled = (variants as Record<string, { small: string; large: string }>)[source];
      const image = new Image();
      image.className = 'tower-profile__photo'; image.alt = '';
      image.loading = 'eager'; image.decoding = 'async';
      cache.set(key, { image, source: bundled?.[small ? 'small' : 'large'] ?? source, loaded: false, started: false });
    }
    pump();
  }
  function show(index: number, element: HTMLElement) {
    active = index; host = element;
    host.querySelector('.tower-profile__photo')?.remove();
    prepare(index);
    const portrait = cache.get(index);
    if (portrait) attach(index, portrait);
  }
  function dispose() {
    disposed = true; host = undefined;
    for (const { image } of cache.values()) { image.remove(); image.removeAttribute('src'); }
    cache.clear(); wanted = [];
  }
  return { prepare, show, dispose };
}
