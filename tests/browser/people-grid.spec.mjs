import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
});
async function openTeam(page) {
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.people-page')).toHaveAttribute('data-view', 'grid');
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 820, height: 1180 }, { width: 393, height: 851 }, { width: 320, height: 568 }, { width: 851, height: 393 }]) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, hasTouch: viewport.width < 900, isMobile: viewport.width < 900 });
    test('grid, repeat team navigation, profiles and community controls work', async ({ page }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors = [], requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      await openTeam(page);
      await expect(page.locator('.people-card')).toHaveCount(site.team.length);
      const columns = await page.locator('.people-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(viewport.width > 900 ? 3 : viewport.width > 480 ? 2 : 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await page.screenshot({ path: info.outputPath('people-intro.png') });
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.getByRole('button', { name: 'Meet the Team' }).click();
        await expect(page.getByRole('heading', { name: 'The minds behind it.' })).toBeInViewport();
        await expect(page.locator('#people-roster')).toBeFocused();
      }
      await page.screenshot({ path: info.outputPath('people-grid.png') });
      const card = page.locator('.people-card > button').first();
      await card.click();
      const dialog = page.getByRole('dialog', { name: 'Poorvik Kuthyala' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('President', { exact: true })).toBeVisible();
      await expect.poll(() => dialog.locator('.team-profile__portrait').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await dialog.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await page.screenshot({ path: info.outputPath('profile.png') });
      await dialog.getByRole('button', { name: 'Back to the team' }).focus();
      await page.keyboard.press('Shift+Tab');
      await expect(dialog.getByRole('link', { name: 'LeetCode' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(card).toBeFocused();
      await page.getByRole('button', { name: 'Alumni', exact: true }).click();
      await expect(page.getByText('Alumni profiles are coming soon.')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Alumni', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: 'Members', exact: true }).click();
      await expect(page.locator('.people-card')).toHaveCount(site.team.length);
      expect(requests.filter(url => /people-tower[./-]|PeopleTower|three\.module|cannon/.test(url))).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}

test('alumni cards filter real data and empty teams remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [site.team[0], { ...site.team[1], status: 'alumni' }] } }));
  await openTeam(page);
  await expect(page.locator('.people-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Alumni', exact: true }).click();
  await expect(page.locator('.people-card')).toHaveCount(1);
  await expect(page.locator('.people-card')).toContainText(site.team[1].name);
  await page.locator('.people-card > button').click();
  await expect(page.getByRole('dialog', { name: site.team[1].name })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [] } }));
  await page.reload();
  await expect(page.getByText('The team will be announced here soon.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play Interactive Tower' })).toBeDisabled();
});

test('normal motion finishes entrances, pauses offscreen preview and navigates smoothly', async ({ page }, info) => {
  await openTeam(page);
  await expect(page.locator('.people-tower-button')).toHaveAttribute('data-animating', 'true');
  await page.getByRole('button', { name: 'Meet the Team' }).click();
  await expect(page.getByRole('heading', { name: 'The minds behind it.' })).toBeInViewport();
  await expect(page.locator('.people-card').first()).toHaveCSS('opacity', '1');
  await page.screenshot({ path: info.outputPath('animated-grid.png') });
  await page.locator('.people-card').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.people-card').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.people-tower-button')).toHaveAttribute('data-animating', 'false');
  expect((await new AxeBuilder({ page }).include('.people-page').analyze()).violations).toEqual([]);
});

test('tower loads on demand, releases GPU resources and restores the directory', async ({ page }) => {
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
      if (!renderer?.isWebGLRenderer) return;
      const dispose = renderer.dispose.bind(renderer);
      renderer.dispose = () => { dispose(); window.__disposedTower = { ...renderer.info.memory }; };
    } };
  });
  await openTeam(page);
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await page.getByLabel('Jump to a member').selectOption('14');
  await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Back to the team' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-view', 'grid');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__disposedTower)).toEqual({ geometries: 0, textures: 0 });
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: 'Meet the Team' }).click();
  await expect(page.getByRole('heading', { name: 'The minds behind it.' })).toBeInViewport();
});
