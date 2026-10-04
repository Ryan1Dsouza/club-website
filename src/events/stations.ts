/** Ride content follows the seven existing platforms in forward travel order. */
export const WORKSHOP_STATIONS = [
  { id: 'inauguration', title: 'Inauguration', folders: ['inauguration'] },
  { id: 'dev', title: 'Dev', folders: ['dev'] },
  { id: 'khoj', title: 'Khoj', folders: ['khoj'] },
  { id: 'linkedin', title: 'LinkedIn', folders: ['linkedin'] },
  { id: 'n8n', title: 'n8n', folders: ['n8n'] },
  { id: 'noesis', title: 'Noesis', folders: ['noesis'] },
  { id: 'unlocked', title: 'Unlocked', folders: ['unlocked'] },
  { id: 'coding', title: 'Coding', folders: ['coding'] },
] as const;

export type WorkshopId = typeof WORKSHOP_STATIONS[number]['id'];

export function workshopStory(title: string) {
  return `A moment from ${title}. The Nucleus community came together to explore new ideas, learn with one another, and share what they discovered. This chapter collects the people and moments that made the event. A full event recap will be added here.`;
}
