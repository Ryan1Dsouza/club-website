import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from '../../server/app.mjs';
import { openDatabase, hashPassword } from '../../server/db.mjs';
import { getSite } from '../../server/db.mjs';

let db, server, apiBase;
test.beforeEach(async ({ baseURL }) => {
  db = openDatabase(':memory:');
  db.prepare('INSERT INTO admins VALUES(?,?,?)').run('browser-admin', 'browser@example.com', hashPassword('browser-fixture-password'));
  server = createApp(db, { limits: false, origin: baseURL, dist: resolve('__no_browser_dist__') }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve)); apiBase = `http://127.0.0.1:${server.address().port}`;
});
test.afterEach(async () => { await new Promise(resolve => server.close(resolve)); db.close(); });
async function connect(page) {
  await page.route('**/api/**', async route => {
    const response = await route.fetch({ url: apiBase + new URL(route.request().url()).pathname });
    await route.fulfill({ response });
  });
  await page.goto('/events');
  await page.getByRole('button', { name: /The Nucleus Ride/ }).click();
}
async function ready(page) {
  await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
}

test('boost widens and pulls back the camera and opening events fades the existing photos', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await connect(page); await ready(page);
  const world = page.locator('.nx-world'), cards = page.locator('.nx-glimpses'), focus = page.locator('.nx-boost-focus');
  await page.getByRole('button', { name: 'Return to ride' }).click();
  await expect(world).toHaveAttribute('data-drive-ready', 'true');
  await world.focus(); await page.keyboard.down('w');
  await expect(cards).toBeVisible();
  await expect.poll(() => world.getAttribute('data-speed').then(Number), { timeout: 15_000 }).toBeGreaterThan(18);
  const cruisingFov = Number(await world.getAttribute('data-fov'));
  await page.keyboard.down('Shift');
  await expect(world).toHaveAttribute('data-boost', 'true');
  await expect.poll(() => focus.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.9);
  await expect.poll(() => world.getAttribute('data-fov').then(Number)).toBeGreaterThan(cruisingFov + 3);
  await expect.poll(() => world.getAttribute('data-camera-pullback').then(Number)).toBeGreaterThan(.3);
  await page.screenshot({ path: info.outputPath('boost-focus.png') });
  await page.keyboard.up('Shift'); await page.keyboard.up('w');
  await expect.poll(() => world.getAttribute('data-camera-pullback').then(Number)).toBeLessThan(.02);
  // Opening the event list pauses the ride and fades the photos before unmount.
  const fade = await page.evaluate(() => new Promise(resolve => {
    const panel = document.querySelector('.nx-glimpses'), samples = [];
    const start = performance.now();
    document.querySelector('.nx-event-actions button').click();
    const sample = () => {
      samples.push({ opacity: Number(getComputedStyle(panel).opacity), hidden: panel.hidden, fading: panel.dataset.fading });
      if (panel.hidden || performance.now() - start > 3000) resolve(samples); else requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  expect(fade.some(sample => sample.fading === 'true' && !sample.hidden && sample.opacity > .1 && sample.opacity < .9)).toBe(true);
  expect(fade.at(-1).hidden).toBe(true);
  await expect(page.getByRole('button', { name: /restart|reset ride/i })).toHaveCount(0);
  await expect.poll(() => focus.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(.05);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(focus).toBeHidden();
  await expect(world).toHaveAttribute('data-postprocessing', 'false');
  expect(errors).toEqual([]);
});

test('wind is opt-in, follows motion, suspends for dialogs, and closes on navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    window.rideAudioContexts = [];
    window.AudioContext = class extends Original {
      constructor(...args) { super(...args); window.rideAudioContexts.push(this); }
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await connect(page); await ready(page);
  const sound = page.getByRole('button', { name: 'Wind sound' }), world = page.locator('.nx-world');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => window.rideAudioContexts.length)).toBe(0);
  await expect(page.locator('.nx-minimap')).toHaveCSS('backdrop-filter', 'blur(10px)');
  await page.getByRole('button', { name: 'Return to ride' }).click();
  await expect(world).toHaveAttribute('data-drive-ready', 'true');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await world.focus(); await page.keyboard.down('w');
  await expect.poll(() => world.getAttribute('data-audio-gain').then(Number)).toBeGreaterThan(.002);
  await page.keyboard.up('w');
  await page.getByRole('button', { name: 'Events 3', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.rideAudioContexts[0].state)).toBe('suspended');
  await page.getByRole('button', { name: 'Close event', exact: true }).click();
  await sound.click(); await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => world.getAttribute('data-audio-gain').then(Number)).toBe(0);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.rideAudioContexts[0].state)).toBe('closed');
});

