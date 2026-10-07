import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { workshops } from '../fixtures/workshops.mjs';

const original = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const site = { ...original, events: original.events.map((event, station) => ({ ...event,
  photos: Array.from({ length: 5 }, (_, index) => ({ id: `book-${station}-${index}`, name: `Moment ${index + 1}.jpg`, url: `/book-photo-${station}-${index}.svg` })),
})) };

async function openRide(page, data = site) {
  await page.route('**/api/site', route => route.fulfill({ json: data }));
  await page.route('**/book-photo-*.svg', route => {
    const index = Number(route.request().url().match(/-(\d)\.svg/)[1]);
    return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="hsl(${100 + index * 30},25%,45%)"/><circle cx="400" cy="260" r="145" fill="#e3ebd2"/><path d="M0 600 260 310 500 600M380 600 670 310 800 490V600" fill="#263d30"/><text x="400" y="290" text-anchor="middle" font-family="sans-serif" font-size="72" fill="#263d30">${index + 1}</text></svg>` });
  });
  await page.addInitScript(() => {
    window.__ridePaints = 0;
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      window.__rideRenderer = renderer;
      const render = renderer.render.bind(renderer);
      renderer.render = (...args) => { window.__ridePaints++; return render(...args); };
    } };
  });
  await page.goto('/events');
  await page.getByRole('button', { name: 'The Nucleus Ride', exact: true }).first().click();
    await page.getByRole('button', { name: "Yes, Let's Go" }).click();
  await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator('.events-flight')).toHaveCount(0);
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 393, height: 851 }, { width: 851, height: 393 }]) {
  test(`station books turn pages, stay in bounds, and continue the ride at ${viewport.width}x${viewport.height}`, async ({ browser }, info) => {
    const mobile = viewport.width !== 1440;
    const report = mobile;
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await openRide(page);
      await page.getByRole('button', { name: `Events ${workshops.length}`, exact: true }).click();
      await page.getByRole('dialog', { name: 'Event stations' }).getByRole('button', { name: /Inauguration/ }).click();
      const book = page.locator('.station-book'), dialog = page.getByRole('dialog', { name: 'Inauguration' });
      await expect(book).toHaveAttribute('data-book-page', '1');
      await expect(book).toHaveAttribute('data-station-number', '01');
      await expect(dialog).toContainText('A moment from Inauguration.');
      await expect(page.getByRole('button', { name: 'Previous book page' })).toBeDisabled();
      await page.waitForTimeout(500);
      await page.screenshot({ path: info.outputPath('book-cover.png') });
      const surface = page.getByRole('region', { name: 'Inauguration event book' });
      if (mobile) {
        const box = await surface.boundingBox(), cdp = await context.newCDPSession(page);
        const x = box.x + box.width * .8, y = box.y + box.height * .85;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let offset = 20; offset <= 300; offset += 20) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - offset }] });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      } else { await surface.hover(); await page.mouse.wheel(0, 420); }
      await expect(book).toHaveAttribute('data-book-page', '2');
      await expect(book.locator('.station-book__spread .station-book__panel')).toHaveCount(report ? 1 : 2);
      await expect.poll(() => book.locator('.station-book__spread .station-book__panel img').evaluateAll(images => images.every(image => image.naturalWidth > 0))).toBe(true);
      await page.waitForTimeout(500);
      await page.screenshot({ path: info.outputPath('book-photos.png') });
      await surface.focus(); await page.keyboard.press('ArrowRight');
      await expect(book).toHaveAttribute('data-book-page', '3');
      await expect(dialog).toBeVisible();
      await page.getByRole('button', { name: 'Next book page' }).click();
      await expect(book).toHaveAttribute('data-book-page', '4');
      const lastPage = report ? workshops[0].photos + 1 : 1 + Math.ceil((workshops[0].photos - 1) / 2);
      for (let next = 5; next <= lastPage; next++) {
        await page.getByRole('button', { name: 'Next book page' }).click();
        await expect(book).toHaveAttribute('data-book-page', String(next));
      }
      await expect(book.locator('.station-book__spread .station-book__panel')).toHaveCount(1);
      await expect(page.getByRole('button', { name: 'Close book after last page' })).toBeEnabled();
      await page.getByRole('button', { name: 'Previous book page' }).click();
      await expect(book).toHaveAttribute('data-book-page', String(lastPage - 1));
      const box = await dialog.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width); expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await expect(book.locator('.nx-continue')).toBeInViewport();
      await book.locator('.nx-continue').click();
      await expect(dialog).toHaveCount(0);
      await expect(page.locator('.nx-world')).toHaveAttribute('data-drive-ready', 'true');
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test('a parked station retains its book through tab suspension, refresh, and WebGL restoration', async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await openRide(page);
  await page.locator('[data-world-station]').first().click();
  const book = page.locator('.station-book'), world = page.locator('.nx-world');
  await expect(book).toBeVisible();
  await page.getByRole('button', { name: 'Next book page' }).click();
  await expect(book).toHaveAttribute('data-book-page', '2');
  const distance = await world.getAttribute('data-distance');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const paints = await page.evaluate(() => window.__ridePaints);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__ridePaints)).toBe(paints);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus'));
  });
  await expect.poll(() => page.evaluate(() => window.__ridePaints)).toBeGreaterThan(paints);
  await expect(book).toHaveAttribute('data-book-page', '2');
  await expect(world).toHaveAttribute('data-distance', distance);
  await page.evaluate(() => {
    window.__rideContext = window.__rideRenderer.getContext().getExtension('WEBGL_lose_context');
    window.__rideContext.loseContext();
  });
  await expect(page.getByText('Reconnecting the ride. Your place is saved.')).toBeAttached();
  await page.evaluate(() => window.__rideContext.restoreContext());
  await expect(page.getByText('Reconnecting the ride. Your place is saved.')).toHaveCount(0);
  await expect(page.getByText('The ride is unavailable.')).toHaveCount(0);
  await expect(book).toHaveAttribute('data-book-page', '2');
  await expect(world).toHaveAttribute('data-distance', distance);
  await page.screenshot({ path: info.outputPath('restored-station.png') });
  await book.locator('.nx-continue').click();
  await expect(world).toHaveAttribute('data-drive-ready', 'true');
  await page.keyboard.down('w');
  await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeGreaterThan(Number(distance) + 5);
  await page.keyboard.up('w');
  expect(errors).toEqual([]);
});

test('a focus refresh with updated event details preserves automatic travel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openRide(page);
  const world = page.locator('.nx-world');
  await page.getByRole('button', { name: /Travel to station 02/ }).click();
  await expect(world).toHaveAttribute('data-travel-target', '1');
  await expect.poll(() => world.getAttribute('data-speed').then(Number)).not.toBe(0);
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, events: site.events.map(event => ({ ...event, description: `${event.description} Updated event details.` })) } }));
  const response = page.waitForResponse('**/api/site');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await response;
  await expect(world).toHaveAttribute('data-travel-target', '1');
  const distance = await world.getAttribute('data-distance');
  await expect.poll(() => world.getAttribute('data-distance')).not.toBe(distance);
});

test('long event stories remain readable on a small phone with reduced motion', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const event = { ...site.events[0], id: 'long-story', trackPosition: .72, title: 'A connection between curious minds, ambitious builders, and future collaborators at the Nucleus community gathering',
    description: 'A community of curious minds came together to explore ideas, share their experiences, and build new connections. '.repeat(14) };
  await openRide(page, { ...site, events: [...site.events, event] });
  await page.getByRole('button', { name: `Events ${workshops.length + 1}`, exact: true }).click();
  await page.getByRole('dialog', { name: 'Event stations' }).locator('.nx-station-list button').last().click();
  const book = page.locator('.station-book'), story = page.getByRole('region', { name: 'Event story' });
  await expect(book).toHaveAttribute('data-book-page', '1');
  await expect(book.locator('.station-book__spread')).toHaveCSS('animation-name', 'none');
  await story.hover(); await page.mouse.wheel(0, 240);
  await expect.poll(() => story.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(book).toHaveAttribute('data-book-page', '1');
  await story.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(book.locator('.station-book__details')).toBeInViewport();
  await expect(book.locator('.nx-continue')).toBeInViewport();
  await page.screenshot({ path: info.outputPath('small-phone-story.png') });
  await page.getByRole('button', { name: 'Next book page' }).click();
  await expect(book).toHaveAttribute('data-book-page', '2');
  expect(await page.getByRole('dialog').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});
