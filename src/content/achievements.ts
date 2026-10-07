import type { Member } from '../types';

export const achievementCategories = ['All', 'Hackathons', 'Open source', 'Competitive programming', 'Research'] as const;
export type AchievementCategory = Exclude<typeof achievementCategories[number], 'All'>;

export interface Achievement {
  id: string;
  title: string;
  category: AchievementCategory;
  result: string;
  year: string;
  description: string;
  memberIds: string[];
  /** An official result or project URL, when available. */
  href?: string;
  sample?: boolean;
}

export interface AchievementProfile { member: Member; achievements: Achievement[]; }

// Replace this empty list with confirmed member achievements. memberIds must
// match existing team IDs. Adding real records disables the sample preview.
export const memberAchievements: Achievement[] = [];

// User-requested design preview. These generic events and results are
// illustrative, not claims about Nucleus members. Every card labels them.
const sampleResults: Omit<Achievement, 'id' | 'memberIds' | 'sample'>[] = [
  { title: 'Campus Buildathon', category: 'Hackathons', result: 'Winner', year: '2026', description: '' },
  { title: 'Open Source Fellowship', category: 'Open source', result: 'Selected contributor', year: '2026', description: '' },
  { title: 'Code Sprint', category: 'Competitive programming', result: 'Top 10', year: '2025', description: '' },
  { title: 'Student Research Forum', category: 'Research', result: 'Paper presented', year: '2026', description: '' },
  { title: 'Build for Good', category: 'Hackathons', result: 'Finalist', year: '2025', description: '' },
  { title: 'Community Code Fest', category: 'Open source', result: 'Project contributor', year: '2025', description: '' },
];
const sampleMemberIds = ['prajwal', 'navya', 'mohit', 'rakshith', 'joylin', 'saniya'];
const sampleAssignments = [[0, 1, 2], [2, 0], [3, 4, 1], [1, 5, 4], [4, 3], [5, 2]];

export function createAchievementProfiles(members: Member[]): { profiles: AchievementProfile[]; isPreview: boolean } {
  const isPreview = memberAchievements.length === 0;
  if (!isPreview) return { isPreview, profiles: members.map(member => ({ member, achievements: memberAchievements.filter(record => record.memberIds.includes(member.id)) })).filter(profile => profile.achievements.length > 0) };
  const preferred = sampleMemberIds.map(id => members.find(member => member.id === id)).filter((member): member is Member => Boolean(member));
  const previewMembers = [...preferred, ...members.filter(member => !sampleMemberIds.includes(member.id))].slice(0, 6);
  return { isPreview, profiles: previewMembers.map((member, index) => ({ member, achievements: sampleAssignments[index].map(resultIndex => ({ ...sampleResults[resultIndex], id: `sample-${member.id}-${resultIndex}`, memberIds: [member.id], sample: true })) })) };
}
