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
  href?: string;
  sample?: boolean;
  photos?: string[];
}

export interface AchievementProfile { member: Member; achievements: Achievement[]; }

export async function fetchAchievements(signal?: AbortSignal): Promise<Achievement[]> {
  const { supabase } = await import('../lib/supabase');
  const { data: acts, error: e1 } = await supabase.from('achievements').select('*').order('created_at', { ascending: false }).abortSignal(signal || new AbortController().signal)
  const { data: mems, error: e2 } = await supabase.from('achievement_members').select('*').abortSignal(signal || new AbortController().signal)
  if (e1) console.error('Achievements error:', e1)
  if (e2) console.error('Achievement members error:', e2)

  return (acts || []).map(a => ({
    ...a,
    memberIds: (mems || []).filter(m => m.achievement_id === a.id).map(m => m.member_id)
  })) as Achievement[]
}

export function createAchievementProfiles(members: Member[], fetchedAchievements: Achievement[]): { profiles: AchievementProfile[]; isPreview: boolean } {
  return { 
    isPreview: false, 
    profiles: members.map(member => ({ 
      member, 
      achievements: fetchedAchievements.filter(record => record.memberIds.includes(member.id)) 
    })).filter(profile => profile.achievements.length > 0) 
  };
}
