import type { ClubEvent } from '../types';
import type { Station } from './event-navigation';
import { WORKSHOP_STATIONS } from '../experiences/stations.ts';

export function createExperienceStations(events: ClubEvent[]): Station[] {
  const published: (ClubEvent | null)[] = events.filter(event => event.published && event.trackPosition === undefined);
  while (published.length < WORKSHOP_STATIONS.length) published.push(null);
  return [...published, ...events.filter(event => event.published && event.trackPosition !== undefined)].map((event, index) => ({
    id: event?.id ?? `preview-station-${index}`, index, number: String(index + 1).padStart(2, '0'),
    name: WORKSHOP_STATIONS[index]?.title ?? event!.title,
    workshop: WORKSHOP_STATIONS[index]?.id,
    position: { x: 0, z: 0 }, radius: 22, event,
  }));
}
