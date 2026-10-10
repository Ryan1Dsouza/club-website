import type { ClubEvent } from '../types';
import type { Station } from './event-navigation';
import { WORKSHOP_STATIONS } from '../events/stations.ts';

export function createEventStations(events: ClubEvent[]): Station[] {
  // 1. Create fixed workshop stations in exact order.
  const stations: Station[] = WORKSHOP_STATIONS.map((workshop, index) => {
    // Try to find a matching event from the DB
    const dbEvent = events.find(e => e.id === workshop.id || (e as any).workshopFolder === workshop.id);
    return {
      id: dbEvent?.id ?? workshop.id,
      index,
      number: String(index + 1).padStart(2, '0'),
      name: workshop.title,
      workshop: workshop.id,
      position: { x: 0, z: 0 },
      radius: 22,
      event: dbEvent ?? null,
    };
  });

  // 2. Append any other published events
  const additionalEvents = events.filter(e => 
    e.published && 
    !WORKSHOP_STATIONS.some(w => w.id === e.id || w.id === (e as any).workshopFolder)
  );

  additionalEvents.forEach((event) => {
    const index = stations.length;
    stations.push({
      id: event.id,
      index,
      number: String(index + 1).padStart(2, '0'),
      name: event.title,
      workshop: undefined,
      position: { x: 0, z: 0 },
      radius: 22,
      event,
    });
  });

  return stations;
}
