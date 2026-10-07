import { useEffect, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpRight, Newspaper, RefreshCw } from 'lucide-react';
import NewsCard from '../components/news/NewsCard';
import { fetchLiveNews, type NewsItem } from '../lib/live-news';
import './live-news.css';

type NewsState = { status: 'loading' | 'ready' | 'error'; items: NewsItem[] };

function NewsSkeleton() {
  return <div className="live-news__grid" aria-hidden="true">
    {Array.from({ length: 6 }, (_, index) => <div className="news-skeleton" key={index}>
      <div className="news-skeleton__poster" />
      <div className="news-skeleton__body"><span /><span /><span /><span /></div>
    </div>)}
  </div>;
}

export default function LiveNews() {
  const [state, setState] = useState<NewsState>({ status: 'loading', items: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    // A stalled connection should show a retry state instead of an endless skeleton.
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (!disposed) setState({ status: 'error', items: [] });
    }, 15_000);

    void fetchLiveNews(controller.signal).then(items => {
      if (!disposed && !controller.signal.aborted) setState({ status: 'ready', items });
    }).catch(() => {
      if (!disposed) setState({ status: 'error', items: [] });
    }).finally(() => window.clearTimeout(timeout));

    return () => { disposed = true; controller.abort(); window.clearTimeout(timeout); };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading', items: [] });
    setAttempt(value => value + 1);
  };

  return <section className="live-news" aria-labelledby="live-news-title">
    <div className="live-news__wrap">
      <header className="live-news__hero">
        <h1 id="live-news-title">Live news</h1>
      </header>

      <section className="live-news__feed" aria-labelledby="news-feed-title" aria-busy={state.status === 'loading'}>
        <div className="live-news__feed-heading"><h2 id="news-feed-title">Latest updates</h2><span><ArrowDownWideNarrow size={14} aria-hidden="true" />Newest first</span></div>
        {state.status === 'loading' && <><p className="sr-only" role="status">Loading the latest news…</p><NewsSkeleton /></>}
        {state.status === 'error' && <div className="live-news__state">
          <Newspaper size={30} aria-hidden="true" />
          <div role="alert"><h3>The news couldn’t load.</h3><p>Please try again in a moment.</p></div>
          <button className="live-news__retry" type="button" onClick={retry}><RefreshCw size={15} aria-hidden="true" />Try again</button>
        </div>}
        {state.status === 'ready' && (state.items.length ? <div className="live-news__grid">
          {state.items.map((item, index) => <NewsCard key={item.id} item={item} priority={index < 3} />)}
        </div> : <div className="live-news__state" role="status">
          <Newspaper size={30} aria-hidden="true" /><h3>No updates yet.</h3>
        </div>)}
      </section>

      <footer className="live-news__footer"><a href="#live-news-title">Back to top<ArrowUpRight size={14} aria-hidden="true" /></a></footer>
    </div>
  </section>;
}
