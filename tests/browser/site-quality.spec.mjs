import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { pageMeta } from '../../shared/page-meta.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const paths = ['/', '/team', '/about', '/projects', '/events', '/recruitment'];

for (const device of [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
]) {
  test.describe(device.name, () => {
    test.use({ ...device, reducedMotion: 'reduce' });
    test('public pages have accessible content, route metadata, and no horizontal overflow', async ({ page }) => {
      test.setTimeout(120_000);
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/site', route => route.fulfill({ json: site }));
      for (const path of paths) {
        await page.goto(path);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
        await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
        const meta = pageMeta(path);
        await expect(page).toHaveTitle(meta.title);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', meta.canonical);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', meta.description);
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', meta.canonical);
        await expect(page.locator('h1')).toHaveCount(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(device.viewport.width);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), path).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  });
}

test('client navigation updates canonical and social metadata, including unknown routes', async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('link', { name: 'The people', exact: true }).click();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', pageMeta('/team').canonical);
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', pageMeta('/team').description);
  await page.goto('/unknown');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
});

test('moving voices have a keyboard pause control', async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  const button = page.getByRole('button', { name: 'Pause moving voices' });
  await button.scrollIntoViewIfNeeded();
  await button.focus();
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  for (const row of await page.locator('.vm-marquee-content').all()) await expect(row).toHaveCSS('animation-play-state', 'paused');
});
