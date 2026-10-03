import React, { Suspense, lazy } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { preloadPage } from './route-pages';
import './styles.css';

const Admin = lazy(() => import('./pages/Admin'));
const root = document.getElementById('root')!;
const initial = document.getElementById('nucleus-data');
function boot() {
  const element = <React.StrictMode>{window.location.pathname.startsWith('/admin')
    ? <Suspense fallback={<div className="page-loading">Opening the control room…</div>}><Admin /></Suspense>
    : <BrowserRouter><App initialData={initial ? JSON.parse(initial.textContent || '{}') : undefined} serverRendered={Boolean(initial)} /></BrowserRouter>}</React.StrictMode>;
  if (initial) hydrateRoot(root, element);
  else createRoot(root).render(element);
}
// Finish evaluating this entry before route imports resolve their shared modules.
// Hydrate only after the requested route's code and CSS are ready.
void preloadPage(window.location.pathname).then(boot, boot);
