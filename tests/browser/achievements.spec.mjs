import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
async function openAchievements(page, data = site) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/site', route => route.fulfill({ json: data }));
  await page.goto('/achievements');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
}

for (const width of [1440, 768, 390, 320]) {
  test(`achievement preview fits and is accessible at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await openAchievements(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle('Achievements — Nucleus SJEC');
    await expect(page.locator('.ach-record')).toHaveCount(6);
    await expect(page.getByText('SAMPLE RECORD', { exact: true })).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    for (const portrait of await page.locator('.ach-portrait img').all()) {
      await portrait.scrollIntoViewIfNeeded();
      await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: info.outputPath('achievements.png'), fullPage: true });
    await page.getByRole('button', { name: "View Prajwal Gaonkar's achievements" }).click();
    const dialog = page.getByRole('dialog', { name: 'Prajwal Gaonkar' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('SAMPLE ACHIEVEMENTS')).toBeVisible();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath('achievement-details.png') });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menuLink = page.getByRole('link', { name: 'Achievements', exact: true });
    const menuBounds = await menuLink.boundingBox();
    expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
    expect(errors).toEqual([]);
  });
}

test('categories combine with search, announce counts, and recover from no matches', async ({ page }) => {
  await openAchievements(page);
  await page.getByRole('button', { name: /^Research/ }).click();
  await expect(page.locator('.ach-record')).toHaveCount(2);
  await expect(page.locator('.ach-results-note [aria-live]')).toHaveText('02 of 06 members');
  await page.getByRole('searchbox').fill('mohit');
  await expect(page.locator('.ach-record')).toHaveCount(1);
  await page.getByRole('searchbox').fill('Campus Buildathon');
  await expect(page.locator('.ach-record')).toHaveCount(0);
  await expect(page.getByText('No matching achievements.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.ach-record')).toHaveCount(6);
  await expect(page.getByRole('searchbox')).toBeFocused();
  await page.getByRole('searchbox').fill('  PRAJWAL  ');
  await expect(page.locator('.ach-record')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.locator('.ach-record')).toHaveCount(6);
});

test('keyboard details restore focus, menu route works, and reduced motion stays still', async ({ page }) => {
  await openAchievements(page);
  const trigger = page.getByRole('button', { name: "View Prajwal Gaonkar's achievements" });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const close = page.getByRole('button', { name: 'Close dialog' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('.ach-hero svg')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('link', { name: 'Achievements', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('link', { name: 'Achievements', exact: true }).click();
  await expect(page).toHaveURL(/\/achievements$/);
  await expect(page.locator('.ach-record')).toHaveCount(6);
});

test('empty team and unavailable member images have useful fallbacks', async ({ page }) => {
  await openAchievements(page, { ...site, team: [{ ...site.team[0], image: '/missing-test-portrait.png' }] });
  await expect(page.locator('.ach-record')).toHaveCount(1);
  await expect(page.locator('.ach-portrait img')).toHaveCount(0);
  await expect(page.locator('.ach-portrait')).toHaveText(site.team[0].initials);
  await page.unroute('**/api/site');
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [] } }));
  await page.reload();
  await expect(page.getByText('No achievements yet.')).toBeVisible();
});
