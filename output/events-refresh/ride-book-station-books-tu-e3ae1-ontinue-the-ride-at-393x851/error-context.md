# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ride-book.spec.mjs >> station books turn pages, stay in bounds, and continue the ride at 393x851
- Location: tests\browser\ride-book.spec.mjs:33:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.station-book')
Expected: "2"
Received: "1"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" locator('.station-book') with timeout 5000ms
  - waiting for locator('.station-book')
    14 × locator resolved to <div data-book-page="1" class="station-book" data-layout="report" data-station-number="01" data-book-turning="true" data-book-closing="false" data-book-progress="0.693" data-scroll-engine="lenis" data-workshop="inauguration">…</div>
       - unexpected value "1"

```

```yaml
- banner: NUCLEUS STATION / 01
- heading "Inauguration" [level=2]
- region "Inauguration event book":
  - figure
- contentinfo:
  - button "Previous book page"
  - status: Page 1 / 12
  - button "Next book page"
  - paragraph
  - button "Continue ride"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | 
  4   | const original = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5   | const site = { ...original, events: original.events.map((event, station) => ({ ...event,
  6   |   photos: Array.from({ length: 5 }, (_, index) => ({ id: `book-${station}-${index}`, name: `Moment ${index + 1}.jpg`, url: `/book-photo-${station}-${index}.svg` })),
  7   | })) };
  8   | 
  9   | async function openRide(page, data = site) {
  10  |   await page.route('**/api/site', route => route.fulfill({ json: data }));
  11  |   await page.route('**/book-photo-*.svg', route => {
  12  |     const index = Number(route.request().url().match(/-(\d)\.svg/)[1]);
  13  |     return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="hsl(${100 + index * 30},25%,45%)"/><circle cx="400" cy="260" r="145" fill="#e3ebd2"/><path d="M0 600 260 310 500 600M380 600 670 310 800 490V600" fill="#263d30"/><text x="400" y="290" text-anchor="middle" font-family="sans-serif" font-size="72" fill="#263d30">${index + 1}</text></svg>` });
  14  |   });
  15  |   await page.addInitScript(() => {
  16  |     window.__ridePaints = 0;
  17  |     window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
  18  |       const renderer = event.detail;
  19  |       if (!renderer?.isWebGLRenderer) return;
  20  |       window.__rideRenderer = renderer;
  21  |       const render = renderer.render.bind(renderer);
  22  |       renderer.render = (...args) => { window.__ridePaints++; return render(...args); };
  23  |     } };
  24  |   });
  25  |   await page.goto('/events');
  26  |   await page.getByRole('button', { name: 'The Nucleus Ride', exact: true }).first().click();
  27  |     await page.getByRole('button', { name: "Yes, Let's Go" }).click();
  28  |   await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
  29  |   await expect(page.locator('.events-flight')).toHaveCount(0);
  30  | }
  31  | 
  32  | for (const viewport of [{ width: 1440, height: 900 }, { width: 393, height: 851 }, { width: 851, height: 393 }]) {
  33  |   test(`station books turn pages, stay in bounds, and continue the ride at ${viewport.width}x${viewport.height}`, async ({ browser }, info) => {
  34  |     const mobile = viewport.width !== 1440;
  35  |     const report = viewport.width <= 620;
  36  |     const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  37  |     const page = await context.newPage(), errors = [];
  38  |     page.on('pageerror', error => errors.push(error.message));
  39  |     try {
  40  |       await openRide(page);
  41  |       await page.getByRole('button', { name: 'Events 7', exact: true }).click();
  42  |       await page.getByRole('dialog', { name: 'Event stations' }).getByRole('button', { name: /Inauguration/ }).click();
  43  |       const book = page.locator('.station-book'), dialog = page.getByRole('dialog', { name: 'Inauguration' });
  44  |       await expect(book).toHaveAttribute('data-book-page', '1');
  45  |       await expect(book).toHaveAttribute('data-station-number', '01');
  46  |       await expect(dialog).toContainText('A moment from Inauguration.');
  47  |       await expect(page.getByRole('button', { name: 'Previous book page' })).toBeDisabled();
  48  |       await page.waitForTimeout(500);
  49  |       await page.screenshot({ path: info.outputPath('book-cover.png') });
  50  |       const surface = page.getByRole('region', { name: 'Inauguration event book' });
  51  |       if (mobile) {
  52  |         const box = await surface.boundingBox(), cdp = await context.newCDPSession(page);
  53  |         const x = box.x + box.width * .8, y = box.y + box.height * .85;
  54  |         await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  55  |         for (let offset = 20; offset <= 300; offset += 20) {
  56  |           await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - offset }] });
  57  |         }
  58  |         await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  59  |         await cdp.detach();
  60  |       } else { await surface.hover(); await page.mouse.wheel(0, 420); }
> 61  |       await expect(book).toHaveAttribute('data-book-page', '2');
      |                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  62  |       await expect(book.locator('.station-book__spread .station-book__panel')).toHaveCount(report ? 1 : 2);
  63  |       await expect.poll(() => book.locator('.station-book__spread .station-book__panel img').evaluateAll(images => images.every(image => image.naturalWidth > 0))).toBe(true);
  64  |       await page.waitForTimeout(500);
  65  |       await page.screenshot({ path: info.outputPath('book-photos.png') });
  66  |       await surface.focus(); await page.keyboard.press('ArrowRight');
  67  |       await expect(book).toHaveAttribute('data-book-page', '3');
  68  |       await expect(dialog).toBeVisible();
  69  |       await page.getByRole('button', { name: 'Next book page' }).click();
  70  |       await expect(book).toHaveAttribute('data-book-page', '4');
  71  |       const lastPage = report ? 12 : 7;
  72  |       for (let next = 5; next <= lastPage; next++) {
  73  |         await page.getByRole('button', { name: 'Next book page' }).click();
  74  |         await expect(book).toHaveAttribute('data-book-page', String(next));
  75  |       }
  76  |       await expect(book.locator('.station-book__spread .station-book__panel')).toHaveCount(1);
  77  |       await expect(page.getByRole('button', { name: 'Close book after last page' })).toBeEnabled();
  78  |       await page.getByRole('button', { name: 'Previous book page' }).click();
  79  |       await expect(book).toHaveAttribute('data-book-page', String(lastPage - 1));
  80  |       const box = await dialog.boundingBox();
  81  |       expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
  82  |       expect(box.x + box.width).toBeLessThanOrEqual(viewport.width); expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  83  |       expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  84  |       await expect(book.locator('.nx-continue')).toBeInViewport();
  85  |       await book.locator('.nx-continue').click();
  86  |       await expect(dialog).toHaveCount(0);
  87  |       await expect(page.locator('.nx-world')).toHaveAttribute('data-drive-ready', 'true');
  88  |       expect(errors).toEqual([]);
  89  |     } finally { await context.close(); }
  90  |   });
  91  | }
  92  | 
  93  | test('a parked station retains its book through tab suspension, refresh, and WebGL restoration', async ({ page }, info) => {
  94  |   await page.setViewportSize({ width: 1280, height: 800 });
  95  |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  96  |   await openRide(page);
  97  |   await page.locator('[data-world-station]').first().click();
  98  |   const book = page.locator('.station-book'), world = page.locator('.nx-world');
  99  |   await expect(book).toBeVisible();
  100 |   await page.getByRole('button', { name: 'Next book page' }).click();
  101 |   await expect(book).toHaveAttribute('data-book-page', '2');
  102 |   const distance = await world.getAttribute('data-distance');
  103 |   await page.evaluate(() => {
  104 |     Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  105 |     document.dispatchEvent(new Event('visibilitychange'));
  106 |   });
  107 |   const paints = await page.evaluate(() => window.__ridePaints);
  108 |   await page.waitForTimeout(250);
  109 |   expect(await page.evaluate(() => window.__ridePaints)).toBe(paints);
  110 |   await page.evaluate(() => {
  111 |     Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  112 |     document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus'));
  113 |   });
  114 |   await expect.poll(() => page.evaluate(() => window.__ridePaints)).toBeGreaterThan(paints);
  115 |   await expect(book).toHaveAttribute('data-book-page', '2');
  116 |   await expect(world).toHaveAttribute('data-distance', distance);
  117 |   await page.evaluate(() => {
  118 |     window.__rideContext = window.__rideRenderer.getContext().getExtension('WEBGL_lose_context');
  119 |     window.__rideContext.loseContext();
  120 |   });
  121 |   await expect(page.getByText('Reconnecting the ride. Your place is saved.')).toBeAttached();
  122 |   await page.evaluate(() => window.__rideContext.restoreContext());
  123 |   await expect(page.getByText('Reconnecting the ride. Your place is saved.')).toHaveCount(0);
  124 |   await expect(page.getByText('The ride is unavailable.')).toHaveCount(0);
  125 |   await expect(book).toHaveAttribute('data-book-page', '2');
  126 |   await expect(world).toHaveAttribute('data-distance', distance);
  127 |   await page.screenshot({ path: info.outputPath('restored-station.png') });
  128 |   await book.locator('.nx-continue').click();
  129 |   await expect(world).toHaveAttribute('data-drive-ready', 'true');
  130 |   await page.keyboard.down('w');
  131 |   await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeGreaterThan(Number(distance) + 5);
  132 |   await page.keyboard.up('w');
  133 |   expect(errors).toEqual([]);
  134 | });
  135 | 
  136 | test('a focus refresh with updated event details preserves automatic travel', async ({ page }) => {
  137 |   await page.setViewportSize({ width: 1280, height: 800 });
  138 |   await openRide(page);
  139 |   const world = page.locator('.nx-world');
  140 |   await page.getByRole('button', { name: /Travel to station 02/ }).click();
  141 |   await expect(world).toHaveAttribute('data-travel-target', '1');
  142 |   await expect.poll(() => world.getAttribute('data-speed').then(Number)).not.toBe(0);
  143 |   await page.route('**/api/site', route => route.fulfill({ json: { ...site, events: site.events.map(event => ({ ...event, description: `${event.description} Updated event details.` })) } }));
  144 |   const response = page.waitForResponse('**/api/site');
  145 |   await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  146 |   await response;
  147 |   await expect(world).toHaveAttribute('data-travel-target', '1');
  148 |   const distance = await world.getAttribute('data-distance');
  149 |   await expect.poll(() => world.getAttribute('data-distance')).not.toBe(distance);
  150 | });
  151 | 
  152 | test('long event stories remain readable on a small phone with reduced motion', async ({ page }, info) => {
  153 |   await page.setViewportSize({ width: 320, height: 568 });
  154 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  155 |   const event = { ...site.events[0], id: 'long-story', trackPosition: .72, title: 'A connection between curious minds, ambitious builders, and future collaborators at the Nucleus community gathering',
  156 |     description: 'A community of curious minds came together to explore ideas, share their experiences, and build new connections. '.repeat(14) };
  157 |   await openRide(page, { ...site, events: [...site.events, event] });
  158 |   await page.getByRole('button', { name: 'Events 8', exact: true }).click();
  159 |   await page.getByRole('dialog', { name: 'Event stations' }).locator('.nx-station-list button').last().click();
  160 |   const book = page.locator('.station-book'), story = page.getByRole('region', { name: 'Event story' });
  161 |   await expect(book).toHaveAttribute('data-book-page', '1');
```