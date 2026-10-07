import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { ServerStyleSheet } from 'styled-components';
import App from './App';
import type { SiteData } from './types';
import { EventsPage, WorkPage, PeoplePage, Recruitment, AchievementsPage, LiveNews } from './route-pages';
import ServerEvents from './pages/EventsPage';
import ServerWork from './pages/WorkPage';
import ServerPeople from './pages/PeoplePage';
import ServerRecruitment from './pages/Recruitment';
import ServerAchievements from './pages/AchievementsPage';
import ServerLiveNews from './pages/LiveNews';

// Server-only imports keep synchronous SSR complete without client preloads.
EventsPage.register(ServerEvents);
WorkPage.register(ServerWork);
PeoplePage.register(ServerPeople);
Recruitment.register(ServerRecruitment);
AchievementsPage.register(ServerAchievements);
LiveNews.register(ServerLiveNews);

export function render(data: SiteData, url: string) {
  const sheet = new ServerStyleSheet();
  try {
    const markup = renderToString(sheet.collectStyles(<StaticRouter location={url}><App initialData={data} /></StaticRouter>));
    return sheet.getStyleTags() + markup;
  } finally { sheet.seal(); }
}
