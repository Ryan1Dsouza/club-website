import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { createApp } from '../../server/app.mjs';
import { openDatabase, hashPassword, getSite } from '../../server/db.mjs';

let db, server, apiBase;
const photo = await sharp({ create: { width: 80, height: 100, channels: 3, background: '#81b990' } }).png().toBuffer();
test.use({ reducedMotion: 'reduce' });
test.beforeEach(async ({ baseURL }) => {
  db = openDatabase(':memory:');
  db.prepare('INSERT INTO admins VALUES(?,?,?)').run('browser-admin', 'admin@example.com', hashPassword('browser-fixture-password'));
  server = createApp(db, { limits: false, origin: baseURL, dist: resolve('__no_browser_dist__') }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  apiBase = `http://127.0.0.1:${server.address().port}`;
});
test.afterEach(async () => { await new Promise(resolve => server.close(resolve)); db.close(); });
async function connect(page) {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    await route.fulfill({ response: await route.fetch({ url: apiBase + url.pathname + url.search }) });
  });
}
function settings(patch) { db.prepare('UPDATE settings SET body=?').run(JSON.stringify({ ...getSite(db).settings, ...patch })); }
async function ready(page, path) {
  await page.goto(path);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
}
async function login(page) {
  await page.goto('/admin');
  await page.getByLabel('Email', { exact: true }).fill('admin@example.com');
  await page.getByLabel('Password', { exact: true }).fill('browser-fixture-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Recruitment inbox' })).toBeVisible();
}
async function fillApplication(page) {
  await page.getByLabel('Your name', { exact: true }).fill('Asha Student');
  await page.getByLabel('Email address', { exact: true }).fill('asha@example.com');
  await page.getByLabel('Year of study').selectOption('2');
  await page.getByLabel('Your domain').selectOption('web');
  await page.getByLabel('What would you like to learn or build?').fill('I want to build useful accessible websites with the Nucleus community.');
  await page.getByLabel('LinkedIn', { exact: true }).fill('https://linkedin.com/in/asha');
  await page.getByLabel('GitHub', { exact: true }).fill('https://github.com/asha');
  await page.getByLabel('LeetCode', { exact: true }).fill('https://leetcode.com/u/asha');
  await page.getByLabel('Other / portfolio', { exact: true }).fill('https://asha.example.com');
  await page.getByRole('checkbox').check();
}

test('an applicant submits all profile links and an administrator reviews the persisted application', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  settings({ recruitmentOpen: true }); await connect(page); await ready(page, '/recruitment');
  await expect(page.getByLabel('Year of study').locator('option')).toHaveText(['Select year', '1st year', '2nd year', '3rd year']);
  await fillApplication(page);
  await page.screenshot({ path: info.outputPath('recruitment-mobile.png'), fullPage: true });
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.getByRole('heading', { name: 'Application received.' })).toBeVisible();
  const saved = db.prepare('SELECT * FROM applications').get();
  expect(saved.github).toBe('https://github.com/asha');
  expect(saved.portfolio).toBe('https://asha.example.com');
  await login(page);
  await page.getByRole('button', { name: 'Review Asha Student' }).click();
  const dialog = page.getByRole('dialog');
  for (const label of ['LinkedIn', 'GitHub', 'LeetCode', 'Other / portfolio']) await expect(dialog.getByRole('link', { name: label })).toBeVisible();
  await dialog.getByLabel('Review status').selectOption('reviewing');
  await expect.poll(() => db.prepare('SELECT status FROM applications').get().status).toBe('reviewing');
  await page.screenshot({ path: info.outputPath('application-review-mobile.png') });
});

