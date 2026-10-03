import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const ripple = page => page.locator('.background-ripple-effect');
const activeWaves = page => ripple(page).evaluate(element => element.getAnimations({ subtree: true })
  .filter(animation => animation.animationName === 'ripple-cell-ripple').length);

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
});

test('mint waves respond through the foreground logo and replay on repeated clicks', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15_000 });
  await expect(page.locator('.logo-landing__text')).toHaveCSS('opacity', '1');
  await expect(page.locator('.mu-morph-wrap')).toHaveCSS('opacity', '1');
  await expect(ripple(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(ripple(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(ripple(page)).toHaveCSS('position', 'fixed');
  await expect(page.locator('#main-content')).toHaveCSS('z-index', '10');
  await expect(page.locator('.logo-landing__scene')).toHaveCSS('z-index', '10');
  await expect(page.locator('.logo-landing__text')).toHaveCSS('z-index', '10');
  expect(await activeWaves(page)).toBe(0);
  const cell = page.locator('.background-ripple-effect__cell').first();
  await expect(cell).toHaveCSS('background-color', 'rgba(195, 229, 200, 0.07)');
  await expect(cell).toHaveCSS('border-top-color', 'rgba(195, 229, 200, 0.1)');
  await page.screenshot({ path: info.outputPath('desktop-grid.png') });

  // The canvas remains the pointer target while the underlying grid responds.
  expect(await page.evaluate(() => document.elementFromPoint(252, 252).tagName)).toBe('CANVAS');
  await page.mouse.move(252, 252);
  await expect(page.locator('.background-ripple-effect__cell[data-hovered]')).toHaveCSS('background-color', 'rgba(195, 229, 200, 0.18)');
  await page.mouse.click(252, 252);
  await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
  const delays = await page.locator('.background-ripple-effect__cell').evaluateAll(elements =>
    elements.map(element => parseFloat(getComputedStyle(element).animationDelay)));
  expect(Math.min(...delays)).toBe(0);
  expect(Math.max(...delays)).toBeGreaterThan(0.5);
  await page.mouse.move(20, 100);
  await page.screenshot({ path: info.outputPath('desktop-wave.png') });

  await page.evaluate(() => { window.previousRippleGrid = document.querySelector('.background-ripple-effect__grid'); });
  await page.mouse.click(252, 252);
  await expect.poll(() => page.evaluate(() => window.previousRippleGrid !== document.querySelector('.background-ripple-effect__grid'))).toBe(true);
  await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
  await expect.poll(() => activeWaves(page), { timeout: 10_000 }).toBe(0);
  expect(errors).toEqual([]);
});

test('reduced motion disables waves immediately and navigation removes the home effect', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.mouse.click(252, 252);
  expect(await activeWaves(page)).toBe(0);
  await expect(page.locator('.background-ripple-effect__cell').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.background-ripple-effect__cell[data-hovered]')).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  await page.mouse.click(252, 252);
  await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => activeWaves(page)).toBe(0);
  await page.mouse.click(252, 252);
  expect(await activeWaves(page)).toBe(0);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  expect(await activeWaves(page)).toBe(0);
  await page.mouse.click(252, 252);
  await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(ripple(page)).toHaveCount(0);
});

test('the ripple stays behind every home section and responds after scrolling to the footer', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  const cells = await page.locator('.background-ripple-effect__cell').count();
  for (const [name, selector] of [
    ['domains', '.dp-section'],
    ['community', '.community-section'],
    ['voices', '.vm-container'],
    ['footer', '.site-footer'],
  ]) {
    const section = page.locator(selector);
    await section.evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(800);
    await expect(section).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect.poll(() => ripple(page).evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return { top: bounds.top, height: bounds.height };
    })).toEqual({ top: 0, height: 900 });
    expect(await page.locator('.background-ripple-effect__cell').count()).toBe(cells);

    const y = await section.evaluate(element => Math.min(innerHeight - 32, Math.max(120, element.getBoundingClientRect().top + 180)));
    await page.mouse.click(24, y);
    await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
    await page.screenshot({ path: info.outputPath(`${name}-ripple.png`) });
    await ripple(page).evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
  }
  await expect(page.locator('.site-footer')).toHaveCSS('z-index', '10');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  expect(await activeWaves(page)).toBe(0);
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(ripple(page)).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveClass(/site-shell--home/);
});

test.describe('touch screens', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('grid fills the viewport after rotation and supports taps throughout the home page', async ({ page }, info) => {
    await page.goto('/');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15_000 });
    await expect(page.locator('.logo-landing__text')).toHaveCSS('opacity', '1');
    await expect(page.locator('.mu-morph-wrap')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: info.outputPath('mobile-grid.png') });
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(() => page.evaluate(() => {
        const grid = document.querySelector('.background-ripple-effect__grid').getBoundingClientRect();
        return grid.width >= innerWidth && grid.height >= innerHeight;
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      expect(await page.locator('.background-ripple-effect__cell').count()).toBeLessThan(800);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.touchscreen.tap(100, 250);
    await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
    await page.locator('.community-section').evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
    await expect.poll(() => ripple(page).evaluate(element => element.getBoundingClientRect().top)).toBe(0);
    await ripple(page).evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
    await page.touchscreen.tap(24, 250);
    await expect.poll(() => activeWaves(page)).toBeGreaterThan(0);
    await page.screenshot({ path: info.outputPath('mobile-community-ripple.png') });
    await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
    await page.getByRole('link', { name: 'Our work', exact: true }).tap();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(ripple(page)).toHaveCount(0);
  });
});
