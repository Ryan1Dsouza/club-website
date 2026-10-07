import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const endpoint = '**/rest/v1/live_news?*';
const items = [
  { id: '00000000-0000-4000-8000-000000000003', title: 'Build something that matters.', description: 'An evening of ideas, quick prototypes, and a room full of people who love making things. Join our next community build session.', image_url: 'https://news-fixture.supabase.co/storage/v1/object/public/news-posters/build.webp', date: '2026-10-12', created_at: '2026-10-06T09:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000002', title: 'A new chapter for curious minds.', description: 'Meet the community, find your people, and get a first look at what we’re working on this semester.', image_url: 'https://news-fixture.supabase.co/storage/v1/object/public/news-posters/community.webp', date: '2026-10-10', created_at: '2026-10-05T09:00:00Z' },
  { id: '00000000-0000-4000-8000-000000000001', title: 'Small ideas. Shared progress.', description: 'A few updates from across Nucleus: projects taking shape, new collaborations, and the next steps in our journey.', image_url: null, date: null, created_at: '2026-10-04T09:00:00Z' },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  // Real local photographs stand in for storage downloads; no remote content or writes.
  await page.route('**/storage/v1/object/public/news-posters/*', async route => {
    const name = route.request().url().includes('build') ? 'workshops/coding/coding1.avif' : 'workshops/inauguration/in1.avif';
    await route.fulfill({ body: await readFile(name), contentType: 'image/avif' });
  });
});

async function settled(page, path = '/news') {
  await page.goto(path);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
}

for (const [width, columns] of [[1440, 3], [820, 2], [390, 1]]) {
  test(`read-only news has ${columns} columns at ${width}px, accessible cards and correct dates`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    const requests = [];
    await page.route(endpoint, route => {
      requests.push({ method: route.request().method(), url: route.request().url() });
      return route.fulfill({ json: items });
    });
    await settled(page);
    const cards = page.locator('.news-card');
    await expect(cards).toHaveCount(3);
    await expect(page).toHaveTitle('Live News — Nucleus SJEC');
    await expect(page.locator('.live-news')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(cards.first()).toHaveCSS('color', 'rgb(155, 207, 162)');
    await expect(cards.first()).toHaveCSS('background-color', 'rgb(3, 8, 4)');
    await expect(cards.first().locator('time')).toHaveText('Oct 12, 2026');
    await expect(cards.last().locator('time')).toHaveText('Oct 4, 2026');
    expect(await cards.locator('h3').allTextContents()).toEqual(items.map(item => item.title));
    const boxes = await cards.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().x));
    expect(new Set(boxes).size).toBe(columns);
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every(request => request.method === 'GET')).toBe(true);
    for (const request of requests) expect(new URL(request.url).searchParams.get('order')).toBe('created_at.desc,id.desc');
    for (const image of await cards.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(element => element.naturalWidth)).toBeGreaterThan(0);
      await expect(image).toHaveCSS('object-fit', 'cover');
    }
    await expect(page.locator('.news-card__placeholder')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const accessibility = await new AxeBuilder({ page }).include('.live-news').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`news-${width}.png`), fullPage: true });
  });
}

test('a delayed query shows a skeleton, then the news without blocking navigation', async ({ page }, info) => {
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  await page.route(endpoint, async route => { await ready; await route.fulfill({ json: items }).catch(() => {}); });
  try {
    await settled(page);
    await expect(page.locator('.news-skeleton')).toHaveCount(6);
    await expect(page.getByRole('status')).toHaveText('Loading the latest news…');
    await expect(page.locator('.live-news__feed')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
    await page.screenshot({ path: info.outputPath('news-skeleton.png') });
    release();
    await expect(page.locator('.news-card')).toHaveCount(3);
    await expect(page.locator('.news-skeleton')).toHaveCount(0);
    await expect(page.locator('.live-news__feed')).toHaveAttribute('aria-busy', 'false');
  } finally { release(); }
});

test('query errors are readable and retry recovers', async ({ page }, info) => {
  await page.route(endpoint, route => route.fulfill({ status: 403, json: { message: 'permission denied' } }));
  await settled(page);
  await expect(page.getByRole('alert')).toContainText('The news couldn’t load.');
  await expect(page.locator('.news-skeleton')).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('news-error.png') });
  await page.unroute(endpoint);
  await page.route(endpoint, route => route.fulfill({ json: items }));
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.news-card')).toHaveCount(3);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('an empty feed is intentional and the alias shares the canonical URL', async ({ page }) => {
  await page.route(endpoint, route => route.fulfill({ json: [] }));
  await settled(page, '/live-news');
  await expect(page.getByRole('status')).toContainText('No updates yet.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nucleussjec.in/news');
  await expect(page.locator('.news-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('link', { name: 'Live News', exact: true }).click();
  await expect(page).toHaveURL(/\/news$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Live news');
});

test('broken posters and invalid dates never break a card; descriptions stay plain text', async ({ page }) => {
  await page.route('**/storage/v1/object/public/news-posters/*', route => route.abort());
  await page.route(endpoint, route => route.fulfill({ json: [{ ...items[0], date: 'invalid', description: '<img src=x onerror=alert(1)> Plain text only.' }] }));
  await settled(page);
  await expect(page.locator('.news-card__placeholder')).toBeVisible();
  await expect(page.locator('.news-card time')).toHaveText('Oct 6, 2026');
  await expect(page.locator('.news-card__description')).toHaveText('<img src=x onerror=alert(1)> Plain text only.');
  await expect(page.locator('.news-card__description img')).toHaveCount(0);
});

test('a stalled query becomes retryable after the timeout', async ({ page }) => {
  await page.clock.install();
  await page.route(endpoint, () => {});
  await settled(page);
  await expect(page.locator('.news-skeleton')).toHaveCount(6);
  await page.clock.fastForward(15_100);
  await expect(page.getByRole('alert')).toContainText('The news couldn’t load.');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeEnabled();
});
