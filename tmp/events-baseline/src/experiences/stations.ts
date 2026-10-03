/** Ride content follows the seven existing platforms in forward travel order. */
export const WORKSHOP_STATIONS = [
  { id: 'inauguration', title: 'Inauguration', folders: ['inauguration', 'inaugration'] },
  { id: 'dev', title: 'Dev', folders: ['dev'] },
  { id: 'khoj', title: 'Khoj', folders: ['khoj'] },
  { id: 'linkedin', title: 'LinkedIn', folders: ['linkedin', 'linkdin'] },
  { id: 'n8n', title: 'n8n', folders: ['n8n'] },
  { id: 'noesis', title: 'Noesis', folders: ['noesis'] },
  { id: 'unlocked', title: 'Unlocked', folders: ['unlocked'] },
] as const;

export type WorkshopId = typeof WORKSHOP_STATIONS[number]['id'];

export function workshopStory(title: string) {
  return `A moment from ${title}. This space will tell the story behind the photograph: what brought us together, what we explored, and what we took away. Event highlights and details will be added here.`;
}