test('station-only travel repeats event photos, departs Station 01, and rides to another checkpoint', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const events = getSite(db).events;
  for (const [eventIndex, event] of events.entries()) for (let index = 0; index < 8; index++) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="600" height="450" fill="hsl(${eventIndex * 90 + index * 18},35%,38%)"/><circle cx="300" cy="205" r="110" fill="#c3e5c8"/><text x="300" y="230" text-anchor="middle" font-family="sans-serif" font-size="70">${eventIndex + 1}.${index + 1}</text></svg>`;
    db.prepare('INSERT INTO event_photos(id,event_id,name,mime,data,position) VALUES(?,?,?,?,?,?)').run(`ride-${eventIndex}-${index}`, event.id, `Event ${eventIndex + 1} photo ${index + 1}`, 'image/svg+xml', Buffer.from(svg), index);
  }
  await connect(page); await ready(page);
  const world = page.locator('.nx-world'), map = page.getByRole('navigation', { name: 'Ride route map' });
  await expect(page.locator('[data-stop-kind=waypoint]')).toHaveCount(0);
  await map.getByRole('button', { name: /Travel to station 01/ }).click();
  await expect(world).toHaveAttribute('data-travel-target', '0');
  await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeLessThan(10);
  await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 20_000 }).toBeGreaterThan(10);
  const firstSources = await page.locator('.nx-glimpse img').evaluateAll(images => images.map(img => img.getAttribute('src')));
  await expect.poll(() => page.locator('.nx-glimpse img').evaluateAll(images => images.map(img => img.getAttribute('src'))), { timeout: 15_000 }).not.toEqual(firstSources);
  await expect.poll(() => page.locator('.nx-glimpse img').evaluateAll(images => images.every(img => img.naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: info.outputPath('repeating-event-photos.png') });
  await expect(page.getByRole('dialog', { name: events[0].title })).toBeVisible({ timeout: 60_000 });
  await expect(world).toHaveAttribute('data-distance', '211.00');
  await expect(page.locator('.nx-glimpses')).toBeHidden();
  // One uninterrupted press must close the event AND begin driving immediately.
  await page.keyboard.down('d');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 15_000 }).toBeGreaterThan(245);
  await expect(page.locator('.nx-glimpses')).toHaveAttribute('aria-label', `A glimpse of the next event: ${events[1].title}`);
  await expect.poll(() => page.locator('.nx-glimpse').first().getAttribute('data-frame').then(Number), { timeout: 12_000 }).toBeGreaterThan(0);
  await page.keyboard.up('d');
  await map.getByRole('button', { name: /Travel to station 02/ }).click();
  await expect(world).toHaveAttribute('data-travel-target', '1');
  await expect(page.getByRole('dialog', { name: events[1].title })).toBeVisible({ timeout: 75_000 });
  const secondDistance = Number(await world.getAttribute('data-distance'));
  await page.keyboard.down('s');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 15_000 }).toBeLessThan(secondDistance - 20);
  await expect(page.locator('.nx-glimpses')).toHaveAttribute('aria-label', `A glimpse of the next event: ${events[0].title}`);
  await page.keyboard.up('s');
  expect(errors).toEqual([]);
});

test('continuing after docking preserves a forward key that is still held', async ({ page }) => {
  await connect(page); await ready(page);
  const world = page.locator('.nx-world');
  await page.getByRole('button', { name: 'Return to ride' }).click();
  await expect(world).toHaveAttribute('data-drive-ready', 'true');
  await page.keyboard.down('w');
  await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible({ timeout: 30_000 });
  const parked = Number(await world.getAttribute('data-distance'));
  await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => world.getAttribute('data-distance').then(Number), { timeout: 10_000 }).toBeGreaterThan(parked + 25);
  await page.keyboard.up('w');
});

test('desktop publishes a photo folder, another visitor rides to its station and resumes after switching tabs', async ({ page, browser }, info) => {
  // Include actual travel to the new platform on software-rendered CI.
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await connect(page); await ready(page);
  await expect(page.locator('.nx-joystick')).toHaveCount(0); await expect(page.locator('[data-stop-kind=event]')).toHaveCount(3);
  await expect(page.locator('[data-stop-kind=waypoint]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Ride route map' }).getByRole('button')).toHaveCount(3);
  await page.evaluate(() => { window.testCanvas = document.querySelector('.nx-world canvas'); });
  await page.getByRole('button', { name: 'Return to ride' }).click();
  await page.locator('.nx-world').focus(); await expect(page.locator('.nx-world')).toHaveAttribute('data-drive-ready', 'true');
  await page.keyboard.down('w'); await expect.poll(() => page.locator('.nx-world').getAttribute('data-distance').then(Number)).toBeGreaterThan(3); await page.keyboard.up('w');
  await expect.poll(() => page.locator('.nx-world').getAttribute('data-distance').then(Number)).toBeGreaterThan(3);
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com'); await page.getByLabel('Password', { exact: true }).fill('browser-fixture-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Event title', { exact: true }).fill('A shared photo workshop');
  await page.getByLabel('Event details', { exact: true }).fill('We built a wonderful new project together. Here are the highlights from our workshop.');
  await page.getByLabel('Date and time (your local timezone)', { exact: true }).fill('2026-10-15T15:00');
  await page.getByLabel('Location', { exact: true }).fill('SJEC Innovation Lab'); await page.getByLabel('Category', { exact: true }).fill('Workshop');
  await page.getByLabel('Photo album link (Google Drive or any share URL)', { exact: false }).fill('https://drive.google.com/drive/folders/workshop');
  await page.getByLabel('Registration link', { exact: false }).fill('https://example.com/register');
  const album = info.outputPath('album'); await mkdir(album, { recursive: true });
  const png = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 100; canvas.height = 80; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#b8e5c8'; ctx.fillRect(0, 0, 100, 80); return canvas.toDataURL('image/png').split(',')[1]; });
  await writeFile(resolve(album, 'workshop.png'), Buffer.from(png, 'base64')); await writeFile(resolve(album, 'notes.txt'), 'Skip this non-image');
  await page.getByLabel('Upload a photo folder', { exact: true }).setInputFiles(album);
  await expect(page.getByText('1 unsupported file skipped.')).toBeVisible();
  await page.getByRole('button', { name: 'Publish event & add station', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('is published'); await expect(page.locator('[data-stop-kind=event]')).toHaveCount(4);
  await expect(page.getByRole('status')).toContainText('Station 04');
  await expect(page.getByRole('navigation', { name: 'Ride route map' }).getByRole('button', { name: /Travel to station 04/ })).toHaveCount(1);
  expect(await page.evaluate(() => window.testCanvas === document.querySelector('.nx-world canvas'))).toBe(true);
  await page.getByRole('button', { name: 'Open holographic map' }).click(); await page.waitForTimeout(1800);
  await page.screenshot({ path: info.outputPath('desktop-map.png') });
  const stats = await page.evaluate(() => new Promise(resolve => {
    const timings = []; let last = 0;
    function frame(now) { if (last) timings.push(now - last); last = now; if (timings.length < 180) requestAnimationFrame(frame); else { timings.sort((a,b) => a-b); resolve({ medianMs: timings[90], p95Ms: timings[171], ...document.querySelector('.nx-world').dataset }); } } requestAnimationFrame(frame);
  }));
  console.log('Desktop map frame sample:', JSON.stringify(stats));
  const visitor = await browser.newContext({ baseURL: info.project.use.baseURL }), otherPage = await visitor.newPage();
  await connect(otherPage); await ready(otherPage); await expect(otherPage.locator('[data-stop-kind=event]')).toHaveCount(4);
  const world = otherPage.locator('.nx-world');
  await otherPage.evaluate(() => { window.visitCanvas = document.querySelector('.nx-world canvas'); });
  await otherPage.getByRole('button', { name: /Travel to station 04/ }).click();
  await expect(world).toHaveAttribute('data-travel-target', '3');
  await expect(otherPage.getByRole('dialog', { name: 'A shared photo workshop' })).toBeVisible({ timeout: 100_000 });
  await expect(world).toHaveAttribute('data-phase', 'stopped');
  await expect(otherPage.getByRole('heading', { name: 'A shared photo workshop' })).toBeVisible();
  await expect(otherPage.locator('.station-book')).toHaveAttribute('data-station-number', '04');
  await expect.poll(() => otherPage.locator('.station-book__cover-art img').evaluate(img => img.naturalWidth)).toBe(100);
  await otherPage.getByRole('button', { name: 'Next book page' }).click();
  await expect(otherPage.locator('.station-book__panel')).toHaveCount(1);
  await expect(otherPage.getByRole('link', { name: 'View photo album' })).toHaveAttribute('href', 'https://drive.google.com/drive/folders/workshop');
  await expect(otherPage.getByRole('link', { name: 'Register for event' })).toHaveAttribute('href', 'https://example.com/register');
  const parked = await world.getAttribute('data-distance');
  await otherPage.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('blur'));
  });
  const refreshed = otherPage.waitForResponse('**/api/site');
  await otherPage.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
  });
  await refreshed;
  await expect(otherPage.locator('.station-book')).toHaveAttribute('data-book-page', '2');
  await expect(world).toHaveAttribute('data-distance', parked);
  expect(await otherPage.evaluate(() => window.visitCanvas === document.querySelector('.nx-world canvas'))).toBe(true);
  await otherPage.getByRole('button', { name: 'Continue ride', exact: true }).click();
  await expect(world).toHaveAttribute('data-drive-ready', 'true');
  await otherPage.keyboard.down('w');
  await expect.poll(() => world.getAttribute('data-distance')).not.toBe(parked);
  await otherPage.keyboard.up('w');
  expect(errors).toEqual([]); await visitor.close();
});

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 640, height: 360 }, { width: 768, height: 1024 }, { width: 844, height: 390 }, { width: 1024, height: 1366 }]) {
  test(`compact ride controls and camera fit ${viewport.width}x${viewport.height}`, async ({ browser }, info) => {
    const compact = viewport.width <= 768 || viewport.height <= 500;
    const context = await browser.newContext({ baseURL: info.project.use.baseURL, viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await connect(page); await ready(page);
      const world = page.locator('.nx-world');
      if (await page.getByRole('button', { name: 'Return to ride' }).isVisible()) await page.getByRole('button', { name: 'Return to ride' }).click();
      await world.focus();
      await expect(world).toHaveAttribute('data-drive-ready', 'true');
      await expect(world).toHaveAttribute('data-antialias', 'true');
      await expect(page.locator('.nx-joystick')).toBeEnabled();
      await expect(page.getByRole('button', { name: /restart|reset ride/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Events 3', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Event', exact: true })).toBeVisible();
      if (compact) { await expect(page.locator('.nx-minimap')).toHaveCount(0); await expect(page.locator('.nx-glimpses')).toHaveCount(0); }
      const layout = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        return { width: innerWidth, scroll: document.documentElement.scrollWidth, pixelWidth: document.querySelector('.nx-world canvas').width,
          world: rect('.nx-world'), controls: rect('.nx-controls'), joystick: rect('.nx-joystick'), boost: rect('.nx-boost-button'), map: rect('.nx-map-button'), top: rect('.nx-topbar') };
      });
      expect(layout.scroll).toBe(layout.width); expect(layout.pixelWidth / layout.world.width).toBeLessThanOrEqual(1.26);
      expect(layout.controls.height).toBeLessThanOrEqual(72);
      expect(layout.controls.y - layout.top.bottom).toBeGreaterThan(layout.world.height * .45);
      for (const control of [layout.joystick, layout.boost, layout.map]) {
        expect(control.width).toBeGreaterThanOrEqual(44); expect(control.height).toBeGreaterThanOrEqual(44);
        expect(control.x).toBeGreaterThanOrEqual(12); expect(control.right).toBeLessThanOrEqual(viewport.width - 12);
        expect(control.bottom).toBeLessThanOrEqual(layout.world.bottom - 10);
      }
      expect(layout.joystick.right + 8).toBeLessThanOrEqual(layout.boost.x);
      expect(layout.boost.right + 7).toBeLessThanOrEqual(layout.map.x);
      expect(Math.abs(layout.boost.y - layout.map.y)).toBeLessThan(1);
      await page.screenshot({ path: info.outputPath('mobile-ride.png') });
      await page.mouse.move(layout.boost.x + layout.boost.width / 2, layout.boost.y + layout.boost.height / 2); await page.mouse.down();
      await expect(world).toHaveAttribute('data-boost', 'true');
      await expect.poll(() => world.getAttribute('data-speed').then(Number), { timeout: 15_000 }).toBeGreaterThan(15);
      const sample = await page.evaluate(() => new Promise(resolve => {
        const timings = []; let previous = performance.now();
        function frame(now) {
          timings.push(now - previous); previous = now;
          if (timings.length < 60) requestAnimationFrame(frame);
          else { timings.sort((a, b) => a - b); resolve({ medianMs: timings[30], p95Ms: timings[57], ...document.querySelector('.nx-world').dataset }); }
        }
        requestAnimationFrame(frame);
      }));
      console.log(`Ride frame sample ${viewport.width}x${viewport.height}:`, JSON.stringify(sample));
      expect(Number(sample.cameraLag)).toBeLessThan(.16);
      expect(Number(sample.fov)).toBeGreaterThanOrEqual(76);
      await page.mouse.up(); await expect(world).toHaveAttribute('data-boost', 'false');
      await page.getByRole('button', { name: 'Open holographic map' }).click();
      await expect(page.locator('.nx-joystick')).toHaveCount(0); await expect(page.locator('.nx-boost-button')).toHaveCount(0);
      await expect(world).toHaveAttribute('data-orbit', 'true');
      await page.screenshot({ path: info.outputPath('mobile-map.png') });
      await page.locator('[data-stop-kind=event]').first().click();
      await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible();
      await page.getByRole('button', { name: 'Close event', exact: true }).click();
      await page.getByRole('button', { name: 'Add Event', exact: true }).click(); await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test('reduced motion and WebGL failure preserve the accessible event list and publishing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args); }; });
  await connect(page); await expect(page.getByText('The ride is unavailable.')).toBeVisible();
  await expect(page.locator('.nx-experience')).toHaveAttribute('data-reduced-motion', 'true');
  await page.getByRole('button', { name: 'Events 3', exact: true }).click();
  await page.getByRole('dialog', { name: 'Event stations' }).getByRole('button', { name: /The first connection/ }).click(); await expect(page.getByRole('heading', { name: 'The first connection' })).toBeVisible();
  await page.getByRole('button', { name: 'Close event', exact: true }).click();
  await page.getByRole('button', { name: 'Add Event', exact: true }).click(); await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
});

test('map checkpoints park the trolley, panning is bounded, and teasers do not interrupt driving', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await connect(page); await ready(page);
  const world = page.locator('.nx-world');
  await expect(world).toHaveAttribute('data-speed', '0.00');
  const initialPan = await world.getAttribute('data-pan');
  await page.mouse.move(1130, 350); await page.mouse.down({ button: 'right' }); await page.mouse.move(970, 430, { steps: 15 }); await page.mouse.up({ button: 'right' });
  await expect.poll(() => world.getAttribute('data-pan')).not.toBe(initialPan);
  for (let i = 0; i < 4; i++) { await page.mouse.move(1100, 250); await page.mouse.down({ button: 'right' }); await page.mouse.move(350, 800, { steps: 8 }); await page.mouse.up({ button: 'right' }); }
  await page.waitForTimeout(1100);
  const pan = (await world.getAttribute('data-pan')).split(',').map(Number);
  expect(pan[0]).toBeGreaterThan(-90); expect(pan[0]).toBeLessThan(95);
  expect(pan[1]).toBeGreaterThanOrEqual(-3); expect(pan[1]).toBeLessThan(120);
  expect(pan[2]).toBeGreaterThan(-65); expect(pan[2]).toBeLessThan(180);
  // Reset the camera through a ride/map transition, then use an actual projected marker.
  await page.getByRole('button', { name: 'Return to ride' }).click(); await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Open holographic map' }).click(); await page.waitForTimeout(1500);
  await page.locator('[data-stop-kind=event]').first().click();
  await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible();
  await expect(page.locator('.nx-event-artwork')).toBeVisible();
  await page.screenshot({ path: info.outputPath('event-template.png') });
  await page.getByRole('button', { name: 'Close event', exact: true }).click();
  await expect(world).toHaveAttribute('data-distance', '211.00');
  await expect(world).toHaveAttribute('data-speed', '0.00');
  await page.waitForTimeout(1300); await expect(world).toHaveAttribute('data-distance', '211.00');
  await world.focus(); await page.keyboard.down('w');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeGreaterThan(225);
  await expect(page.locator('.nx-glimpses')).toBeVisible();
  await page.screenshot({ path: info.outputPath('ride-anticipation.png') });
  await page.keyboard.up('w');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.nx-teaser')).toHaveCount(0);
  await expect(world).toHaveAttribute('data-dilation', '1.000');
  expect(errors).toEqual([]);
});

test('a photo-free event has category artwork and both links after publishing', async ({ page }, info) => {
  await connect(page); await ready(page);
  await page.getByRole('button', { name: 'Add Event', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com'); await page.getByLabel('Password', { exact: true }).fill('browser-fixture-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Event title', { exact: true }).fill('Connections without uploads');
  await page.getByLabel('Event details', { exact: true }).fill('A community afternoon to share ideas and build something together.');
  await page.getByLabel('Date and time (your local timezone)', { exact: true }).fill('2026-10-20T15:00');
  await page.getByLabel('Location', { exact: true }).fill('SJEC'); await page.getByLabel('Category', { exact: true }).fill('Community');
  await page.getByLabel('Photo album link (Google Drive or any share URL)', { exact: false }).fill('https://drive.google.com/drive/folders/community');
  await page.getByLabel('Registration link', { exact: false }).fill('https://example.com/community');
  await page.getByRole('button', { name: 'Publish event & add station', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('is published');
  await page.getByRole('button', { name: 'Events 4', exact: true }).click();
  await page.getByRole('dialog', { name: 'Event stations' }).getByRole('button', { name: /Connections without uploads/ }).click();
  await expect(page.locator('.nx-event-artwork')).toBeVisible();
  await expect(page.locator('.nx-event-gallery')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View photo album' })).toHaveAttribute('href', 'https://drive.google.com/drive/folders/community');
  await expect(page.getByRole('link', { name: 'Register for event' })).toHaveAttribute('href', 'https://example.com/community');
  await page.screenshot({ path: info.outputPath('photo-free-event.png') });
  await page.getByRole('button', { name: 'Close event', exact: true }).click();
  await page.getByRole('button', { name: 'Change experience' }).click();
  await page.getByRole('button', { name: /Quick Browse/ }).click();
  await page.getByRole('region', { name: 'Event carousel' }).focus();
  await page.keyboard.press('End');
  await page.getByRole('button', { name: 'Explore Connections without uploads', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('A community afternoon to share ideas');
  await expect(page.getByRole('link', { name: 'Register for event' })).toHaveAttribute('href', 'https://example.com/community');
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 1366 }]) {
  test(`cinematic glimpses and map gestures fit ${viewport.width}x${viewport.height}`, async ({ browser }, info) => {
    const touch = viewport.width !== 1440;
    const context = await browser.newContext({ baseURL: info.project.use.baseURL, viewport, deviceScaleFactor: touch ? 3 : 1, isMobile: touch, hasTouch: touch });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await connect(page); await ready(page);
      const world = page.locator('.nx-world');
      await expect(world).toHaveAttribute('data-orbit', 'true');
      await page.screenshot({ path: info.outputPath('map.png') });
      await page.getByRole('button', { name: 'Return to ride' }).click();
      await expect(world).toHaveAttribute('data-drive-ready', 'true');
      await page.evaluate(() => {
        window.glimpseSamples = [];
        const sample = () => {
          const panel = document.querySelector('.nx-glimpses');
          if (panel && !panel.hidden) window.glimpseSamples.push([...panel.querySelectorAll('.nx-glimpse')]
            .filter(el => Number(getComputedStyle(el).opacity) > 0)
            .map(el => ({ index: Number(el.dataset.frame), side: el.classList.contains('nx-glimpse-left') ? 'left' : 'right' })));
          window.glimpseSampler = requestAnimationFrame(sample);
        };
        window.glimpseSampler = requestAnimationFrame(sample);
      });
      if (touch) {
        const joystick = await page.locator('.nx-joystick').boundingBox();
        await page.mouse.move(joystick.x + joystick.width / 2, joystick.y + joystick.height / 2);
        await page.mouse.down();
        await page.mouse.move(joystick.x + joystick.width / 2, joystick.y + 8, { steps: 4 });
      } else { await world.focus(); await page.keyboard.down('w'); }
      await expect(page.locator('.nx-glimpses')).toBeVisible();
      await expect.poll(() => page.locator('.nx-glimpse-right').evaluateAll(elements => Math.max(...elements.map(el => Number(getComputedStyle(el).opacity)))), { timeout: 20_000 }).toBeGreaterThan(.85);
      const samples = await page.evaluate(() => { cancelAnimationFrame(window.glimpseSampler); return window.glimpseSamples; });
      expect(samples.every(visible => visible.length <= 1)).toBe(true);
      const sequence = samples.flat().filter((photo, index, all) => index === 0 || photo.index !== all[index - 1].index);
      expect(sequence).toEqual([{ index: 0, side: 'left' }, { index: 1, side: 'right' }]);
      const lastLeft = samples.findLastIndex(visible => visible[0]?.index === 0);
      const firstRight = samples.findIndex(visible => visible[0]?.index === 1);
      expect(samples.slice(lastLeft + 1, firstRight).some(visible => visible.length === 0)).toBe(true);
      await expect(page.locator('.nx-glimpse-placeholder')).toHaveCount(4);
      await expect.poll(() => world.getAttribute('data-speed').then(Number)).toBeGreaterThan(15);
      const layout = await page.evaluate(() => {
        const rect = selector => { const el = [...document.querySelectorAll(selector)].sort((a, b) => Number(getComputedStyle(b).opacity) - Number(getComputedStyle(a).opacity))[0]; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }; };
        return { width: innerWidth, scroll: document.documentElement.scrollWidth, left: rect('.nx-glimpse-left'), right: rect('.nx-glimpse-right'), map: rect('.nx-minimap'), controls: rect('.nx-controls'), pointer: getComputedStyle(document.querySelector('.nx-glimpses')).pointerEvents };
      });
      expect(layout.scroll).toBe(layout.width); expect(layout.pointer).toBe('none');
      expect(layout.left.right).toBeLessThan(layout.right.x);
      expect(layout.left.x).toBeGreaterThan(16); expect(layout.right.right).toBeLessThan(viewport.width - 16);
      expect(layout.map.x).toBeGreaterThan(viewport.width / 2);
      expect(Math.max(layout.left.bottom, layout.right.bottom)).toBeLessThan(layout.controls.y);
      for (const card of [layout.left, layout.right]) {
        expect(card.right <= layout.map.x || card.x >= layout.map.right || card.bottom <= layout.map.y || card.y >= layout.map.bottom).toBe(true);
      }
      await page.screenshot({ path: info.outputPath('cinematic-ride.png') });
      if (touch) await page.mouse.up(); else await page.keyboard.up('w');
      await page.getByRole('button', { name: 'Open holographic map' }).click();
      await expect(page.locator('.nx-glimpses')).toBeHidden();
      await expect(world).toHaveAttribute('data-orbit', 'true');
      await expect(world).toHaveAttribute('data-pan', '0.0,50.0,35.0');
      const canvas = await world.locator('canvas').boundingBox();
      await page.mouse.move(canvas.x + canvas.width * .65, canvas.y + canvas.height * .3);
      await page.mouse.down(); await page.mouse.move(canvas.x + canvas.width * .8, canvas.y + canvas.height * .35, { steps: 8 }); await page.mouse.up();
      await expect(world).toHaveAttribute('data-orbit', 'false');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.getByRole('button', { name: 'Return to ride' }).click();
      await expect(page.locator('.nx-glimpses')).toBeHidden();
      await expect(world).toHaveAttribute('data-dilation', '1.000');
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}
