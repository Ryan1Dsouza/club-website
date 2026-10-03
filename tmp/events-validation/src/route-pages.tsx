import { createElement, lazy, type ComponentType } from 'react';

function deferredPage<Props extends object>(load: () => Promise<{ default: ComponentType<Props> }>) {
  let resolved: ComponentType<Props> | undefined;
  let pending: ReturnType<typeof load> | undefined;
  const preload = () => pending ??= load().then(module => { resolved = module.default; return module; });
  const Lazy = lazy(preload);
  const Page = (props: Props) => createElement(resolved ?? Lazy, props);
  return Object.assign(Page, { preload, register(component: ComponentType<Props>) { resolved = component; } });
}

export const EventsPage = deferredPage(() => import('./pages/EventsPage'));
export const WorkPage = deferredPage(() => import('./pages/WorkPage'));
export const PeoplePage = deferredPage(() => import('./pages/PeoplePage'));
export const Recruitment = deferredPage(() => import('./pages/Recruitment'));

const pages = { '/events': EventsPage, '/projects': WorkPage, '/team': PeoplePage, '/recruitment': Recruitment };
export const preloadPage = (path: string) => pages[path.replace(/\/$/, '') as keyof typeof pages]?.preload() ?? Promise.resolve();