test('closed recruitment, unavailable backend, and closure during submission are handled honestly', async ({ page }) => {
  settings({ recruitmentNextOpening: 'November 2026' }); await connect(page); await ready(page, '/recruitment');
  await expect(page.getByText('Next intake: November 2026')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send application' })).toHaveCount(0);
  await page.route('**/api/site', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('couldn’t check recruitment');
  await page.unroute('**/api/site'); settings({ recruitmentOpen: true });
  await page.getByRole('button', { name: 'Try again' }).click();
  await fillApplication(page); settings({ recruitmentOpen: false });
  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.getByText('Recruitment is currently closed', { exact: true })).toBeVisible();
  expect(db.prepare('SELECT COUNT(*) n FROM applications').get().n).toBe(0);
});

for (const width of [390, 1280]) {
  test(`dashboard manages recruitment, event albums and team portraits at ${width}px`, async ({ page, context }, info) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 }); await connect(page); await login(page);
    await page.getByRole('tab', { name: 'settings', exact: true }).click();
    await page.getByRole('switch', { name: 'Accept applications' }).click();
    await expect(page.getByRole('switch')).toBeChecked();
    expect(getSite(db).settings.recruitmentOpen).toBe(true);
    await page.getByRole('tab', { name: 'events', exact: true }).click();
    await page.getByRole('button', { name: 'Add event', exact: true }).click();
    let dialog = page.getByRole('dialog');
    await dialog.getByLabel('Event title', { exact: true }).fill('Community build night');
    await dialog.getByLabel('Category', { exact: true }).fill('Workshop');
    await dialog.getByLabel('Description', { exact: true }).fill('Build useful web projects together with the student community.');
    await dialog.getByLabel('Starts (your local timezone)', { exact: true }).fill('2026-11-12T17:30');
    await dialog.getByLabel('Venue / location', { exact: true }).fill('Campus lab');
    await dialog.getByLabel('Upload event photos').setInputFiles({ name: 'workshop.png', mimeType: 'image/png', buffer: photo });
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).toHaveCount(0);
    const savedEvent = getSite(db).events.find(event => event.title === 'Community build night');
    expect(savedEvent.photos).toHaveLength(1); expect(savedEvent.trackPosition).toBeGreaterThan(0);
    const eventCard = page.locator('.admin-content-card').filter({ hasText: 'Community build night' });
    await eventCard.getByRole('button', { name: 'Edit', exact: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByLabel('Upload event photos').setInputFiles([{ name: 'new.png', mimeType: 'image/png', buffer: photo }, { name: 'second.png', mimeType: 'image/png', buffer: photo }]);
    await dialog.getByRole('button', { name: 'Save changes' }).click(); await expect(dialog).toHaveCount(0);
    const event = getSite(db).events.find(item => item.id === savedEvent.id);
    expect(event.photos).toHaveLength(2); expect(event.photos[0].url).not.toBe(savedEvent.photos[0].url);

    await page.getByRole('tab', { name: 'team', exact: true }).click();
    await page.getByRole('button', { name: 'Add member' }).click(); dialog = page.getByRole('dialog');
    await dialog.getByLabel('Full name').fill('Asha Mentor'); await dialog.getByLabel('Role', { exact: true }).fill('Web lead'); await dialog.getByLabel('Initials').fill('AM');
    await dialog.getByLabel('Upload member photo').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: photo });
    await dialog.getByRole('button', { name: 'Save changes' }).click(); await expect(dialog).toHaveCount(0);
    const member = getSite(db).team.find(item => item.name === 'Asha Mentor');
    const memberCard = page.locator('.admin-content-card').filter({ hasText: 'Asha Mentor' });
    await memberCard.getByRole('button', { name: 'Edit', exact: true }).click(); dialog = page.getByRole('dialog');
    await dialog.getByLabel('Role', { exact: true }).fill('Technical lead');
    await dialog.getByLabel('Upload member photo').setInputFiles({ name: 'new-portrait.png', mimeType: 'image/png', buffer: photo });
    await dialog.getByRole('button', { name: 'Save changes' }).click(); await expect(dialog).toHaveCount(0);
    const updated = getSite(db).team.find(item => item.id === member.id);
    expect(updated.image).not.toBe(member.image); expect(updated.role).toBe('Technical lead');
    await page.screenshot({ path: info.outputPath(`admin-team-${width}.png`), fullPage: true });
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const visitor = await context.newPage(); await connect(visitor); await ready(visitor, '/events');
    const publicEvent = visitor.getByRole('button', { name: 'Open Community build night event book' });
    await expect(publicEvent).toBeVisible(); await expect(publicEvent.locator('img')).toHaveAttribute('src', event.photos[0].url);
    await ready(visitor, '/team'); await expect(visitor.locator(`img[src="${updated.image}"]`).first()).toBeVisible();
    await visitor.close();
    db.exec('DELETE FROM sessions');
    await page.getByRole('tab', { name: /applications/ }).click(); await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.locator('.admin-shell')).toHaveCount(0);
  });
}

for (const viewport of [{ width: 280, height: 653 }, { width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 844, height: 390 }]) {
  test(`navigation reserves space and keeps controls reachable at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    await page.setViewportSize(viewport); await connect(page); await ready(page, '/recruitment');
    const pill = await page.locator('.morph-nav__pill').boundingBox();
    const heading = await page.locator('h1').boundingBox();
    expect(heading.y).toBeGreaterThan(pill.y + pill.height);
    expect(pill.height).toBeLessThanOrEqual(54);
    await page.getByRole('button', { name: 'Open menu' }).click();
    for (const control of await page.locator('.morph-nav__links a, .morph-nav__socials a, .morph-nav__join').all()) {
      await control.scrollIntoViewIfNeeded();
      const box = await control.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y).toBeGreaterThanOrEqual(pill.y + pill.height);
      await expect(control).toBeInViewport();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({ path: info.outputPath('responsive-menu.png') });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert');
  });
}
