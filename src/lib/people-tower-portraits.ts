import type { Member } from '../types';
import variants from './team-portraits.json';

export type TowerPortraits = ReturnType<typeof createTowerPortraits>;

/** Small portraits arrive first; only the active desktop portrait upgrades.
 * Obsolete downloads cannot occupy both slots after a fast jump or reversal. */
export function createTowerPortraits(members: Member[], small: boolean) {
  type Request = { image: HTMLImageElement; source: string; loaded: boolean; started: boolean; cancelled: boolean };
  type Portrait = { thumbnail: Request; full?: Request; preview?: string };
  const cache = new Map<number, Portrait>();
  const pending = new Set<Request>();
  let wanted: number[] = [], disposed = false, active = -1;
  let host: HTMLElement | undefined;

  function request(source: string): Request {
    const image = new Image();
    image.className = 'tower-profile__photo'; image.alt = '';
    image.loading = 'eager'; image.decoding = 'async';
    return { image, source, loaded: false, started: false, cancelled: false };
  }
  function cancel(item: Request) {
    item.cancelled = true;
    item.image.removeAttribute('src');
    pending.delete(item);
  }
  function attach(index: number, portrait: Portrait) {
    if (disposed || active !== index || cache.get(index) !== portrait || !host) return;
    const ready = portrait.full?.loaded ? portrait.full : portrait.thumbnail.loaded ? portrait.thumbnail : undefined;
    if (!ready || host.querySelector('.tower-profile__photo') === ready.image) return;
    host.querySelector('.tower-profile__photo')?.remove();
    host.insertBefore(ready.image, host.querySelector('.tower-profile__photo-fade'));
  }
  function start(index: number, portrait: Portrait, item: Request) {
    item.started = true; pending.add(item);
    const image = item.image;
    image.fetchPriority = index === wanted[0] ? 'high' : 'low';
    image.src = item.source;
    void image.decode().then(() => {
      if (item.cancelled || disposed || cache.get(index) !== portrait) return;
      item.loaded = true; attach(index, portrait);
    }).catch(() => {
      // Keep the correct tiny preview (or initials for unbundled photos).
    }).finally(() => {
      pending.delete(item);
      if (disposed || cache.get(index) !== portrait) image.removeAttribute('src');
      pump();
    });
  }
  function pump() {
    if (disposed) return;
    for (const index of wanted) {
      const portrait = cache.get(index);
      if (!portrait || portrait.thumbnail.started) continue;
      if (pending.size >= 2) break;
      start(index, portrait, portrait.thumbnail);
    }
    const portrait = cache.get(active);
    if (pending.size < 2 && portrait?.thumbnail.loaded && portrait.full && !portrait.full.started) start(active, portrait, portrait.full);
  }
  function prepare(index: number) {
    if (disposed) return;
    const next = [index, index + 1, index + 2, index + 3, index - 1, index - 2]
      .filter(value => value >= 0 && value < members.length);
    if (next.length === wanted.length && next.every((value, i) => value === wanted[i])) return;
    wanted = next;
    for (const [key, portrait] of cache) {
      if (wanted.includes(key)) {
        portrait.thumbnail.image.fetchPriority = key === index ? 'high' : 'low';
        // An old high-resolution upgrade must yield to the newly selected face.
        if (key !== index && portrait.full && pending.has(portrait.full)) {
          const source = portrait.full.source; cancel(portrait.full); portrait.full = request(source);
        }
        continue;
      }
      cancel(portrait.thumbnail);
      if (portrait.full) cancel(portrait.full);
      cache.delete(key);
    }
    for (const key of wanted) {
      const source = members[key].image;
      if (!source || cache.has(key)) continue;
      const bundled = (variants as Record<string, { small: string; large: string; preview?: string }>)[source];
      const thumbnail = request(bundled?.small ?? source);
      const full = !small && bundled && bundled.large !== bundled.small ? request(bundled.large) : undefined;
      cache.set(key, { thumbnail, full, preview: bundled?.preview });
    }
    pump();
  }
  function show(index: number, element: HTMLElement) {
    active = index; host = element;
    host.querySelector('.tower-profile__photo')?.remove();
    prepare(index);
    const portrait = cache.get(index);
    if (portrait?.preview) {
      const preview = new Image();
      preview.className = 'tower-profile__photo'; preview.alt = '';
      preview.dataset.preview = 'true'; preview.src = portrait.preview;
      host.insertBefore(preview, host.querySelector('.tower-profile__photo-fade'));
    }
    if (portrait) attach(index, portrait);
    pump();
  }
  function dispose() {
    disposed = true; host = undefined;
    for (const portrait of cache.values()) {
      portrait.thumbnail.image.remove(); cancel(portrait.thumbnail);
      if (portrait.full) { portrait.full.image.remove(); cancel(portrait.full); }
    }
    cache.clear(); wanted = [];
  }
  return { prepare, show, dispose };
}
