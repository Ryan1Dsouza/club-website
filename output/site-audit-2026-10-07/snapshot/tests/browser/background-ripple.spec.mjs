import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const ripple = page => page.locator('.background-ripple-effect');
const activeWaves = page => ripple(page).evaluate(element => Number(element.dataset.activeWaves));
const ink = page => ripple(page).locator('canvas').evaluate(canvas => {
  const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  return pixels.some((value, index) => index % 4 === 3 && value > 0);
});

async function openHome(page) {
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
});

test('mint squares respond through the foreground and rapid clicks reuse a bounded surface', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await expect(ripple(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(ripple(page)).toHaveCSS('position', 'fixed');
  await expect(page.locator('#main-content')).toHaveCSS('z-index', '10');
  expect(await activeWaves(page)).toBe(0);
  await page.mouse.move(252, 252);
  await expect(page.locator('.background-ripple-effect__hover')).toBeVisible();
  await page.mouse.click(252, 252);
  await expect.poll(() => ink(page)).toBe(true);
  await page.screenshot({ path: info.outputPath('desktop-wave.png') });
  const burst = await ripple(page).evaluate(async element => {
    const canvas = element.querySelector('canvas');
    let added = 0, peak = 0;
    const observer = new MutationObserver(records => records.forEach(record => { added += record.addedNodes.length; }));
    observer.observe(element, { subtree: true, childList: true });
    for (let index = 0; index < 50; index++) {
      element.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 252 + index % 4 * 56, clientY: 252 }));
      peak = Math.max(peak, Number(element.dataset.activeWaves));
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    observer.disconnect();
    return { added, peak, sameCanvas: canvas === element.querySelector('canvas'), animations: element.getAnimations({ subtree: true }).length };
  });
  expect(burst).toEqual({ added: 0, peak: 2, sameCanvas: true, animations: 0 });
  await expect.poll(() => activeWaves(page)).toBe(0);
  expect(await ink(page)).toBe(false);
  await page.mouse.click(252, 252);
  await expect.poll(() => ink(page)).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await activeWaves(page)).toBe(0);
  expect(await ink(page)).toBe(false);
  expect(errors).toEqual([]);
});

test('reduced motion cancels the wave, controls do not trigger it, and navigation removes it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  await page.mouse.click(252, 252);
  expect(await activeWaves(page)).toBe(0);
  await expect(page.locator('.background-ripple-effect__hover')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  await page.mouse.click(252, 252);
  await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => activeWaves(page)).toBe(0);
  expect(await ink(page)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  expect(await activeWaves(page)).toBe(0);
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(ripple(page)).toHaveCount(0);
});

test('the ripple still responds behind every section after scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  for (const selector of ['.dp-section', '.community-section', '.vm-container', '.site-footer']) {
    await page.locator(selector).evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await expect.poll(() => ripple(page).evaluate(element => element.getBoundingClientRect().top)).toBe(0);
    await expect.poll(() => activeWaves(page)).toBe(0);
    await page.mouse.click(24, 250);
    await expect.poll(() => ink(page)).toBe(true);
  }
});

test('4K and Retina displays keep a fixed memory budget and no per-cell DOM', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 3840, height: 2160 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await openHome(page);
    const dimensions = await ripple(page).evaluate(element => {
      const canvas = element.querySelector('canvas');
      return { pixels: canvas.width * canvas.height, children: element.querySelectorAll('*').length };
    });
    expect(dimensions.pixels).toBeLessThanOrEqual(1_500_000);
    expect(dimensions.children).toBe(3);
  } finally { await context.close(); }
});

test.describe('touch screens', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  test('taps work after rotation and the canvas clears after each wave', async ({ page }, info) => {
    await openHome(page);
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 320, height: 568 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => ripple(page).evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(viewport);
      await expect.poll(() => activeWaves(page)).toBe(0);
      await page.touchscreen.tap(100, 250);
      await expect.poll(() => ink(page)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await page.screenshot({ path: info.outputPath(`mobile-wave-${viewport.width}.png`) });
      await expect.poll(() => activeWaves(page)).toBe(0);
      expect(await ink(page)).toBe(false);
    }
  });
});
