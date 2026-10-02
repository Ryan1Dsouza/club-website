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

async function seekFrame(page, time) {
  return screen(page).locator('.nucleus-loader__frame').evaluateAll((frames, time) => {
    frames.forEach(frame => {
      for (const animation of frame.getAnimations()) {
        animation.pause();
        animation.currentTime = time;
      }
    });
    return frames.flatMap((frame, index) => getComputedStyle(frame).visibility === 'visible' ? [index] : []);
  }, time);
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
  await expect(loader.locator('.nucleus-loader__frame')).toHaveCount(17);

  for (let index = 0; index < 17; index++) {
    // Test real browser animation output on both sides of every cut, including wrap.
    expect(await seekFrame(page, 850 + index * 50 + 1)).toEqual([index]);
    expect(await seekFrame(page, 850 + index * 50 + 49)).toEqual([index]);
  }
  expect(await seekFrame(page, 1701)).toEqual([0]);
  await page.screenshot({ path: info.outputPath('loader-desktop.png') });
  await seekFrame(page, 1175);
  await page.screenshot({ path: info.outputPath('loader-nucleus-wordmark.png') });
  // Resume to verify that the sequence advances on its own, too.
  await loader.locator('.nucleus-loader__frame').evaluateAll(frames => frames.forEach(frame => frame.getAnimations().forEach(animation => animation.play())));
  const visible = () => loader.locator('.nucleus-loader__frame').evaluateAll(frames => frames.findIndex(frame => getComputedStyle(frame).visibility === 'visible'));
  const current = await visible();
  await expect.poll(visible).not.toBe(current);
  release();
  await page.clock.runFor(400);
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
  test(`brief startup timing and artwork crop at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    await recordTiming(page);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.setViewportSize(viewport);
    await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
    const loader = screen(page);
    await expect(loader).toBeVisible();
    const box = await loader.boundingBox();
    expect(box).toEqual({ x: 0, y: 0, ...viewport });
    await expect(loader.locator('.nucleus-loader__frame').first()).toHaveCSS('mask-size', viewport.width <= 480 ? '400% auto' : 'cover');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: info.outputPath(`loader-${viewport.width}.png`) });
    await expect(loader).toHaveCount(0, { timeout: 3000 });
    const times = await page.evaluate(() => window.loaderTimes);
    expect(times.exiting - times.loading).toBeGreaterThanOrEqual(350);
    expect(times.exiting - times.loading).toBeLessThan(850);
    const exitDuration = viewport.width <= 480 ? 350 : 450;
    expect(times.done - times.exiting).toBeGreaterThanOrEqual(exitDuration - 60);
    expect(times.done - times.exiting).toBeLessThan(exitDuration + 450);
    expect(times.done - times.loading).toBeLessThan(1600);
    await info.attach('startup-timing', { body: JSON.stringify(times), contentType: 'application/json' });
  });
}

test('home particles start rendering beneath the exiting loading curtain', async ({ page }) => {
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
  expect(firstFrame.stage).toBe('exiting');
  expect(firstFrame.curtainPresent).toBe(true);
  expect(firstFrame.time).toBeGreaterThanOrEqual(times.exiting);
  expect(firstFrame.time).toBeLessThan(times.done);
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
  expect(await frames.nth(5).evaluate(element => getComputedStyle(element).maskImage)).toBe(await frames.first().evaluate(element => getComputedStyle(element).maskImage));
  expect(await seekFrame(page, 1125)).toEqual([5]);
  release();
  await page.clock.runFor(400);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  await page.clock.runFor(500);
  await expect(screen(page)).toHaveCount(0);
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
    await expect(screen(page)).toHaveCount(0, { timeout: 2000 });
    const times = await page.evaluate(() => window.loaderTimes);
    expect(times.done - times.loading).toBeLessThan(1500);
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
    const html = (await response.text()).replace('<div id="root"></div>', `<div id="root">${markup}</div><script id="nucleus-data" type="application/json">${JSON.stringify(site)}</script>`);
    await route.fulfill({ response, body: html });
  };
  await page.route('**/recruitment', serverPage);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const release = await holdInitialRequest(page);
  await recordTiming(page);
  await page.goto('/recruitment');
  await expect(screen(page)).toHaveCount(0, { timeout: 2500 });
  const times = await page.evaluate(() => window.loaderTimes);
  expect(times.done - times.loading).toBeGreaterThan(700);
  expect(times.done - times.loading).toBeLessThan(1500);
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
