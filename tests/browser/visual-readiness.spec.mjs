import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const screen = page => page.locator('[data-loading-screen]');
const settled = page => expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.route('**/rest/v1/events?*', route => route.fulfill({ json: [] }));
  await page.route('**/rest/v1/team_members?*', route => route.fulfill({ json: site.team.map(member => ({ ...member, photo_url: member.image })) }));
  await page.route('**/rest/v1/site_settings?*', route => route.fulfill({ json: { recruitment_open: false } }));
});

async function watchEntries(page) {
  await page.evaluate(() => {
    window.loaderEntries = 0;
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node instanceof Element && (node.matches('[data-loading-screen]') || node.querySelector('[data-loading-screen]'))) window.loaderEntries++;
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
}
async function navigate(page, name) {
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name, exact: true }).click();
}
async function holdPhotos(page) {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/workshop_images/**', async route => { await held; await route.continue().catch(() => {}); });
  return release;
}

for (const mobile of [false, true]) {
  test.describe(mobile ? 'phone entry' : 'desktop entry', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
    test('entering Events shows one curtain for the initial covers, with no replay for later photos', async ({ page }) => {
      const release = await holdPhotos(page);
      try {
        await page.goto('/recruitment', { waitUntil: 'domcontentloaded' }); await settled(page);
        await watchEntries(page);
        await navigate(page, 'Events');
        await expect(page).toHaveURL(/events$/);
        await expect(screen(page)).toBeVisible();
        await expect(page.locator('.site-shell')).toHaveAttribute('inert');
        await page.waitForTimeout(400);
        expect(await page.evaluate(() => window.loaderEntries)).toBe(1);
        release(); await settled(page); await expect(screen(page)).toHaveCount(0);
        expect(await page.locator('.event-card__photo').first().evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        // An individual image entering the viewport later cannot restart the entry loader.
        await page.route('**/*entry-check=late', route => route.abort());
        await page.locator('.event-card__photo').last().evaluate(image => {
          image.removeAttribute('srcset'); image.src = '/brain-mark.svg?entry-check=late';
          image.scrollIntoView({ block: 'center' });
        });
        await page.waitForTimeout(500);
        await expect(screen(page)).toHaveCount(0);
        await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
        expect(await page.evaluate(() => window.loaderEntries)).toBe(1);
      } finally { release(); }
    });
  });
}

test('a direct Events visit keeps the same startup curtain until visible covers settle', async ({ page }) => {
  const release = await holdPhotos(page);
  try {
    await page.goto('/events', { waitUntil: 'domcontentloaded' });
    await expect(screen(page)).toBeVisible();
    await screen(page).evaluate(element => { element.dataset.initialCurtain = 'true'; });
    await page.waitForTimeout(2400);
    await expect(screen(page)).toHaveAttribute('data-initial-curtain', 'true');
    release(); await settled(page); await expect(screen(page)).toHaveCount(0);
  } finally { release(); }
});

test('slow and failed book photos never replay the full-screen loader or block the book controls', async ({ page }) => {
  await page.goto('/events', { waitUntil: 'domcontentloaded' }); await settled(page);
  await watchEntries(page);
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  await expect(page.locator('.nx-book-dialog')).toBeVisible();
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/*readiness=held', async route => { await held; await route.abort().catch(() => {}); });
  try {
    await page.locator('.nx-book-dialog').evaluate(dialog => {
      const image = document.createElement('img'); image.src = '/brain-mark.svg?readiness=held';
      image.style.cssText = 'position:fixed;top:100px;left:100px;width:200px;height:200px;pointer-events:none';
      dialog.append(image);
    });
    await page.waitForTimeout(500);
    await expect(screen(page)).toHaveCount(0);
    await page.getByRole('button', { name: 'Next book page', exact: true }).click();
    await expect(page.locator('.station-book')).toHaveAttribute('data-book-progress', '1.000');
    release();
    await page.getByRole('button', { name: 'Close event', exact: true }).click();
    await expect(page.locator('.nx-book-dialog')).toHaveCount(0);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.loaderEntries)).toBe(0);
  } finally { release(); }
});

test('broken event covers finish the single entry check and leave navigation usable', async ({ page }) => {
  await page.route('**/workshop_images/**', route => route.abort());
  await page.route('**/workshops/**', route => route.abort());
  await page.goto('/events', { waitUntil: 'domcontentloaded' });
  await settled(page); await expect(screen(page)).toHaveCount(0);
  await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeVisible();
});

test('leaving a waiting Events visit cancels it; returning can start one new entry check', async ({ page }) => {
  const release = await holdPhotos(page);
  try {
    await page.goto('/recruitment', { waitUntil: 'domcontentloaded' }); await settled(page);
    await watchEntries(page);
    await navigate(page, 'Events'); await expect(screen(page)).toBeVisible();
    await page.goBack(); await expect(page).toHaveURL(/recruitment$/);
    await settled(page); await expect(screen(page)).toHaveCount(0);
    // Slow images on other pages cannot independently request the full-screen curtain.
    await page.evaluate(() => {
      const image = document.createElement('img'); image.src = '/workshop_images/irrelevant.webp';
      image.style.cssText = 'position:fixed;top:100px;left:100px;width:150px;height:150px'; document.body.append(image);
      window.dispatchEvent(new CustomEvent('nucleus:visual-request', { detail: { id: {}, pending: true } }));
    });
    await page.waitForTimeout(300); await expect(screen(page)).toHaveCount(0);
    await navigate(page, 'Events'); await expect(screen(page)).toBeVisible();
    expect(await page.evaluate(() => window.loaderEntries)).toBe(2);
    release(); await settled(page);
  } finally { release(); }
});

test('a stalled batch times out once and never restarts on resize or scroll', async ({ page }) => {
  const release = await holdPhotos(page);
  try {
    await page.goto('/recruitment', { waitUntil: 'domcontentloaded' }); await settled(page);
    await watchEntries(page);
    await navigate(page, 'Events'); await expect(screen(page)).toBeVisible();
    await settled(page); await expect(screen(page)).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(400);
    await expect(screen(page)).toHaveCount(0);
    await expect(page.locator('.site-shell')).not.toHaveAttribute('inert');
    expect(await page.evaluate(() => window.loaderEntries)).toBe(1);
  } finally { release(); }
});

test('ready event covers skip the extra entry curtain on a return visit', async ({ page }) => {
  await page.goto('/events', { waitUntil: 'domcontentloaded' }); await settled(page);
  await navigate(page, 'Recruitment'); await expect(page).toHaveURL(/recruitment$/);
  await watchEntries(page);
  await navigate(page, 'Events'); await expect(page).toHaveURL(/events$/);
  await page.waitForTimeout(450);
  await expect(screen(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.loaderEntries)).toBe(0);
});
