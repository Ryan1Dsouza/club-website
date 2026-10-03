import type { Station } from '../lib/event-navigation';
import { WORKSHOP_STATIONS, workshopStory } from './stations';
import { workshopPhotos } from './photo-order';

// Vite emits the originals as versioned assets in production; URLs remain lazy-loaded by the book.
const files = import.meta.glob('/workshops/**/*.{avif,webp,jpg,jpeg,png,AVIF,WEBP,JPG,JPEG,PNG}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const albums = new Map(WORKSHOP_STATIONS.map(workshop => [workshop.id, workshopPhotos(files, workshop.folders)]));

export function populateWorkshopStation(station: Station): Station {
  const workshop = WORKSHOP_STATIONS.find(item => item.id === station.workshop);
  if (!workshop) return station;
  return { ...station, name: workshop.title, event: {
    id: station.id, title: workshop.title, description: workshopStory(workshop.title),
    startsAt: '', endsAt: '', location: '', category: 'Workshop', registrationUrl: '', published: true,
    // Local albums are authoritative, including when the API has no event at this station.
    photos: albums.get(workshop.id) ?? [],
  } };
}
