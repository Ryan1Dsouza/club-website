import { getSupabase } from './supabase'

export interface LiveNews {
  id: string
  title: string
  description: string
  image_url: string | null
  date: string | null
  created_at: string
}

export async function listNews(): Promise<LiveNews[]> {
  const { data, error } = await getSupabase()
    .from('live_news')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createNews(news: Omit<LiveNews, 'id' | 'created_at'>): Promise<LiveNews> {
  const { data, error } = await getSupabase().from('live_news').insert(news).select().single()
  if (error) throw error
  return data
}

export async function updateNews(id: string, updates: Partial<LiveNews>): Promise<LiveNews> {
  const { data, error } = await getSupabase().from('live_news').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteNews(id: string): Promise<void> {
  const { error } = await getSupabase().from('live_news').delete().eq('id', id)
  if (error) throw error
}

export function describeError(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}
