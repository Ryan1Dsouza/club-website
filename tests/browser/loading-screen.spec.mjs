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

test('native desktop playback advances without a JS clock and the opaque curtain exits once', async ({ page }, info) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await freezeStartup(page);
  const release = await holdInitialRequest(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/recruitment');
  const loader = screen(page);
  await expect(loader).toHaveAttribute('data-frames-ready', 'true');
  const pageBackdrop = await page.evaluate(() => {
    const swatch = document.createElement('div');
    swatch.style.backgroundColor = 'var(--page-backdrop)';
    document.body.append(swatch);
    const color = getComputedStyle(swatch).backgroundColor;
    swatch.remove();
    return color;
  });
  await expect(loader).toHaveCSS('background-color', pageBackdrop);
  await expect(loader).toHaveCSS('color', 'rgb(155, 207, 162)');
  await expect(loader.getByRole('status')).toHaveText('Connecting the dots…');
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(true);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const video = loader.locator('video');
  expect(await video.evaluate(video => video.duration)).toBeCloseTo(.85, 2);
  const snapshots = [];
  for (let index = 0; index < 4; index++) {
    snapshots.push((await loader.screenshot({ animations: 'allow' })).toString('base64'));
    await new Promise(resolve => setTimeout(resolve, 125));
  }
  expect(new Set(snapshots).size).toBeGreaterThan(2);
  await page.screenshot({ path: info.outputPath('loader-desktop.png') });
  release();
  await page.clock.runFor(1500);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  await page.clock.runFor(120);
  await expect(loader).toHaveCSS('clip-path', 'none');
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

test('native video advances its media pipeline during a blocked JavaScript task', async ({ page }, info) => {
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  const sample = await screen(page).locator('video').evaluate(video => {
    const before = video.getVideoPlaybackQuality();
    const start = performance.now(), until = start + 600;
    while (performance.now() < until) { /* Simulate synchronous parsing/work. */ }
    const after = video.getVideoPlaybackQuality();
    return { blockedMs: performance.now() - start, frames: after.totalVideoFrames - before.totalVideoFrames,
      dropped: after.droppedVideoFrames - before.droppedVideoFrames };
  });
  release();
  await info.attach('blocked-js-playback', { body: JSON.stringify(sample), contentType: 'application/json' });
  expect(sample.blockedMs).toBeGreaterThanOrEqual(600);
  expect(sample.frames - sample.dropped).toBeGreaterThanOrEqual(6);
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
    await expect(loader.locator('video')).toHaveCSS('object-fit', 'cover');
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
  const mediaRequests = [];
  page.on('request', request => { if (/\.mp4$/.test(request.url()) && request.resourceType() !== 'script') mediaRequests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  const loader = screen(page);
  await expect(loader).toBeVisible();
  await expect(loader.locator('.nucleus-loader__poster')).toBeVisible();
  await expect(loader.locator('video')).toBeHidden();
  expect(await loader.locator('video').evaluate(video => video.paused)).toBe(true);
  expect(mediaRequests).toEqual([]);
  const started = Date.now();
  release();
  await expect(loader).toHaveCount(0, { timeout: 1000 });
  expect(Date.now() - started).toBeLessThan(1000);
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
});

test('failed video playback keeps the branded poster and never blocks startup', async ({ page }) => {
  await freezeStartup(page);
  await page.route('**/*.mp4', route => route.abort());
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
  const poster = screen(page).locator('.nucleus-loader__poster img');
  await expect(poster).toBeVisible();
  expect(await poster.evaluate(image => image.complete && image.naturalWidth > 1)).toBe(true);
  release();
  await page.clock.runFor(1500);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  await page.clock.runFor(500);
  await expect(screen(page)).toHaveCount(0);
});

test.describe('mobile artwork', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

  test('native video animates with JS paused and fills portrait and landscape screens', async ({ page }, info) => {
    await freezeStartup(page);
    const requests = [];
    page.on('request', request => { if (['image', 'media', 'fetch', 'other'].includes(request.resourceType()) && /loading/.test(request.url())) requests.push(request.url()); });
    const release = await holdInitialRequest(page);
    await page.goto('/events');
    await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
    const image = screen(page).locator('.nucleus-loader__poster img');
    await expect(image).toBeVisible();
    expect(new Set(requests.filter(url => /sequence\.mp4/.test(url))).size).toBe(1);
    expect(requests.filter(url => /desktop\/sequence/.test(url))).toHaveLength(0);
    expect(requests.filter(url => /frame-\d+/.test(url))).toHaveLength(0);
    // Check the decoded artwork, not just the video element's fullscreen box.
    // The old portrait clip baked blank bands above and below a small sketch.
    const ink = await screen(page).locator('video').evaluate(async video => {
      video.pause();
      await new Promise(resolve => {
        video.addEventListener('seeked', resolve, { once: true });
        video.currentTime = .52;
      });
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const bandHeight = Math.floor(canvas.height * .2);
      const countInk = start => {
        let count = 0;
        for (let y = start; y < start + bandHeight; y++) {
          for (let x = 0; x < canvas.width; x++) {
            if (pixels[(y * canvas.width + x) * 4 + 1] > 60) count++;
          }
        }
        return count;
      };
      const ink = { top: countInk(0), bottom: countInk(canvas.height - bandHeight) };
      await video.play();
      return ink;
    });
    expect(ink.top).toBeGreaterThan(20);
    expect(ink.bottom).toBeGreaterThan(20);
    // Native decoding advances even while the test has frozen all JS timers/RAF.
    const snapshots = [];
    for (let index = 0; index < 4; index++) {
      snapshots.push((await screen(page).screenshot({ animations: 'allow' })).toString('base64'));
      await new Promise(resolve => setTimeout(resolve, 125));
    }
    expect(new Set(snapshots).size).toBeGreaterThan(2);
    // The static branded frame also makes screenshot comparisons deterministic.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(screen(page).locator('video')).toBeHidden();
    for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      await expect(image).toHaveCSS('object-fit', 'cover');
      await expect(screen(page)).toHaveCSS('height', `${viewport.height}px`);
      const artworkBox = await image.boundingBox();
      // Overscan keeps the media's hard edges outside the visible viewport.
      expect(artworkBox.x).toBeLessThan(0);
      expect(artworkBox.y).toBeLessThan(0);
      expect(artworkBox.x + artworkBox.width).toBeGreaterThan(viewport.width);
      expect(artworkBox.y + artworkBox.height).toBeGreaterThan(viewport.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      const portrait = viewport.height >= viewport.width;
      await expect.poll(() => image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight })))
        .toEqual(portrait ? { width: 480, height: 1040 } : { width: 1440, height: 810 });
      await page.screenshot({ path: info.outputPath(`loader-fullscreen-${viewport.width}.png`) });
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
    await expect.poll(() => screen(page).locator('video').evaluate(video => [video.videoWidth, video.videoHeight]))
      .toEqual([1440, 810]);
    release();
    await page.clock.runFor(1500);
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
    await expect(screen(page)).toHaveCSS('clip-path', 'none');
    await page.clock.runFor(500);
    await expect(screen(page)).toHaveCount(0);
  });

  test('all failed images leave a readable fallback', async ({ page }) => {
    await freezeStartup(page);
    const release = await holdInitialRequest(page);
    await page.route('**/loading/**', route => ['image', 'media', 'fetch', 'other'].includes(route.request().resourceType()) ? route.abort() : route.continue());
    await page.goto('/recruitment');
    await expect(page.locator('.nucleus-loader__fallback')).toHaveText('Nucleus');
    release();
    await page.clock.runFor(1500);
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
    await page.clock.runFor(500);
    await expect(screen(page)).toHaveCount(0);
  });

  test('a slower mobile CPU still reveals the usable events page promptly', async ({ page }) => {
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await recordTiming(page);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('/events', { waitUntil: 'domcontentloaded' });
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
  await page.route(/\.(?:webp|woff2|mp4)(?:\?.*)?$/, async route => {
    // Vite also serves asset URLs as JavaScript modules; keep those imports usable.
    if (!['image', 'font', 'media', 'fetch', 'other'].includes(route.request().resourceType())) { await route.continue(); return; }
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
