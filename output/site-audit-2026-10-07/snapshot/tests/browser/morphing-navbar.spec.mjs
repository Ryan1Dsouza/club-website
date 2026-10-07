import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const destinations = [['Home', '/'], ['Events', '/events'], ['Live News', '/news'], ['Our work', '/projects'], ['Achievements', '/achievements'], ['The people', '/team']];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
});
const menu = page => page.getByRole('navigation', { name: 'Main navigation' });
const toggle = page => page.locator('.morph-nav__toggle');
async function settledOpen(page) {
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.morph-nav__links li').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.morph-nav__socials li').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.morph-nav__overlay')).toHaveCSS('transform', 'none');
  await expect(page.locator('.morph-nav__band').last()).toHaveCSS('transform', 'none');
}
async function recordMenuFrames(page) {
  await page.evaluate(() => {
    window.menuFrames = [];
    const sample = () => {
      window.menuFrames.push({
        time: performance.now(),
        path: location.pathname,
        overlay: document.querySelector('.morph-nav__overlay').getBoundingClientRect().x,
        bands: [...document.querySelectorAll('.morph-nav__band')].map(el => el.getBoundingClientRect().x),
        text: [...document.querySelectorAll('.morph-nav__links li')].map(el => Number(getComputedStyle(el).opacity)),
      });
      window.menuFrameId = requestAnimationFrame(sample);
    };
    sample();
  });
}
async function recordedMenuFrames(page) {
  return page.evaluate(() => {
    cancelAnimationFrame(window.menuFrameId);
    return window.menuFrames;
  });
}

test('reference layout keeps a centered pill and reveals a full-screen menu in five bands', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15000 });
  const pill = page.locator('.morph-nav__pill');
  const closed = await pill.boundingBox();
  expect(Math.abs(closed.x + closed.width / 2 - 720)).toBeLessThan(1);
  expect(closed.y).toBe(12);
  expect(closed.height).toBe(54);
  await page.screenshot({ path: info.outputPath('desktop-closed.png') });
  await page.evaluate(() => {
    window.navFrames = [];
    const begin = performance.now();
    const sample = () => {
      window.navFrames.push({
        bands: [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x),
        text: Number(getComputedStyle(document.querySelector('.morph-nav__links li')).opacity),
      });
      if (performance.now() - begin < 2400) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await toggle(page).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: info.outputPath('desktop-opening.png') });
  await settledOpen(page);
  await expect(page.locator('.morph-nav__footer > div').last()).toHaveCSS('opacity', '1');
  expect(await pill.boundingBox()).toEqual(closed);
  const frames = await page.evaluate(() => window.navFrames);
  expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 && frame.bands[4] > frame.bands[0] + 100 && frame.text < .1)).toBe(true);
  const overlay = await page.locator('.morph-nav__overlay').boundingBox();
  expect(overlay).toEqual({ x: 0, y: 0, width: 1440, height: 900 });
  await expect(page.locator('.morph-nav__links .morph-nav__link')).toHaveCount(destinations.length);
  expect(await page.locator('.morph-nav__links').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(96);
  await expect(menu(page).getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.screenshot({ path: info.outputPath('desktop-open.png') });
  await menu(page).getByRole('link', { name: 'Our work', exact: true }).hover();
  await page.waitForTimeout(120);
  await page.screenshot({ path: info.outputPath('desktop-hover.png') });
  await toggle(page).click();
  await expect(page.locator('.morph-nav__overlay')).toHaveAttribute('inert');
  await expect.poll(async () => Math.round((await page.locator('.morph-nav__overlay').boundingBox()).x)).toBe(1440);
  expect(errors).toEqual([]);
});

test('reopening replays the stagger after a full close and smoothly restores interrupted closes', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15000 });

  for (const closeDelay of [null, 2000, 75, 850]) {
    if (closeDelay !== null) {
      await toggle(page).dispatchEvent('click');
      await page.waitForTimeout(closeDelay);
    }
    const beforeOpen = await page.evaluate(() => {
      const before = [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x);
      window.reopenFrames = [];
      const sample = () => {
        const bands = [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x);
        window.reopenFrames.push({
          bands,
          lastBandOffset: bands[4] - document.querySelector('.morph-nav__overlay').getBoundingClientRect().x,
          text: Number(getComputedStyle(document.querySelector('.morph-nav__links li')).opacity),
        });
        window.reopenFrameId = requestAnimationFrame(sample);
      };
      window.reopenFrameId = requestAnimationFrame(sample);
      // Sample and reopen together so automation latency cannot advance the closing pose.
      document.querySelector('.morph-nav__toggle').click();
      return before;
    });
    await settledOpen(page);
    const frames = await page.evaluate(() => {
      cancelAnimationFrame(window.reopenFrameId);
      return window.reopenFrames;
    });
    await testInfo.attach(`sweep-after-${closeDelay ?? 'initial'}-close`, { body: JSON.stringify(frames), contentType: 'application/json' });
    if (closeDelay === null || closeDelay === 2000) {
      expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 &&
        frame.bands[4] > frame.bands[0] + 100 && frame.lastBandOffset > 1439 && frame.text < .1),
      'Expected a visible band stagger when opening from fully closed').toBe(true);
    } else {
      expect(frames.length).toBeGreaterThan(0);
      for (let band = 0; band < 5; band++) {
        expect(Math.max(...frames.map(frame => frame.bands[band])),
          'Interrupted bands should return from their current position without jumping offscreen').toBeLessThan(beforeOpen[band] + 150);
      }
    }
  }
});

