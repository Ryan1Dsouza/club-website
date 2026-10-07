import { readFile, writeFile } from 'node:fs/promises';
const root='C:/Users/ryan1/OneDrive/Documents/club-website';
const dir=root+'/output/site-audit-2026-10-07';
const read=async p=>JSON.parse(await readFile(dir+'/'+p,'utf8'));
const link=(p,n)=>`[${p}${n?':'+n:''}](${root}/${p}${n?':'+n:''})`;
const evidence=p=>`[${p}](${dir}/${p})`;
const hw=await read('final/hardware-performance.json');
const checks=[...await read('final/checks.json'), ...await read('final/regressions.json')];
const interactions=await read('interactions.json');
const lh=await read('final/lighthouse.json');
const server=await read('final/server-check.json');
const round=x=>Number.isFinite(x)?Math.round(x*10)/10:'—';
const sample=(d,t)=>hw.find(x=>x.device===d&&x.target===t);
const check=t=>checks.findLast(x=>x.test===t);
const lhRows=lh.map(x=>`| ${x.name} | ${x.scores?.performance??'N/A'} | ${x.metrics?.['largest-contentful-paint']?.display??'N/A'} | ${x.metrics?.['total-blocking-time']?.display??'N/A'} | ${x.scores?.accessibility??'N/A'} | ${x.scores?.['best-practices']??'N/A'} | ${x.scores?.seo??'N/A'} |`).join('\n');
const perfRows=['phone','phone-landscape','tablet','desktop','wide'].map(d=>{
  const e=sample(d,'events'),h=sample(d,'home'),r=sample(d,'ride'),t=interactions.find(x=>x.device===d);
  return `| ${d} | ${round(e?.sample?.p95Ms)} | ${round(e?.fixedTrains?.p95Ms)} | ${round(r?.sample?.p95Ms)} | ${round(t?.towerActive?.p95Ms)} | ${round(h?.heroTextReadyMs/1000)} s |`;
}).join('\n');
const serverRows=server.latency.map(x=>`| ${x.path} | ${round(x.p50Ms)} ms | ${round(x.p95Ms)} ms |`).join('\n');
const report=`# Website audit — 7 October 2026

The public pages have solid basic responsive layouts, but the site needs security, deployment, data handling, and performance fixes before release. The clearest rendering bottleneck is the moving train indicator on the Events archive. Mobile event administration also has a reproducible layout defect and a save-retry defect.

**Version and scope**

Final build and loading checks use a frozen snapshot of commit **be1da0fe2d86ea3e8dc8c8ca3ad5092274445276**. The audit started at 7e18e46. Three commits arrived during testing, including fixes for the admin TypeScript errors and the missing public Supabase event fetch. Both are accounted for below. The initial shared build was replaced during the audit; final performance/loading checks use the isolated snapshot instead.

This is a local production-build audit, as requested. Eight public routes were inspected at 320×568, 390×844, 844×390, 768×1024, 1440×900, and 1920×1080. These 48 baseline combinations had no document-level horizontal overflow, broken images, or uncaught JavaScript errors with controlled local data. The source changes during the audit did not change those layouts. Additional checks exercised navigation, project details, event books, team profiles, touch tower gestures, resource disposal, recruitment, and failures.

Measurements use Node 24.14 and Chromium. Final loading and interaction measurements use **hardware-accelerated Intel UHD graphics**. Phone/tablet interaction profiles use 4× CPU slowdown and emulated touch, not physical phones; desktop uses normal CPU speed. The display runs at roughly 144 Hz. Reported frame times are p95 values, not average FPS. A 60 FPS target allows about 16.7 ms per frame. Early SwiftShader measurements are retained as stress-test evidence and are not the final hardware results.

Functional/layout fixtures and database writes were isolated. Lighthouse used the local production server and the existing configured Supabase public read endpoints. No production data was created or changed. No live deployment URL, Safari/Firefox, physical phone, geographic CDN performance, or live Supabase policy configuration was audited.

**Highest-priority findings**

1. **P1 — Unpublished events and their photos are publicly readable under the supplied Supabase policies.** The events and event_photos SELECT policies both use using (true), and the event-photos bucket is public. Running the actual migrations in isolated PostgreSQL confirmed that the anonymous role can select a draft and its photo record. The latest frontend also requests all events and their photo metadata without a published filter. Hiding drafts in the rendered grid is insufficient. Restrict public rows to published events, give admins a separate read policy, and use private storage/signed access for draft media. Existing public draft URLs must be addressed as part of that change. Sources: ${link('admin/supabase/migrations/202610060002_events.sql',39)}, ${link('admin/supabase/migrations/202610060002_events.sql',67)}, ${link('src/App.tsx',83)}. Evidence: ${evidence('security.json')}. This verifies the shipped migration, not the current policies on a live database.

2. **P1 — The Docker runtime cannot load the server as packaged.** Docker copies \`src/lib\` but omits \`src/events\`; event-stations.ts imports ../events/stations.ts. Recreating that runtime file layout produced ERR_MODULE_NOT_FOUND. Copy the required runtime sources or bundle the server. Also supply the public Vite Supabase configuration at build time: .dockerignore excludes env files, the Dockerfile has no build arguments for them, and the eagerly imported Supabase client throws when they are missing. Sources: ${link('Dockerfile',15)}, ${link('src/lib/event-stations.ts',3)}, ${link('src/lib/supabase.ts',6)}.

3. **P1 if deploying the included Vercel API — Application storage is ephemeral and rate limiting is disabled.** api/index.mjs stores SQLite in /tmp and passes limits:false. Recruitment applications, sessions, and SQLite-managed settings/content cannot be relied on across function instances or cold starts; login and application limiters are bypassed. Use durable storage and a shared limiter, or deploy the persistent Express service described in the README. The root Vercel static-page configuration also does not define the security headers configured by Express. Sources: ${link('api/index.mjs',4)}, ${link('vercel.json',1)}, ${link('server/app.mjs',50)}. This is a deployment-configuration finding, not a claim about an inspected live host.

4. **P2 — The admin event editor clips fields on phones.** At 320px, a 284px dialog contains 554px of horizontal content; at 390px, a 354px dialog still contains 554px. The end-date input is cut off. Fixed two-column inline grids and native datetime input sizing are the main causes. Use responsive classes, minmax(0,1fr), min-width:0, and one-column fields at narrow widths. Checkbox/textarea styling also needs to match the rest of the form. Tablet/desktop geometry passed. Source: ${link('admin/src/components/EventEditor.tsx',137)}. Screenshot: ${evidence('admin-event-artifacts/admin-events-event-editor-layout-and-accessibility-390/editor.png')}.

5. **P2 — Retrying after a failed event photo upload creates another event.** EventEditor saves the event before uploading photos and does not retain the newly created record if an upload fails. Two submit attempts with a simulated 413 upload response made two event INSERTs. Save/retry against a stable ID and explicitly track partial completion. Sources: ${link('admin/src/components/EventEditor.tsx',79)}, ${link('admin/src/lib/events.ts',29)}. Evidence: ${evidence('admin-events-final.log')}.

6. **P2 — Events scrolling repeatedly recalculates the whole archive's styles.** The scroll callback changes inherited --rail-progress on the archive root on every update. Stopping only those writes preserves normal page scrolling and removes most of the cost. In the controlled 390px stress comparison, style recalculation consumed 3,486 ms of a four-second sample; freezing the property reduced total main-thread work from 3,919 ms to 526 ms. Hardware-accelerated measurements confirm the same visible effect in the table below. Write transforms/progress only on the train layers, avoid updating their common ancestor, and skip unchanged values. Sources: ${link('src/pages/EventsPage.tsx',33)}, ${link('src/components/events/railway-track.css',4)}. Evidence: ${evidence('bottlenecks.json')}, ${evidence('final/hardware-performance.json')}.

**Where lag occurs**

| Layout | Events scroll p95, ms | Same scroll with fixed train indicators, ms | Ride p95, ms | Tower gesture p95, ms | Home main text ready |
|---|---:|---:|---:|---:|---:|
${perfRows}

The controlled train change is an audit-only browser experiment; it has not been applied to site code. The hardware ride results are substantially better than the early software-rendering samples. The tower's portrait transitions are the other area to optimize, particularly phone landscape and tablet. At 4× CPU slowdown, the interaction samples included occasional 180–263 ms stalls. The exact contribution of portrait decode, DOM styling, and physics was not isolated; do not infer a single cause from the frame timing alone. Review portrait sizes, the cloned blurred background, and per-frame DOM updates first. Sources: ${link('src/lib/people-tower-portraits.ts',27)}, ${link('src/pages/people-tower.css',36)}.

The event book successfully advanced to page 2 and closed in all five interaction profiles. Its p95 frame times were about 7–14 ms with hardware acceleration, though some first-turn tasks reached roughly 80 ms. The main team grid and project page were relatively inexpensive. Touch tower swipes advanced the internal timeline while the document stayed fixed, the member picker worked, and leaving the tower removed the canvas, scroll lock, geometries, and textures in all five tested profiles. Evidence: ${evidence('interactions.json')}.

**Loading results on the frozen version**

Lighthouse mobile uses its simulated mobile network/CPU model. These are local lab results, not field Core Web Vitals. All 16 final recordings completed. Raw HTML/JSON reports are in the final folder. News was measured in its failed-fetch state, so its score does not establish populated-feed performance.

| Profile / page | Performance | LCP | Total blocking time | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|---:|---:|
${lhRows}

The home LCP score can be misleading: the visible navigation label can become the measured LCP while the central WebGL animation and main text are still forming. The separate main-text-ready timings above are a better measure of that deliberate delay. App.tsx imposes a 1,400 ms minimum loader, adds a 350–450 ms exit, and then LogoLanding starts the formation whose completion controls the main text. Show the brand/message immediately and allow the artwork to complete independently. Sources: ${link('src/components/shared/loading-frames.ts',2)}, ${link('src/components/shared/LoadingScreen.tsx',87)}, ${link('src/components/home/LogoLanding.tsx',13)}, ${link('src/lib/logo-scene.ts',6)}.

The main entry is about 699 KB minified (about 212 KB gzip), and the home logo adds roughly 533 KB of Three.js (137 KB gzip). The loader video itself is roughly 161 KB portrait / 376 KB landscape and is preloaded at high priority. All routes import the home components, recruitment form, and Supabase client through App.tsx. Route-splitting those shared imports more carefully and reducing decorative startup work should improve mobile loading. Supabase team/event photos bypass the bundled image-variant manifests; cards therefore receive large originals rather than purpose-sized variants. The initial Lighthouse pass estimated about 1.0 MiB of image savings on Team and 1.4 MiB on Events. Regenerate small/card/full variants for uploaded photos and provide srcset/sizes.

**Data reliability, image handling, and quality**

- **Live News currently fails to load from the configured backend.** The Supabase /rest/v1/live_news request returned HTTP 404 in both final desktop and mobile Lighthouse runs. Verify that the table exists, its API schema is exposed, and the migration is applied to the configured project. The scores above measure this error state, not a populated feed. A new untracked news/achievements migration appeared during the final review, but its deployment was not verified. Source: ${link('src/lib/live-news.ts',15)}. Evidence: ${evidence('final/lighthouse-mobile-news.json')}, ${evidence('final/lighthouse-desktop-news.json')}.
- **Team fetch failure discards the working roster.** In the final snapshot test, a 403 from the team endpoint left ${check('team-api-error')?.remainingCards??'—'} cards from an initial ${check('team-api-error')?.initialSeedMembers??'—'} seed members and ${check('team-api-error')?.visibleAlerts??'—'} visible alerts. The new mapping turns an errored/null team response into [] and replaces the existing roster. Retain the last good data and show a retry state. ${link('src/App.tsx',85)}.
- **The legacy API still gates Supabase refreshes.** Promise.all waits for /api/site, team, and events together; failure of /api/site discards successful Supabase results. The server also renders SQLite content before the client replaces it with Supabase content. Consolidate the public data source and refresh independent datasets separately. The latest public Supabase event integration check returned **${check('supabase-event-integration')?.rendered?'PASS':'not confirmed'}**; the earlier missing-client-fetch finding is resolved. ${link('src/App.tsx',80)}, ${link('server/app.mjs',260)}.
- **Uploaded event images lack the team-photo preparation pipeline.** Raw files are uploaded without the size/dimension checks, resizing, or re-encoding already implemented for team portraits. New preview object URLs are not revoked, the file list has no aggregate cap, and deleting an event cascades photo rows without deleting stored objects. Reuse preparePhoto, add album limits, release previews, and schedule reliable storage cleanup. ${link('admin/src/components/EventEditor.tsx',49)}, ${link('admin/src/lib/events.ts',68)}, ${link('admin/src/lib/photos.ts',4)}.
- **A failed entry-script download leaves the loading curtain over server-rendered content.** The injected script-failure test found loader visibility **${check('failed-entry-script')?.loaderVisible}**, with server-rendered team cards still present behind it. The 1.5-second deadline only exists after JavaScript executes. Add an independent failure/retry path or preserve usable SSR when hydration fails. A stalled API request did allow the page to unlock in ${round(check('stalled-api')?.readyMs/1000)} seconds. ${link('src/main.tsx',18)}, ${link('src/App.tsx',78)}.
- **Team profile links can be dead controls.** All five inspected fixture profiles showed three fallback social links with href="#" and prevented clicks. The Supabase mapping also drops status, tagline, and socials because these fields are absent from its query/schema. Hide unavailable profile links, preserve real profile fields, and verify the Alumni view against the intended data model. ${link('src/lib/team-profiles.ts',42)}, ${link('src/components/people/TeamProfileOverlay.tsx',78)}, ${link('src/App.tsx',88)}.
- **Contrast needs attention in animated domain text and the voices marquee.** Three of the 16 baseline page/device axe scans reported contrast issues; other scans passed. Some occur during partially revealed text, so validate the in-motion state as well as the finished state. The final Lighthouse About result provides another contrast check. ${evidence('layout.json')}.
- **Achievements is an intentional sample preview.** It has sample records and a deliberate noindex rule, explaining the lower SEO score. Replace samples with verified content before enabling indexing; do not remove noindex merely to improve the score. ${link('src/content/achievements.ts',23)}, ${link('shared/page-meta.ts',27)}.
- **Operational documentation is stale.** The main README still directs admins to /admin and describes recruitment/settings management that the standalone portal does not provide. The main /admin route no longer has that UI. The README's development URL also differs from the package script, and the main environment example omits the now-required Vite Supabase variables. Reconcile the supported deployment/admin workflow. ${link('README.md',12)}, ${link('src/App.tsx',175)}, ${link('admin/src/pages/SettingsPage.tsx',1)}.

**Security checks and dependency risk**

**P1 before applying the new news/achievements migration:** the untracked migration added during this audit permits any authenticated role to insert, update, and delete news/achievements, and to insert/delete achievement-member links. Its policies use unconditional true expressions without the existing is_admin() guard. Where authenticated has the required table grants, a signed-in non-admin would satisfy those write policies. Restrict writes to admins and explicitly configure table privileges before deployment. This is a static review of the pending migration; no live write or policy deployment was attempted. Source: ${link('admin/supabase/migrations/202610070001_news_and_achievements.sql',37)}. The file belongs to concurrent work and was left untouched.

The Express tests passed authentication, CSRF, origin checks, validation, private application data access, salted password hashing, session rotation/expiry, secure cookies, and image decode/re-encoding checks. The local server check returned ${server.crossOriginStatus} for a foreign-origin application request and login statuses ${server.loginLimit.join(', ')} across nine attempts. Sensitive-file probes and unauthenticated admin requests are recorded in ${evidence('final/server-check.json')}.

The Supabase migration test also blocked non-admin INSERT, UPDATE, and DELETE of events. However, grant all gives authenticated users TRUNCATE privileges on events and event_photos, which are not governed by row policies. No web-accessible truncate path was demonstrated. Replace broad grants with the necessary SELECT/INSERT/UPDATE/DELETE privileges as defense in depth. The existing admin security test covers the team migration, not the new events migration.

npm audit reported **12 affected packages** in the main lockfile: 2 critical, 6 high, and 4 moderate. This is not 12 independently exploitable site vulnerabilities. Production-only audit reported **2 moderate affected packages**, react-router and react-router-dom, representing React Router advisories. The critical shell-quote/concurrently and most high findings are development/build-tool exposure. No direct exploit was demonstrated in the site's hardcoded navigation or custom SSR. Admin audit reported zero advisories. Update in controlled steps and rerun checks; avoid a blind major-version audit fix. Relevant advisories: [shell-quote](https://github.com/advisories/GHSA-pqg4-j6r4-53mv), [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [React Router redirect](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6), [React Router hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg).

**Backend response cost**

Thirty sequential requests per route against an isolated in-memory production server:

| Route | Median | p95 |
|---|---:|---:|
${serverRows}

This measures application work and localhost overhead; it does not assess internet latency, persistent-disk contention, or multi-instance capacity. getSite is synchronous, returns all content, and associates photos with events using repeated array filtering. News and admin event listing likewise lack server-side pagination. These are growth risks, not evidence of the current browser lag. Uploaded SQLite photo endpoints inherit no-store and refetch their images; use an appropriate versioned caching policy for published media while retaining privacy for drafts.

**Verification and recommended order**

Both final production builds passed. All 87 main backend/unit tests and the existing admin SQL security test passed. The original admin browser suite had 5 passes and 5 failures: four related to outdated UI expectations, plus a photo-replacement assertion that observed an earlier success toast before the new save finished. A dedicated replacement check waiting for save completion passed. The targeted event-editor/retry suite had three passes and three failures, reproducing the two phone widths and duplicate event creation. The broad original public browser run was stopped after repeated fixture mismatches: it mocks /api/site but lets Supabase replace its expected roster. It should not be treated as a clean regression suite until those dependencies are isolated. One late initial-build check was also invalidated by a concurrent rebuild; the frozen checks supersede it.

Final reduced-motion check: passed; loader removed, main text ready, and zero logo canvases. Local recruitment submission: ${check('recruitment-submit')?.success?'passed, with one persisted local test application':'see checks.json'}. Menu navigation results and failure recovery are in ${evidence('final/checks.json')}; the corrected team-error and recruitment reproductions are in ${evidence('final/regressions.json')}.

Address draft privacy and deployment correctness first, then event save reliability and phone form layout. Next fix the archive-wide train updates, reduce startup gating, and optimize uploaded photos. Finish with data-error recovery, profile content, contrast, and test/documentation maintenance.

Evidence index: ${evidence('final/lighthouse.json')}, ${evidence('final/hardware-performance.json')}, ${evidence('bottlenecks.json')}, ${evidence('interactions.json')}, ${evidence('layout.json')}, ${evidence('security.json')}, ${evidence('latest-build-tests.log')}, ${evidence('latest-admin-build.log')}. Reproduction scripts and the source snapshot are stored alongside this report.
`;
await writeFile(dir+'/REPORT.md',report);
console.log('Wrote '+dir+'/REPORT.md');


