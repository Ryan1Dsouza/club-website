# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-screen.spec.mjs >> hydrated server content plays the intro without waiting for its background refresh
- Location: tests\browser\loading-screen.spec.mjs:234:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 700
Received:   NaN
```

# Page snapshot

```yaml
- generic [active]: Gathering pieces...
```

# Test source

```ts
  152 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  153 |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  154 |   const { firstFrame, times } = await page.evaluate(() => ({ firstFrame: window.heroFirstFrame, times: window.loaderTimes }));
  155 |   expect(firstFrame.stage).toBe('done');
  156 |   expect(firstFrame.curtainPresent).toBe(false);
  157 |   expect(firstFrame.time).toBeGreaterThanOrEqual(times.done);
  158 |   expect(errors).toEqual([]);
  159 | });
  160 | 
  161 | test('reduced motion keeps one static frame and removes the artificial wait and wipe', async ({ page }) => {
  162 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  163 |   const release = await holdInitialRequest(page);
  164 |   await page.goto('/recruitment');
  165 |   const loader = screen(page);
  166 |   await expect(loader).toBeVisible();
  167 |   await expect(loader.locator('.nucleus-loader__frame')).toHaveCount(1);
  168 |   await expect(loader.locator('.nucleus-loader__frame')).toHaveCSS('animation-name', 'none');
  169 |   const started = Date.now();
  170 |   release();
  171 |   await expect(loader).toHaveCount(0, { timeout: 1000 });
  172 |   expect(Date.now() - started).toBeLessThan(1000);
  173 |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  174 | });
  175 | 
  176 | test('a failed frame uses a decoded replacement instead of a blank beat', async ({ page }) => {
  177 |   await freezeStartup(page);
  178 |   await page.route('**/frame-05.webp', route => route.abort());
  179 |   const release = await holdInitialRequest(page);
  180 |   await page.goto('/recruitment');
  181 |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  182 |   const frames = screen(page).locator('.nucleus-loader__frame');
  183 |   expect(await frames.nth(5).evaluate(element => getComputedStyle(element).maskImage)).toBe(await frames.first().evaluate(element => getComputedStyle(element).maskImage));
  184 |   expect(await seekFrame(page, 1125)).toEqual([5]);
  185 |   release();
  186 |   await page.clock.runFor(400);
  187 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  188 |   await page.clock.runFor(500);
  189 |   await expect(screen(page)).toHaveCount(0);
  190 | });
  191 | 
  192 | test('stalled startup still reveals the usable page at the deadline', async ({ page }) => {
  193 |   await recordTiming(page);
  194 |   const release = await holdInitialRequest(page);
  195 |   await page.goto('/recruitment');
  196 |   await expect(screen(page)).toBeVisible();
  197 |   await expect(screen(page)).toHaveCount(0, { timeout: 3500 });
  198 |   const times = await page.evaluate(() => window.loaderTimes);
  199 |   expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1450);
  200 |   expect(times.exiting - times.loading).toBeLessThan(2100);
  201 |   expect(times.done - times.loading).toBeLessThan(2800);
  202 |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  203 |   expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  204 |   await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  205 |   const refreshed = page.waitForResponse('**/api/site');
  206 |   release();
  207 |   await refreshed;
  208 |   await expect(screen(page)).toHaveCount(0);
  209 | });
  210 | 
  211 | test('slow fonts and decorative frames never delay a ready page', async ({ page }) => {
  212 |   await recordTiming(page);
  213 |   let release;
  214 |   const assetsReady = new Promise(resolve => { release = resolve; });
  215 |   await page.route(/\.(?:webp|woff2)(?:\?.*)?$/, async route => {
  216 |     // Vite also serves asset URLs as JavaScript modules; keep those imports usable.
  217 |     if (!['image', 'font'].includes(route.request().resourceType())) { await route.continue(); return; }
  218 |     await assetsReady;
  219 |     await route.continue().catch(() => {});
  220 |   });
  221 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  222 |   try {
  223 |     await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  224 |     await expect(screen(page)).toBeVisible();
  225 |     await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
  226 |     await expect(screen(page)).toHaveCount(0, { timeout: 2000 });
  227 |     const times = await page.evaluate(() => window.loaderTimes);
  228 |     expect(times.done - times.loading).toBeLessThan(1500);
  229 |     await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  230 |     await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  231 |   } finally { release(); }
  232 | });
  233 | 
  234 | test('hydrated server content plays the intro without waiting for its background refresh', async ({ page, browser }) => {
  235 |   // Render the real app through Vite's SSR pipeline, then hydrate that markup.
  236 |   const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  237 |   let markup;
  238 |   try { markup = (await vite.ssrLoadModule('/src/entry-server.tsx')).render(site, '/recruitment'); }
  239 |   finally { await vite.close(); }
  240 |   const serverPage = async route => {
  241 |     const response = await route.fetch();
  242 |     const html = (await response.text()).replace('<div id="root"></div>', `<div id="root">${markup}</div><script id="nucleus-data" type="application/json">${JSON.stringify(site)}</script>`);
  243 |     await route.fulfill({ response, body: html });
  244 |   };
  245 |   await page.route('**/recruitment', serverPage);
  246 |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  247 |   const release = await holdInitialRequest(page);
  248 |   await recordTiming(page);
  249 |   await page.goto('/recruitment');
  250 |   await expect(screen(page)).toHaveCount(0, { timeout: 2500 });
  251 |   const times = await page.evaluate(() => window.loaderTimes);
> 252 |   expect(times.done - times.loading).toBeGreaterThan(700);
      |                                      ^ Error: expect(received).toBeGreaterThan(expected)
  253 |   expect(times.done - times.loading).toBeLessThan(1500);
  254 |   await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  255 |   expect(errors).toEqual([]);
  256 |   release();
  257 |   const noJs = await browser.newContext({ javaScriptEnabled: false });
  258 |   try {
  259 |     const readable = await noJs.newPage();
  260 |     await readable.route('**/recruitment', serverPage);
  261 |     await readable.goto(page.url());
  262 |     await expect(screen(readable)).toBeHidden();
  263 |     await expect(readable.locator('.site-shell')).not.toHaveAttribute('inert');
  264 |     await expect(readable.locator('h1')).toBeVisible();
  265 |   } finally { await noJs.close(); }
  266 | });
  267 | 
```