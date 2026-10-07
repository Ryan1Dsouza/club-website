export type NewsItem = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  date: string | null;
  created_at: string;
};

export async function fetchLiveNews(signal: AbortSignal): Promise<NewsItem[]> {
  // Load the existing client here so configuration errors stay inside the news
  // error state, and server rendering never needs a browser Supabase session.
  const { supabase } = await import('./supabase');
  const { data, error } = await supabase
    .from('live_news')
    .select('id, title, description, image_url, date, created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .abortSignal(signal)
    .returns<NewsItem[]>();

  if (error) throw error;
  return data ?? [];
}
