import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.particleDraws = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.parentElement?.id === 'home-particles-canvas') window.particleDraws++;
      return clear.apply(this, args);
    };
  });
});

const ready = async page => {
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.home-particles')).toHaveAttribute('data-ready', 'true');
};
const draws = page => page.evaluate(() => window.particleDraws);
const still = async page => {
  await page.waitForTimeout(220);
  const before = await draws(page);
  await page.waitForTimeout(250);
  expect(await draws(page)).toBe(before);
  return before;
};

test('background is deferred, bounded, pausable, and cleaned up across routes', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'loading');
  expect(await page.evaluate(() => typeof window.particlesJS)).toBe('undefined');
  await ready(page);
  const canvas = page.locator('#home-particles-canvas canvas');
  await expect(canvas).toHaveCount(1);
  await expect(page.locator('.home-particles')).toHaveCSS('pointer-events', 'none');

  for (const viewport of [{ width: 3840, height: 2160 }, { width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => canvas.evaluate(el => Math.abs(el.width / el.height - innerWidth / innerHeight))).toBeLessThan(.005);
    const state = await page.evaluate(() => {
      const { canvas, particles } = window.pJSDom[0].pJS;
      return { pixels: canvas.el.width * canvas.el.height, count: particles.array.length, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(state.pixels).toBeGreaterThan(0);
    expect(state.pixels).toBeLessThanOrEqual(1_000_000);
    expect(state.count).toBeLessThanOrEqual(viewport.width <= 760 ? 28 : 64);
    expect(state.overflow).toBe(false);
  }

  await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: testInfo.outputPath('desktop-hero.png') });
  await page.locator('.dp-header').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
  await page.waitForTimeout(700);
  await page.screenshot({ path: testInfo.outputPath('desktop-domains.png') });
  await page.evaluate(() => {
    const engine = window.pJSDom[0].pJS;
    const original = engine.fn.particlesDraw;
    window.particleCosts = [];
    engine.fn.particlesDraw = () => {
      const start = performance.now();
      original();
      window.particleCosts.push(performance.now() - start);
    };
  });
  const sample = await page.evaluate(async () => {
    const before = window.particleDraws, start = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1600));
    const costs = window.particleCosts.sort((a, b) => a - b);
    return { fps: (window.particleDraws - before) * 1000 / (performance.now() - start), p95Ms: costs[Math.floor(costs.length * .95)], maxMs: costs.at(-1) };
  });
  console.log('Desktop particles:', sample);
  expect(sample.fps).toBeGreaterThan(0);
  expect(sample.fps).toBeLessThanOrEqual(31);

  await page.getByRole('button', { name: 'Pause background animation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume background animation', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const stopped = await still(page);
  await page.getByRole('button', { name: 'Resume background animation', exact: true }).click();
  await expect.poll(() => draws(page)).toBeGreaterThan(stopped);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await still(page);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => draws(page)).toBeGreaterThan(hidden);

  for (let visit = 0; visit < 2; visit++) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await still(page);
    await page.getByRole('link', { name: 'Our work', exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(canvas).toHaveCount(0);
    expect(await page.evaluate(() => window.pJSDom.length)).toBe(0);
    await still(page);
    await page.getByRole('link', { name: 'Nucleus home', exact: true }).click();
    await ready(page);
    await expect(canvas).toHaveCount(1);
    expect(await page.evaluate(() => window.pJSDom.length)).toBe(1);
  }
  expect(errors).toEqual([]);
});

test('mobile retina stays light and reduced motion swaps to a static field', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/');
  await ready(page);
  const canvas = page.locator('#home-particles-canvas canvas');
  const state = await page.evaluate(() => {
    const { canvas, particles } = window.pJSDom[0].pJS;
    return { width: canvas.el.width, height: canvas.el.height, count: particles.array.length };
  });
  expect(state.width).toBe(390);
  expect(state.height).toBe(844);
  expect(state.count).toBeLessThanOrEqual(28);
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: testInfo.outputPath('mobile-hero.png') });
  await page.locator('.community-section').evaluate(el => window.scrollTo({ top: el.offsetTop + 80, behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: testInfo.outputPath('mobile-community.png') });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  for (let change = 0; change < 2; change++) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(canvas).toHaveCount(0);
    expect(await page.evaluate(() => window.pJSDom.length)).toBe(0);
    await expect(page.locator('.home-particles')).toHaveAttribute('data-ready', 'false');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page);
    await expect(canvas).toHaveCount(1);
    expect(await page.evaluate(() => window.pJSDom.length)).toBe(1);
  }
  expect(errors).toEqual([]);
  await context.close();
});

test('reduced motion and data saving need no particle library', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.home-particles')).toHaveAttribute('data-ready', 'false');
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => typeof window.particlesJS)).toBe('undefined');
  await expect(page.locator('#home-particles-canvas canvas')).toHaveCount(0);
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(page.locator('.home-particles')).toHaveAttribute('data-ready', 'false');
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => typeof window.particlesJS)).toBe('undefined');
});

test('an unavailable library leaves the homepage usable', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/node_modules/particles.js/particles.js', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.home-particles')).toHaveAttribute('data-ready', 'false');
  await page.waitForTimeout(2000);
  await expect(page.locator('#home-particles-canvas canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  expect(errors).toEqual([]);
});
