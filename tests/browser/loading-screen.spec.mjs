import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function holdInitialRequest(page) {
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  await page.route('**/api/site', async route => {
    await ready;
    // Strict Mode may have already cancelled its first request.
    await route.fulfill({ json: site }).catch(() => {});
  });
  return release;
}

test('a full-screen mint sketch loops, then exits once and restores the page', async ({ page }, info) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const release = await holdInitialRequest(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/recruitment');
  const loader = page.locator('[data-loading-screen]');
  await expect(loader).toBeVisible();
  await expect(loader).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  await expect(loader).toHaveCSS('color', 'rgb(195, 229, 200)');
  await expect(page.getByRole('status')).toHaveText('Connecting the dots…');
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(true);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(loader.locator('.nucleus-loader__doodle')).toHaveCount(4);
  const path = loader.locator('.nucleus-loader__wire path');
  const firstStroke = await path.getAttribute('stroke-dasharray');
  await expect.poll(() => path.getAttribute('stroke-dasharray')).not.toBe(firstStroke);
  await page.waitForTimeout(1900);
  await page.screenshot({ path: info.outputPath('loader-desktop.png') });
  await page.waitForTimeout(3600);
  await expect(loader).toBeVisible();
  const loopStroke = await path.getAttribute('stroke-dasharray');
  await expect.poll(() => path.getAttribute('stroke-dasharray')).not.toBe(loopStroke);
  release();
  await expect(loader).toHaveCount(0);
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  expect(await page.locator('html').evaluate(element => element.style.scrollbarGutter)).toBe('');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(loader).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(loader).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`all four sketches fit a ${viewport.width}x${viewport.height} viewport`, async ({ page }, info) => {
    const release = await holdInitialRequest(page);
    await page.setViewportSize(viewport);
    await page.goto('/recruitment');
    const loader = page.locator('[data-loading-screen]');
    await expect(loader).toBeVisible();
    for (const doodle of await loader.locator('.nucleus-loader__doodle').all()) {
      const box = await doodle.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    // Classic scrollbars reserve a gutter while the scroll lock is active.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await expect.poll(() => loader.locator('.nucleus-loader__doodle path').evaluateAll(paths => paths.every(path =>
      Number(getComputedStyle(path).opacity) > .99 && parseFloat(path.getAttribute('stroke-dasharray')) > .99,
    ))).toBe(true);
    await page.screenshot({ path: info.outputPath('loader-mobile.png') });
    release();
    await expect(loader).toHaveCount(0);
  });
}

test('reduced motion leaves every sketch visible without a draw loop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  const loader = page.locator('[data-loading-screen]');
  await expect(loader).toBeVisible();
  for (const path of await loader.locator('path').all()) {
    await expect(path).toHaveCSS('stroke-dasharray', 'none');
    await expect(path).toHaveCSS('opacity', '1');
  }
  release();
  await expect(loader).toHaveCount(0);
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
});

test('a stalled startup cannot trap the existing public content behind the loader', async ({ page }) => {
  const release = await holdInitialRequest(page);
  await page.goto('/recruitment');
  const loader = page.locator('[data-loading-screen]');
  await expect(loader).toBeVisible();
  await expect(loader).toHaveCount(0, { timeout: 11_000 });
  expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  release();
});
