import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test('narrow mouse layouts scroll the tower and keep working across breakpoints', async ({ page }, info) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.setViewportSize({ width: 700, height: 650 });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  for (const viewport of [{ width: 700, height: 650 }, { width: 1100, height: 700 }, { width: 320, height: 568 }, { width: 800, height: 360 }]) {
    await page.setViewportSize(viewport);
    await page.getByRole('button', { name: 'Rebuild tower' }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await page.mouse.wheel(0, 420);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeGreaterThan(0);
    await page.getByLabel('Jump to a member').selectOption('3');
    await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
    await expect(page.getByRole('button', { name: 'Back to the team' })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({ path: info.outputPath(`tower-${viewport.width}.png`) });
  }
  await page.getByRole('button', { name: 'Back to the team' }).click();
  await page.getByRole('button', { name: 'Meet the Team' }).click();
  await expect(page.getByRole('heading', { name: 'The minds behind it.' })).toBeInViewport();
});
