import { getSupabase } from './supabase'

export interface Achievement {
  id: string
  title: string
  category: string
  result: string
  year: string
  description: string
  href: string | null
  created_at: string
}

export interface AchievementMember {
  achievement_id: string
  member_id: string
}

export async function listAchievements(): Promise<{ achievement: Achievement, members: string[] }[]> {
  const { data: acts, error: e1 } = await getSupabase().from('achievements').select('*').order('created_at', { ascending: false })
  if (e1) throw e1
  
  const { data: mems, error: e2 } = await getSupabase().from('achievement_members').select('*')
  if (e2) throw e2

  return (acts || []).map(a => ({
    achievement: a,
    members: (mems || []).filter(m => m.achievement_id === a.id).map(m => m.member_id)
  }))
}

export async function createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>, memberIds: string[]): Promise<void> {
  const { data, error } = await getSupabase().from('achievements').insert(achievement).select().single()
  if (error) throw error

  if (memberIds.length > 0) {
    const mems = memberIds.map(id => ({ achievement_id: data.id, member_id: id }))
    const { error: e2 } = await getSupabase().from('achievement_members').insert(mems)
    if (e2) throw e2
  }
}

export async function updateAchievement(id: string, updates: Partial<Achievement>, memberIds: string[]): Promise<void> {
  const { error } = await getSupabase().from('achievements').update(updates).eq('id', id)
  if (error) throw error

  await getSupabase().from('achievement_members').delete().eq('achievement_id', id)
  if (memberIds.length > 0) {
    const mems = memberIds.map(mid => ({ achievement_id: id, member_id: mid }))
    const { error: e2 } = await getSupabase().from('achievement_members').insert(mems)
    if (e2) throw e2
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await getSupabase().from('achievements').delete().eq('id', id)
  if (error) throw error
}
