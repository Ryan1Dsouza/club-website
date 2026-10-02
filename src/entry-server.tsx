import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import type { SiteData } from './types';
import { EventsPage, WorkPage, PeoplePage, Recruitment } from './route-pages';
import ServerEvents from './pages/EventsPage';
import ServerWork from './pages/WorkPage';
import ServerPeople from './pages/PeoplePage';
import ServerRecruitment from './pages/Recruitment';

// Server-only imports keep synchronous SSR complete without client preloads.
EventsPage.register(ServerEvents);
WorkPage.register(ServerWork);
PeoplePage.register(ServerPeople);
Recruitment.register(ServerRecruitment);

export function render(data: SiteData, url: string) { return renderToString(<StaticRouter location={url}><App initialData={data} /></StaticRouter>); }
