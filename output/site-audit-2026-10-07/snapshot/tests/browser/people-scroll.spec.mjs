import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    // Exercise the input path even on a device with a limited render budget.
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    window.__scrollAudit = { frames: 0, resizes: [], preventedTouches: 0, nativeScrollY: scrollY };
    window.addEventListener('scroll', () => { window.__scrollAudit.nativeScrollY = scrollY; }, { passive: true });
    window.addEventListener('touchmove', event => {
      queueMicrotask(() => { if (event.defaultPrevented) window.__scrollAudit.preventedTouches++; });
    }, { passive: true });
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer), resize = renderer.setDrawingBufferSize.bind(renderer);
      renderer.render = (...args) => { window.__scrollAudit.frames++; return render(...args); };
      renderer.setDrawingBufferSize = (...args) => { window.__scrollAudit.resizes.push(args); return resize(...args); };
    } };
  });
});

async function openTower(page) {
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await expect.poll(() => page.evaluate(() => window.__scrollAudit.frames)).toBeGreaterThan(0);
}

async function controlClock(page) {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.clock.runFor(200);
}

async function selectMember(page, index) {
  await page.getByLabel('Jump to a member').selectOption(String(index));
  const target = await page.evaluate(() => scrollY);
  // Native scroll events use the compositor clock, not the paused JS clock.
  // Let the event wake the scene before advancing its animation frames.
  await expect.poll(() => page.evaluate(() => window.__scrollAudit.nativeScrollY)).toBe(target);
  await page.clock.runFor(240);
}

async function expectCoverage(page) {
  const coverage = await page.locator('.people-tower__stage').evaluate(stage => {
    const bounds = stage.getBoundingClientRect(), canvas = stage.querySelector('canvas').getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom, canvasTop: canvas.top, canvasBottom: canvas.bottom,
      width: bounds.width, viewportWidth: innerWidth, viewportHeight: innerHeight,
      pageWidth: document.documentElement.scrollWidth };
  });
  expect(coverage.top).toBe(0);
  expect(coverage.canvasTop).toBe(0);
  expect(coverage.bottom).toBeGreaterThanOrEqual(coverage.viewportHeight);
  expect(coverage.canvasBottom).toBeGreaterThanOrEqual(coverage.viewportHeight);
  expect(coverage.width).toBe(coverage.viewportWidth);
  expect(coverage.pageWidth).toBe(coverage.viewportWidth);
}

test('desktop wheel responds promptly, catches up after slow frames, and rests when settled', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openTower(page);
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await controlClock(page);
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 400);
  await page.clock.runFor(96);
  const firstResponse = await page.evaluate(() => scrollY);
  expect(firstResponse).toBeGreaterThan(150);
  expect(firstResponse).toBeLessThan(400);
  await page.clock.runFor(600);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(400, 0);
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);

  await page.mouse.wheel(0, 400);
  // One RAF every 64 ms simulates a busy device. Scroll duration must still use
  // elapsed time, rather than turning a 600 ms gesture into a multi-second tail.
  for (let frame = 0; frame < 12; frame++) await page.clock.fastForward(64);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(800, 0);
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);

  await selectMember(page, 2);
  await expect(page.locator('.people-tower__world')).toHaveAttribute('data-active-member', '2');
  const frames = await page.evaluate(() => window.__scrollAudit.frames);
  await page.clock.runFor(500);
  expect(await page.evaluate(() => window.__scrollAudit.frames)).toBe(frames);
  await expectCoverage(page);

  // Keyboard/assistive scrolling and reduced-motion changes retain control.
  await page.locator('#main-content').focus();
  await page.mouse.wheel(0, 200);
  await page.clock.runFor(32);
  await page.keyboard.press('Home');
  await page.clock.runFor(700);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
});

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 393, height: 740 }, screen: { width: 393, height: 851 },
    isMobile: true, hasTouch: true, deviceScaleFactor: 2.75 });

  test('first swipe stays native and fills the screen through viewport resizing and rotation', async ({ page }, info) => {
    await openTower(page);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await expect(page.locator('.people-tower__stage')).toHaveCSS('position', 'fixed');
    await expect(page.locator('html')).toHaveCSS('overscroll-behavior-y', 'none');
    await expectCoverage(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 530 }] });
    for (let y = 510; y >= 350; y -= 20) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
      await page.evaluate(() => new Promise(requestAnimationFrame));
      await expectCoverage(page);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    expect(await page.evaluate(() => window.__scrollAudit.preventedTouches)).toBe(0);
    await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');

    // Native fling runs on the browser compositor, outside Playwright's JS
    // clock. Stop it with a real tap before taking control of animation time.
    await page.touchscreen.tap(20, 100);
    await expect.poll(async () => {
      const before = await page.evaluate(() => scrollY);
      await page.waitForTimeout(100);
      return (await page.evaluate(() => scrollY)) === before;
    }).toBe(true);
    await controlClock(page);
    const resizes = await page.evaluate(() => window.__scrollAudit.resizes.length);
    for (const height of [765, 795, 825, 851]) {
      await page.setViewportSize({ width: 393, height });
      await page.clock.runFor(32);
      await expectCoverage(page);
    }
    expect(await page.evaluate(() => window.__scrollAudit.resizes.length)).toBe(resizes);
    await page.clock.runFor(240);
    expect(await page.evaluate(() => window.__scrollAudit.resizes.length)).toBe(resizes + 1);
    expect(await page.evaluate(() => window.__scrollAudit.resizes.at(-1).slice(0, 2))).toEqual([393, 851]);

    await selectMember(page, 2);
    await expect(page.locator('.people-tower__world')).toHaveAttribute('data-active-member', '2');
    const profile = page.locator('.tower-profile').filter({ has: page.locator('[data-profile-index]', { hasText: '03 /' }) });
    await expect(profile).toHaveCSS('opacity', '1');
    await page.screenshot({ path: info.outputPath('portrait.png') });
    await page.setViewportSize({ width: 851, height: 393 });
    await page.clock.runFor(32);
    await expectCoverage(page);
    expect(await page.evaluate(() => window.__scrollAudit.resizes.at(-1).slice(0, 2))).toEqual([851, 393]);
    await selectMember(page, 2);
    const box = await profile.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(852);
    expect(box.y + box.height).toBeLessThanOrEqual(394);
    await page.screenshot({ path: info.outputPath('landscape.png') });
    // Rotation changes the story's scroll range. Returning to the selected
    // member can first play the existing staggered block-return animation.
    await expect.poll(async () => {
      const before = await page.evaluate(() => window.__scrollAudit.frames);
      await page.clock.runFor(250);
      return (await page.evaluate(() => window.__scrollAudit.frames)) === before;
    }, { timeout: 15_000 }).toBe(true);
    const frames = await page.evaluate(() => window.__scrollAudit.frames);
    await page.clock.runFor(500);
    expect(await page.evaluate(() => window.__scrollAudit.frames)).toBe(frames);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
    await expect(page.locator('.people-tower__stage')).toHaveCSS('position', 'relative');
    await expect(page.locator('html')).toHaveCSS('overscroll-behavior-y', 'auto');
  });
});
