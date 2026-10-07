import type { EventPhoto } from '../types';

/** Use the final number, so n8n1 and photo(1) both precede photo(2) and photo(10). */
export function photoNumber(path: string) {
  const filename = path.split(/[\\/]/).pop()!.replace(/\.[^.]+$/, '');
  return Number(filename.match(/(?:\((\d+)\)|(\d+))\s*$/)?.slice(1).find(Boolean) ?? Infinity);
}

export function workshopPhotos(files: Record<string, string>, folders: readonly string[]): EventPhoto[] {
  return Object.entries(files)
    .filter(([path]) => folders.includes(path.split(/[\\/]/).at(-2)!.toLowerCase()))
    .sort(([a], [b]) => photoNumber(a) - photoNumber(b) || a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, url]) => ({ id: path, name: path.split(/[\\/]/).pop()!, url }));
}

export function bookSpreads(photos: EventPhoto[]) {
  const spreads: (EventPhoto | null)[][] = [[null, photos[0] ?? null]];
  for (let index = 1; index < photos.length; index += 2) spreads.push([photos[index], photos[index + 1] ?? null]);
  return spreads;
}
