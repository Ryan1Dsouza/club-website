import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const screen = page => page.locator('[data-loading-screen]');

async function freezeStartup(page) {
  // Inspect every artwork frame without extending the real startup deadline.
  await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
}

async function holdInitialRequest(page) {
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  await page.route('**/api/site', async route => {
    await ready;
    await route.fulfill({ json: site }).catch(() => {});
  });
  return release;
}

async function recordTiming(page) {
  await page.addInitScript(() => {
    window.loaderTimes = {};
    new MutationObserver(() => {
      const stage = document.querySelector('.site-shell')?.dataset.loadingStage;
      const ready = document.querySelector('[data-frames-ready="true"]');
      if (stage && !(stage in window.loaderTimes)) window.loaderTimes[stage] = performance.now();
      if (ready && !window.loaderTimes.frames) window.loaderTimes.frames = performance.now();
    }).observe(document, { subtree: true, childList: true, attributes: true });
  });
}

test('the full-screen sequence cuts every 50 ms, loops without blank frames, and wipes away once', async ({ page }, info) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await freezeStartup(page);
  const release = await holdInitialRequest(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/recruitment');
  const loader = screen(page);
  await expect(loader).toHaveAttribute('data-frames-ready', 'true');
  await expect(loader).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(loader).toHaveCSS('color', 'rgb(195, 229, 200)');
  await expect(page.getByRole('status')).toHaveText('Connecting the dots…');
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(true);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(loader.locator('.nucleus-loader__frame')).toHaveCount(1);

  const frame = loader.locator('.nucleus-loader__frame');
  await page.clock.runFor(40);
  await expect(frame).toHaveAttribute('data-frame', '0');
  for (let index = 1; index <= 17; index++) {
    await page.clock.runFor(50);
    await expect(frame).toHaveAttribute('data-frame', String(index % 17));
    await expect(frame).toHaveCSS('visibility', 'visible');
    if (index === 6) await page.screenshot({ path: info.outputPath('loader-nucleus-wordmark.png') });
  }
  await page.screenshot({ path: info.outputPath('loader-desktop.png') });
  release();
  await page.clock.runFor(600);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  await page.clock.runFor(120);
  await expect(loader).not.toHaveCSS('clip-path', 'inset(0%)');
  const exit = await loader.evaluate(element => ({
    x: new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
    opacity: getComputedStyle(element).opacity,
  }));
  expect(exit.x).toBeLessThan(0);
  expect(exit.opacity).toBe('1');
  await page.screenshot({ path: info.outputPath('loader-curtain-exit.png') });
  await page.clock.runFor(500);
  await expect(loader).toHaveCount(0);
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  expect(await page.locator('html').evaluate(element => element.style.scrollbarGutter)).toBe('');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.clock.runFor(1600);
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await page.clock.runFor(1300);
  await expect(page).toHaveURL(/\/projects$/);
  await expect(loader).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(loader).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`brief startup timing and artwork fit at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    await recordTiming(page);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.setViewportSize(viewport);
    await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
    const loader = screen(page);
    await expect(loader).toBeVisible();
    const box = await loader.boundingBox();
    expect(box).toEqual({ x: 0, y: 0, ...viewport });
    await expect(loader.locator('.nucleus-loader__frame').first()).toHaveCSS('mask-size', viewport.width <= 767 || viewport.height <= 500 ? 'contain' : 'cover');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: info.outputPath(`loader-${viewport.width}.png`) });
    await expect(loader).toHaveCount(0, { timeout: 3000 });
    const times = await page.evaluate(() => window.loaderTimes);
    expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1350);
    expect(times.exiting - times.loading).toBeLessThan(1900);
    const exitDuration = viewport.width <= 767 || viewport.height <= 500 ? 350 : 450;
    expect(times.done - times.exiting).toBeGreaterThanOrEqual(exitDuration - 60);
    expect(times.done - times.exiting).toBeLessThan(exitDuration + 450);
    expect(times.done - times.loading).toBeLessThan(2500);
    await info.attach('startup-timing', { body: JSON.stringify(times), contentType: 'application/json' });
  });
}

test('desktop logo waits until the loading curtain has exited', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await recordTiming(page);
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => {
        render(scene, camera);
        if (!window.heroFirstFrame && renderer.domElement.closest('.logo-landing__scene')) {
          window.heroFirstFrame = {
            time: performance.now(),
            stage: document.querySelector('.site-shell')?.dataset.loadingStage,
            curtainPresent: Boolean(document.querySelector('[data-loading-screen]')),
          };
        }
      };
    } };
  });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  const { firstFrame, times } = await page.evaluate(() => ({ firstFrame: window.heroFirstFrame, times: window.loaderTimes }));
  expect(firstFrame.stage).toBe('done');
  expect(firstFrame.curtainPresent).toBe(false);
  expect(firstFrame.time).toBeGreaterThanOrEqual(times.done);
  expect(errors).toEqual([]);
});

test('reduced motion keeps one static frame and removes the artificial wait and wipe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  const loader = screen(page);
  await expect(loader).toBeVisible();
  await expect(loader.locator('.nucleus-loader__frame')).toHaveCount(1);
  await expect(loader.locator('.nucleus-loader__frame')).toHaveCSS('animation-name', 'none');
  const started = Date.now();
  release();
  await expect(loader).toHaveCount(0, { timeout: 1000 });
  expect(Date.now() - started).toBeLessThan(1000);
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
});

test('a failed frame uses a decoded replacement instead of a blank beat', async ({ page }) => {
  await freezeStartup(page);
  await page.route('**/frame-05.webp', route => route.abort());
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  const frames = screen(page).locator('.nucleus-loader__frame');
  await page.clock.runFor(40);
  const firstMask = await frames.evaluate(element => getComputedStyle(element).maskImage);
  await page.clock.runFor(250);
  await expect(frames).toHaveAttribute('data-frame', '5');
  expect(await frames.evaluate(element => getComputedStyle(element).maskImage)).toBe(firstMask);
  release();
  await page.clock.runFor(1200);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  await page.clock.runFor(500);
  await expect(screen(page)).toHaveCount(0);
});

test.describe('mobile artwork', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

  test('small phones, tablets and rotation fit every frame and only fetch small masks', async ({ page }, info) => {
    await freezeStartup(page);
    const requests = [];
    page.on('request', request => { if (request.resourceType() === 'image' && /frame-\d+\.webp/.test(request.url())) requests.push(request.url()); });
    const release = await holdInitialRequest(page);
    await page.goto('/recruitment');
    await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
    await page.clock.runFor(40);
    expect(requests.length).toBeGreaterThanOrEqual(17);
    expect(requests.every(url => url.includes('/loading/mobile/'))).toBe(true);
    for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      const frame = screen(page).locator('.nucleus-loader__frame');
      await expect(frame).toHaveCSS('mask-size', 'contain');
      await expect(screen(page)).toHaveCSS('height', `${viewport.height}px`);
      const box = await frame.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(16);
      expect(box.y).toBeGreaterThanOrEqual(16);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 16);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 16);
      for (let index = 0; index < 17; index++) {
        // Every source aspect ratio (including frame 15) fits inside this box.
        const size = await frame.evaluate(async (element, index) => {
          const url = getComputedStyle(element).maskImage.match(/url\("?(.*?)"?\)/)[1].replace(/frame-\d+/, `frame-${String(index).padStart(2, '0')}`);
          const image = new Image(); image.src = url; await image.decode();
          return { width: image.naturalWidth, height: image.naturalHeight };
        }, index);
        expect(size.width).toBe(640);
        const scale = Math.min(box.width / size.width, box.height / size.height);
        expect(size.width * scale).toBeLessThanOrEqual(box.width + .01);
        expect(size.height * scale).toBeLessThanOrEqual(box.height + .01);
      }
      await page.screenshot({ path: info.outputPath(`loader-fit-${viewport.width}.png`) });
    }
    release();
    await page.clock.runFor(1450);
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
    // Mobile exit only translates the curtain, avoiding an animated viewport mask.
    await expect(screen(page)).toHaveCSS('clip-path', 'inset(0%)');
    await page.clock.runFor(500);
    await expect(screen(page)).toHaveCount(0);
  });

  test('all failed images leave a readable fallback', async ({ page }) => {
    await freezeStartup(page);
    const release = await holdInitialRequest(page);
    await page.route('**/loading/mobile/frame-*.webp', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    await page.goto('/recruitment');
    await expect(page.locator('.nucleus-loader__fallback')).toHaveText('Nucleus');
    release();
    await page.clock.runFor(1500);
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
    await page.clock.runFor(500);
    await expect(screen(page)).toHaveCount(0);
  });

  test('a slower mobile CPU still reveals the usable page promptly', async ({ page }) => {
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await recordTiming(page);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
    await expect(screen(page)).toHaveCount(0, { timeout: 5000 });
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    const times = await page.evaluate(() => window.loaderTimes);
    expect(times.done - times.loading).toBeLessThan(2800);
    await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  });
});

test('stalled startup still reveals the usable page at the deadline', async ({ page }) => {
  await recordTiming(page);
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  await expect(screen(page)).toBeVisible();
  await expect(screen(page)).toHaveCount(0, { timeout: 3500 });
  const times = await page.evaluate(() => window.loaderTimes);
  expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1450);
  expect(times.exiting - times.loading).toBeLessThan(2100);
  expect(times.done - times.loading).toBeLessThan(2800);
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  const refreshed = page.waitForResponse('**/api/site');
  release();
  await refreshed;
  await expect(screen(page)).toHaveCount(0);
});

test('slow fonts and decorative frames never delay a ready page', async ({ page }) => {
  await recordTiming(page);
  let release;
  const assetsReady = new Promise(resolve => { release = resolve; });
  await page.route(/\.(?:webp|woff2)(?:\?.*)?$/, async route => {
    // Vite also serves asset URLs as JavaScript modules; keep those imports usable.
    if (!['image', 'font'].includes(route.request().resourceType())) { await route.continue(); return; }
    await assetsReady;
    await route.continue().catch(() => {});
  });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  try {
    await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
    await expect(screen(page)).toBeVisible();
    await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
    await expect(screen(page)).toHaveCount(0, { timeout: 3000 });
    const times = await page.evaluate(() => window.loaderTimes);
    expect(times.done - times.loading).toBeLessThan(2500);
    await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
    await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  } finally { release(); }
});

test('hydrated server content plays the intro without waiting for its background refresh', async ({ page, browser }) => {
  // Render the real app through Vite's SSR pipeline, then hydrate that markup.
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  let markup;
  try { markup = (await vite.ssrLoadModule('/src/entry-server.tsx')).render(site, '/recruitment'); }
  finally { await vite.close(); }
  const serverPage = async route => {
    const response = await route.fetch();
    const html = (await response.text()).replace(/<div id="root">[\s\S]*?<\/div>\s*<\/div>/,
      () => `<div id="root">${markup}</div><script id="nucleus-data" type="application/json">${JSON.stringify(site)}</script>`);
    expect(html).toContain('id="nucleus-data"');
    await route.fulfill({ response, body: html });
  };
  await page.route('**/recruitment', serverPage);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const release = await holdInitialRequest(page);
  await recordTiming(page);
  await page.goto('/recruitment');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(screen(page)).toHaveCount(0, { timeout: 2500 });
  const times = await page.evaluate(() => window.loaderTimes);
  expect(times.done - times.loading).toBeGreaterThan(700);
  expect(times.done - times.loading).toBeLessThan(2400);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  expect(errors).toEqual([]);
  release();
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  try {
    const readable = await noJs.newPage();
    await readable.route('**/recruitment', serverPage);
    await readable.goto(page.url());
    await expect(screen(readable)).toBeHidden();
    await expect(readable.locator('.site-shell')).not.toHaveAttribute('inert');
    await expect(readable.locator('h1')).toBeVisible();
  } finally { await noJs.close(); }
});
