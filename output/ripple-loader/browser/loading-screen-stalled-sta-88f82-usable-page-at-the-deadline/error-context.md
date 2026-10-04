# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-screen.spec.mjs >> stalled startup still reveals the usable page at the deadline
- Location: tests\browser\loading-screen.spec.mjs:252:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1450
Received:    NaN
```

# Page snapshot

```yaml
- generic [active]: Gathering pieces...
```

# Test source

```ts
  159 | 
  160 | test('a failed frame uses a decoded replacement instead of a blank beat', async ({ page }) => {
  161 |   await freezeStartup(page);
  162 |   await page.route('**/frame-05.webp', route => route.abort());
  163 |   const release = await holdInitialRequest(page);
  164 |   await page.goto('/recruitment');
  165 |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  166 |   const frames = screen(page).locator('.nucleus-loader__frame');
  167 |   await page.clock.runFor(40);
  168 |   const firstMask = await frames.evaluate(element => getComputedStyle(element).maskImage);
  169 |   await page.clock.runFor(250);
  170 |   await expect(frames).toHaveAttribute('data-frame', '5');
  171 |   expect(await frames.evaluate(element => getComputedStyle(element).maskImage)).toBe(firstMask);
  172 |   release();
  173 |   await page.clock.runFor(1200);
  174 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  175 |   await page.clock.runFor(500);
  176 |   await expect(screen(page)).toHaveCount(0);
  177 | });
  178 | 
  179 | test.describe('mobile artwork', () => {
  180 |   test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  181 | 
  182 |   test('small phones, tablets and rotation fit every frame and only fetch small masks', async ({ page }, info) => {
  183 |     await freezeStartup(page);
  184 |     const requests = [];
  185 |     page.on('request', request => { if (request.resourceType() === 'image' && /frame-\d+\.webp/.test(request.url())) requests.push(request.url()); });
  186 |     const release = await holdInitialRequest(page);
  187 |     await page.goto('/recruitment');
  188 |     await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  189 |     await page.clock.runFor(40);
  190 |     expect(requests.length).toBeGreaterThanOrEqual(17);
  191 |     expect(requests.every(url => url.includes('/loading/mobile/'))).toBe(true);
  192 |     for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
  193 |       await page.setViewportSize(viewport);
  194 |       const frame = screen(page).locator('.nucleus-loader__frame');
  195 |       await expect(frame).toHaveCSS('mask-size', 'contain');
  196 |       await expect(screen(page)).toHaveCSS('height', `${viewport.height}px`);
  197 |       const box = await frame.boundingBox();
  198 |       expect(box.x).toBeGreaterThanOrEqual(16);
  199 |       expect(box.y).toBeGreaterThanOrEqual(16);
  200 |       expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 16);
  201 |       expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 16);
  202 |       for (let index = 0; index < 17; index++) {
  203 |         // Every source aspect ratio (including frame 15) fits inside this box.
  204 |         const size = await frame.evaluate(async (element, index) => {
  205 |           const url = getComputedStyle(element).maskImage.match(/url\("?(.*?)"?\)/)[1].replace(/frame-\d+/, `frame-${String(index).padStart(2, '0')}`);
  206 |           const image = new Image(); image.src = url; await image.decode();
  207 |           return { width: image.naturalWidth, height: image.naturalHeight };
  208 |         }, index);
  209 |         expect(size.width).toBe(640);
  210 |         const scale = Math.min(box.width / size.width, box.height / size.height);
  211 |         expect(size.width * scale).toBeLessThanOrEqual(box.width + .01);
  212 |         expect(size.height * scale).toBeLessThanOrEqual(box.height + .01);
  213 |       }
  214 |       await page.screenshot({ path: info.outputPath(`loader-fit-${viewport.width}.png`) });
  215 |     }
  216 |     release();
  217 |     await page.clock.runFor(1450);
  218 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  219 |     // Mobile exit only translates the curtain, avoiding an animated viewport mask.
  220 |     await expect(screen(page)).toHaveCSS('clip-path', 'inset(0%)');
  221 |     await page.clock.runFor(500);
  222 |     await expect(screen(page)).toHaveCount(0);
  223 |   });
  224 | 
  225 |   test('all failed images leave a readable fallback', async ({ page }) => {
  226 |     await freezeStartup(page);
  227 |     const release = await holdInitialRequest(page);
  228 |     await page.route('**/loading/mobile/frame-*.webp', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
  229 |     await page.goto('/recruitment');
  230 |     await expect(page.locator('.nucleus-loader__fallback')).toHaveText('Nucleus');
  231 |     release();
  232 |     await page.clock.runFor(1500);
  233 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  234 |     await page.clock.runFor(500);
  235 |     await expect(screen(page)).toHaveCount(0);
  236 |   });
  237 | 
  238 |   test('a slower mobile CPU still reveals the usable page promptly', async ({ page }) => {
  239 |     const session = await page.context().newCDPSession(page);
  240 |     await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  241 |     await recordTiming(page);
  242 |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  243 |     await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  244 |     await expect(screen(page)).toHaveCount(0, { timeout: 5000 });
  245 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  246 |     const times = await page.evaluate(() => window.loaderTimes);
  247 |     expect(times.done - times.loading).toBeLessThan(2800);
  248 |     await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  249 |   });
  250 | });
  251 | 
  252 | test('stalled startup still reveals the usable page at the deadline', async ({ page }) => {
  253 |   await recordTiming(page);
  254 |   const release = await holdInitialRequest(page);
  255 |   await page.goto('/recruitment');
  256 |   await expect(screen(page)).toBeVisible();
  257 |   await expect(screen(page)).toHaveCount(0, { timeout: 3500 });
  258 |   const times = await page.evaluate(() => window.loaderTimes);
> 259 |   expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1450);
      |                                         ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  260 |   expect(times.exiting - times.loading).toBeLessThan(2100);
  261 |   expect(times.done - times.loading).toBeLessThan(2800);
  262 |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  263 |   expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  264 |   await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  265 |   const refreshed = page.waitForResponse('**/api/site');
  266 |   release();
  267 |   await refreshed;
  268 |   await expect(screen(page)).toHaveCount(0);
  269 | });
  270 | 
  271 | test('slow fonts and decorative frames never delay a ready page', async ({ page }) => {
  272 |   await recordTiming(page);
  273 |   let release;
  274 |   const assetsReady = new Promise(resolve => { release = resolve; });
  275 |   await page.route(/\.(?:webp|woff2)(?:\?.*)?$/, async route => {
  276 |     // Vite also serves asset URLs as JavaScript modules; keep those imports usable.
  277 |     if (!['image', 'font'].includes(route.request().resourceType())) { await route.continue(); return; }
  278 |     await assetsReady;
  279 |     await route.continue().catch(() => {});
  280 |   });
  281 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  282 |   try {
  283 |     await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  284 |     await expect(screen(page)).toBeVisible();
  285 |     await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
  286 |     await expect(screen(page)).toHaveCount(0, { timeout: 3000 });
  287 |     const times = await page.evaluate(() => window.loaderTimes);
  288 |     expect(times.done - times.loading).toBeLessThan(2500);
  289 |     await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  290 |     await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  291 |   } finally { release(); }
  292 | });
  293 | 
  294 | test('hydrated server content plays the intro without waiting for its background refresh', async ({ page, browser }) => {
  295 |   // Render the real app through Vite's SSR pipeline, then hydrate that markup.
  296 |   const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  297 |   let markup;
  298 |   try { markup = (await vite.ssrLoadModule('/src/entry-server.tsx')).render(site, '/recruitment'); }
  299 |   finally { await vite.close(); }
  300 |   const serverPage = async route => {
  301 |     const response = await route.fetch();
  302 |     const html = (await response.text()).replace(/<div id="root">[\s\S]*?<\/div>\s*<\/div>/,
  303 |       () => `<div id="root">${markup}</div><script id="nucleus-data" type="application/json">${JSON.stringify(site)}</script>`);
  304 |     expect(html).toContain('id="nucleus-data"');
  305 |     await route.fulfill({ response, body: html });
  306 |   };
  307 |   await page.route('**/recruitment', serverPage);
  308 |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  309 |   const release = await holdInitialRequest(page);
  310 |   await recordTiming(page);
  311 |   await page.goto('/recruitment');
  312 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  313 |   await expect(screen(page)).toHaveCount(0, { timeout: 2500 });
  314 |   const times = await page.evaluate(() => window.loaderTimes);
  315 |   expect(times.done - times.loading).toBeGreaterThan(700);
  316 |   expect(times.done - times.loading).toBeLessThan(2400);
  317 |   await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  318 |   expect(errors).toEqual([]);
  319 |   release();
  320 |   const noJs = await browser.newContext({ javaScriptEnabled: false });
  321 |   try {
  322 |     const readable = await noJs.newPage();
  323 |     await readable.route('**/recruitment', serverPage);
  324 |     await readable.goto(page.url());
  325 |     await expect(screen(readable)).toBeHidden();
  326 |     await expect(readable.locator('.site-shell')).not.toHaveAttribute('inert');
  327 |     await expect(readable.locator('h1')).toBeVisible();
  328 |   } finally { await noJs.close(); }
  329 | });
  330 | 
```