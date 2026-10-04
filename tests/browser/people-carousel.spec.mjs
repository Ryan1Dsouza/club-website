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
  await expect(page.locator('.fan-layout')).toHaveAttribute('data-ready', 'true');
}

test('default view fetches only visible small portraits and never starts the tower', async ({ page }) => {
  const requests = [], errors = [];
  page.on('request', request => requests.push(new URL(request.url()).pathname));
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openTeam(page);
  await expect(page.locator('.fan-card')).toHaveCount(7);
  await expect(page.locator('canvas')).toHaveCount(0);
  const photos = [...new Set(requests.filter(path => path.includes('/team_images/')))];
  expect(photos).toHaveLength(7);
  expect(photos.every(path => path.endsWith('-480.webp'))).toBe(true);
  expect(requests.filter(path => /people-tower|PeopleTower|three|cannon/.test(path))).toEqual([]);
  await page.getByLabel('Find a team member').selectOption('8');
  await expect(page.locator('.fan-carousel')).toHaveAttribute('data-active-index', '8');
  await expect(page.locator('.fan-card')).toHaveCount(7);
  const accessibility = await new AxeBuilder({ page }).include('.people-page').analyze();
  expect(accessibility.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('autoplay continues through hover and focus and resumes after reading a profile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openTeam(page);
  const carousel = page.locator('.fan-carousel');
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  const initial = await carousel.getAttribute('data-active-index');
  await expect(carousel).not.toHaveAttribute('data-active-index', initial, { timeout: 5000 });
  const movingCard = page.locator(`.fan-card[data-index="${await carousel.getAttribute('data-active-index')}"]`);
  const movingTransform = await movingCard.evaluate(card => card.style.transform);
  await page.waitForTimeout(150);
  expect(await movingCard.evaluate(card => card.style.transform)).not.toBe(movingTransform);
  await page.locator('.fan-card[data-active="true"]').hover({ force: true });
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  const hovered = await carousel.getAttribute('data-active-index');
  await expect(carousel).not.toHaveAttribute('data-active-index', hovered, { timeout: 5000 });
  await expect(page.getByRole('button', { name: /(?:Pause|Start) automatic rotation/ })).toHaveCount(0);
  await page.getByLabel('Find a team member').focus();
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  await page.locator('.fan-card[data-active="true"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(carousel).toHaveAttribute('data-autoplay', 'paused');
  const selected = await carousel.getAttribute('data-active-index');
  await page.waitForTimeout(200);
  await expect(carousel).toHaveAttribute('data-active-index', selected);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('heading', { level: 1 }).click();
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  await expect(carousel).not.toHaveAttribute('data-active-index', selected, { timeout: 5000 });
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 393, height: 851 }, { width: 320, height: 568 }, { width: 851, height: 393 }]) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, isMobile: viewport.width < 900, hasTouch: viewport.width < 900 });
    test('fan and fullscreen profile fit, contain focus, and restore the card', async ({ page }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const requests = [], errors = [];
      page.on('request', request => requests.push(request.url()));
      page.on('pageerror', error => errors.push(error.message));
      await openTeam(page);
      await page.getByLabel('Find a team member').focus();
      await page.getByLabel('Find a team member').selectOption('0');
      await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
      await page.screenshot({ path: info.outputPath('carousel.png'), fullPage: true });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      const carouselBox = await page.locator('.fan-carousel').boundingBox();
      const towerButtonBox = await page.getByRole('button', { name: 'Play Interactive Tower' }).boundingBox();
      expect(towerButtonBox.y).toBeGreaterThan(carouselBox.y + carouselBox.height);
      expect(towerButtonBox.width).toBeGreaterThan(Math.min(900, viewport.width * .8));
      const cardSize = await page.locator('.fan-card[data-active="true"]').evaluate(card => ({ width: card.offsetWidth, height: card.offsetHeight }));
      expect(cardSize.width).toBeGreaterThanOrEqual(viewport.width === 1440 ? 330 : 200);
      expect(cardSize.height).toBeGreaterThanOrEqual(viewport.width === 1440 ? 432 : 246);
      const trigger = page.locator('.fan-card[data-index="0"]');
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Poorvik Kuthyala' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCSS('opacity', '1');
      await expect(dialog.getByText('turning coffee into algorithms')).toBeVisible();
      await expect(dialog.getByText('President', { exact: true })).toBeVisible();
      await expect(dialog.locator('.team-profile__portrait')).toHaveAttribute('src', /-800\.webp$/);
      await expect.poll(() => dialog.locator('.team-profile__portrait').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      const rect = await dialog.boundingBox();
      expect(rect).toEqual({ x: 0, y: 0, ...viewport });
      expect(await dialog.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await page.screenshot({ path: info.outputPath('profile.png') });
      const close = dialog.getByRole('button', { name: 'Back to the constellation' });
      await close.focus();
      await page.keyboard.press('Shift+Tab');
      await expect(dialog.getByRole('link', { name: 'LeetCode' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      const before = page.url();
      await dialog.getByRole('link', { name: 'LinkedIn' }).click();
      expect(page.url()).toBe(before);
      const accessibility = await new AxeBuilder({ page }).include('.team-profile').analyze();
      expect(accessibility.violations).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
      expect(requests.filter(url => /people-tower|PeopleTower|three|cannon/.test(url))).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}

test('direct navigation, rapid cycling, resize and reduced motion keep a bounded usable fan', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openTeam(page);
  await page.getByLabel('Find a team member').focus();
  await page.getByLabel('Find a team member').selectOption('14');
  await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  await page.getByLabel('Next team member', { exact: true }).click();
  await expect(page.locator('.fan-carousel')).toHaveAttribute('data-active-index', '0');
  await page.getByLabel('Next team member', { exact: true }).evaluate(button => { for (let i = 0; i < 30; i++) button.click(); });
  expect(await page.locator('.fan-card').count()).toBeLessThanOrEqual(8);
  await page.setViewportSize({ width: 393, height: 700 });
  await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  await expect(page.locator('.fan-card')).toHaveCount(7);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.fan-carousel')).toHaveAttribute('data-autoplay', 'paused');
  await page.getByLabel('Find a team member').selectOption('6');
  await expect(page.locator('.fan-card')).toHaveCount(7);
  await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  await page.locator('.fan-card[data-active="true"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.fan-carousel')).toHaveAttribute('data-active-index', '5');
});

test('empty and singleton teams remain useful and real profile props replace placeholders', async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [] } }));
  await page.goto('/team');
  await expect(page.locator('.fan-empty')).toHaveText('The team will be announced here soon.');
  await expect(page.getByRole('button', { name: 'Play Interactive Tower' })).toBeDisabled();
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [{ ...site.team[0], tagline: 'Building useful things.', socials: { github: 'https://github.com/example' } }] } }));
  await page.reload();
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.fan-card')).toHaveCount(1);
  await expect(page.getByLabel('Next team member', { exact: true })).toBeDisabled();
  await page.locator('.fan-card').click();
  await expect(page.getByText('Building useful things.')).toBeVisible();
  await expect(page.locator('.team-profile__socials a')).toHaveCount(1);
  await expect(page.locator('.team-profile__socials a')).toHaveAttribute('href', 'https://github.com/example');
});

test('tower loads only on demand and releases GPU resources on return to quick view', async ({ page }) => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
      if (!renderer?.isWebGLRenderer) return;
      const dispose = renderer.dispose.bind(renderer);
      renderer.dispose = () => { dispose(); window.__disposedTower = { ...renderer.info.memory }; };
    } };
  });
  await openTeam(page);
  expect(requests.some(url => /people-tower|PeopleTower|three|cannon/.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await expect(page.locator('.people-tower canvas')).toHaveCount(1);
  await expect(page.locator('.fan-carousel')).toHaveCount(0);
  expect(requests.some(url => url.includes('people-tower.ts'))).toBe(true);
  await page.getByLabel('Jump to a member').selectOption('14');
  await expect(page.getByRole('button', { name: 'Back to Quick view' })).toBeInViewport();
  await page.getByRole('button', { name: 'Back to Quick view' }).click();
  await expect(page.locator('.fan-carousel')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__disposedTower)).toEqual({ geometries: 0, textures: 0 });
  expect(await page.evaluate(() => scrollY)).toBe(0);
});