test('keyboard focus stays in the full-screen menu and Escape restores the page', async ({ page }) => {
  await page.goto('/recruitment');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await toggle(page).focus();
  await page.keyboard.press('Enter');
  await settledOpen(page);
  await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('inert');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  for (const [title] of destinations) {
    await page.keyboard.press('Tab');
    await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  }
  for (const title of ['Instagram', 'LinkedIn', 'GitHub', 'Email']) {
    await page.keyboard.press('Tab');
    await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(page.locator('.morph-nav__join')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.morph-nav__brand')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.morph-nav__join')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle(page)).toBeFocused();
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(menu(page).getByRole('link', { name: 'Home', exact: true })).toHaveCount(0);
});

test('routes, social destinations, reduced motion, and the community action remain functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/recruitment');
  for (const [title, path] of destinations) {
    await toggle(page).click();
    await menu(page).getByRole('link', { name: title, exact: true }).click();
    await expect(page).toHaveURL(url => url.pathname === path);
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('main')).not.toHaveAttribute('inert');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await toggle(page).click();
    await expect(menu(page).getByRole('link', { name: title, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.morph-nav__overlay')).toHaveCSS('transform', 'none');
    await expect(page.locator('.morph-nav__letter').first()).toHaveCSS('animation-name', 'none');
    await toggle(page).click();
  }
  await toggle(page).click();
  await expect(menu(page).getByRole('link', { name: 'Instagram', exact: true })).toHaveAttribute('href', site.settings.instagramUrl);
  await expect(menu(page).getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', site.settings.linkedinUrl);
  await expect(menu(page).getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', site.settings.githubUrl);
  await page.locator('.morph-nav__join').click();
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('dialog.modal')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(toggle(page)).toBeFocused();
  await toggle(page).click();
  await page.goBack();
  await expect(page).toHaveURL(/\/achievements$/);
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`closing reverses the band and text stagger at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await page.goto('/recruitment');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await toggle(page).click();
    await settledOpen(page);
    // Use actual frames: native opacity animations do not share Playwright's virtual clock.
    await recordMenuFrames(page);
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await page.waitForTimeout(800);
    await page.screenshot({ path: info.outputPath('reverse-menu-close.png') });
    await expect.poll(async () => Math.round((await page.locator('.morph-nav__overlay').boundingBox()).x)).toBe(viewport.width);
    const frames = await recordedMenuFrames(page);
    await info.attach('reverse-close-frames', { body: JSON.stringify(frames), contentType: 'application/json' });
    expect(frames.some(pose => pose.bands[4] - pose.bands[0] > viewport.width * .05 &&
      pose.bands[0] < viewport.width * .5 &&
      pose.bands.every((x, index, all) => index === 0 || x >= all[index - 1]))).toBe(true);
    expect(frames.some(pose => pose.text[0] > pose.text[3] + .2 && pose.text[3] < .8)).toBe(true);
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(toggle(page)).toBeFocused();
  });
}

test('all navigation links change pages as soon as the reverse slide clears', async ({ page }, info) => {
  await page.goto('/recruitment');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });

  for (const [title, path] of destinations) {
    const previous = new URL(page.url()).pathname;
    await toggle(page).click();
    await settledOpen(page);
    await recordMenuFrames(page);
    await menu(page).getByRole('link', { name: title, exact: true }).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page)).toBeFocused();
    await expect(page.locator('main')).not.toHaveAttribute('inert');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page).toHaveURL(url => url.pathname === previous);
    await expect(page).toHaveURL(url => url.pathname === path);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    const frames = await recordedMenuFrames(page);
    const width = page.viewportSize().width;
    const cleared = frames.find(frame => frame.bands.every(x => x >= width - 1));
    const arrived = frames.find(frame => frame.path === path);
    expect(frames.some(frame => frame.bands[4] > frame.bands[0] + width * .05 && frame.overlay < width * .5)).toBe(true);
    expect(frames.filter(frame => frame.bands.some(x => x < width - 1)).every(frame => frame.path === previous)).toBe(true);
    expect(cleared).toBeDefined();
    expect(arrived).toBeDefined();
    expect(frames.indexOf(arrived) - frames.indexOf(cleared),
      'Navigation should start as soon as the visible bands clear, without waiting for the empty wrapper').toBeLessThanOrEqual(1);
    await info.attach(`navigation-timing-${title}`, { body: JSON.stringify({ gapAfterVisibleExitMs: arrived.time - cleared.time, frames }), contentType: 'application/json' });
    await expect.poll(async () => Math.round((await page.locator('.morph-nav__overlay').boundingBox()).x)).toBe(width);
  }
});

test.describe('touch navigation', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('touch navigation opens the people directory when the bands clear', async ({ page }) => {
    await page.goto('/recruitment');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await toggle(page).tap();
    await settledOpen(page);
    await recordMenuFrames(page);
    await menu(page).getByRole('link', { name: 'The people', exact: true }).tap();
    await expect(page).toHaveURL(/\/recruitment$/);
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/\/team$/);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    const frames = await recordedMenuFrames(page);
    const cleared = frames.findIndex(frame => frame.bands.every(x => x >= 389));
    const arrived = frames.findIndex(frame => frame.path === '/team');
    expect(cleared).toBeGreaterThanOrEqual(0);
    expect(arrived).toBeGreaterThanOrEqual(cleared);
    expect(arrived - cleared).toBeLessThanOrEqual(1);
    await expect(page.locator('.people-page')).toHaveAttribute('data-view', 'grid');
    await expect(page.getByRole('heading', { name: 'The people behind Nucleus' })).toHaveCount(1);
  });
});

test('reopening cancels pending navigation and a second destination uses the current exit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/recruitment');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  await toggle(page).click();
  await settledOpen(page);

  await menu(page).getByRole('link', { name: 'Our work', exact: true }).click();
  await page.waitForTimeout(650);
  await expect(page).toHaveURL(/\/recruitment$/);
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  await toggle(page).click();
  await settledOpen(page);
  await expect(page).toHaveURL(/\/recruitment$/);
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  await menu(page).getByRole('link', { name: 'The people', exact: true }).click();
  await page.waitForTimeout(600);
  // The brand remains available during the exit and replaces the queued destination.
  await page.locator('.morph-nav__brand').click();
  await expect(page).toHaveURL(/\/recruitment$/);
  await expect(page).toHaveURL(url => url.pathname === '/');
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
});

test('reduced motion navigates and closes without waiting for a timer or frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/recruitment');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  await toggle(page).click();
  await settledOpen(page);
  await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
  await menu(page).getByRole('link', { name: 'Our work', exact: true }).dispatchEvent('click');
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/\/projects$/);
  await expect(toggle(page)).toBeFocused();
});

test('the brand link navigates immediately when the menu is already closed', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  await page.goto('/recruitment');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  await page.clock.pauseAt(new Date('2026-10-02T12:01:00Z'));
  await page.locator('.morph-nav__brand').dispatchEvent('click');
  await expect(page).toHaveURL(url => url.pathname === '/');
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
});

test('mobile and landscape menus fit long labels and keep every action reachable', async ({ browser }, info) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/events');
  for (const viewport of [{ width: 390, height: 844 }, { width: 280, height: 653 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await toggle(page).tap();
    await settledOpen(page);
    const pill = await page.locator('.morph-nav__pill').boundingBox();
    expect(Math.abs(pill.x + pill.width / 2 - viewport.width / 2)).toBeLessThan(1);
    for (const title of await page.locator('.morph-nav__title').all()) {
      const box = await title.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      await expect(title).toBeInViewport();
    }
    await page.locator('.morph-nav__join').scrollIntoViewIfNeeded();
    await expect(page.locator('.morph-nav__join')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({ path: info.outputPath('mobile-' + viewport.width + '-open.png') });
    await toggle(page).tap();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  }
  await context.close();
});

test('opening from a scrolled page locks the background and rapid toggles recover cleanly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await page.mouse.move(20, 450);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);
  await toggle(page).click();
  await settledOpen(page);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  const position = await page.evaluate(() => scrollY);
  await page.mouse.move(600, 450);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => scrollY)).toBe(position);
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  expect(await page.evaluate(() => scrollY)).toBe(position);
  for (let index = 0; index < 6; index++) {
    await toggle(page).dispatchEvent('click');
    await page.waitForTimeout(50);
  }
  await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.morph-nav__overlay')).toHaveAttribute('inert');
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  await toggle(page).click();
  await settledOpen(page);
  await expect(menu(page).getByRole('link', { name: 'Our work', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
});
