import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const photo = await readFile(new URL('../../workshops/inauguration/in1.avif', import.meta.url));
const original = await sharp(photo).metadata();
const storage = 'https://quality-fixture.supabase.co/storage/v1/object/public';
const members = site.team.slice(0, 6).map((member, index) => ({ ...member, photo_url: `${storage}/team-photos/member-${index}.avif` }));
const event = {
  id: 'quality-event', title: 'Original quality', description: 'Photographs from our community.',
  starts_at: '2026-10-01T09:00:00Z', ends_at: '2026-10-01T10:00:00Z', published: true,
  category: 'Workshop', location: 'SJEC', event_photos: [0, 1, 2].map(index => ({
    id: `quality-photo-${index}`, name: `Photograph ${index + 1}`, photo_url: `${storage}/event-photos/photo-${index}.avif`, position: index,
  })),
};

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.route('**/rest/v1/team_members?*', route => route.fulfill({ json: members }));
  await page.route('**/rest/v1/events?*', route => route.fulfill({ json: [event] }));
  await page.route('**/rest/v1/site_settings?*', route => route.fulfill({ json: { recruitment_open: false } }));
  await page.route('https://quality-fixture.supabase.co/**', route => route.fulfill({ body: photo, contentType: 'image/avif' }));
});

async function fullOriginal(image, url) {
  await expect(image).toHaveAttribute('src', url);
  await expect(image).not.toHaveAttribute('srcset');
  await expect(image).toHaveAttribute('decoding', 'async');
  await expect.poll(() => image.evaluate(img => ({ width: img.naturalWidth, height: img.naturalHeight }))).toEqual({ width: original.width, height: original.height });
  expect(await image.evaluate(img => img.currentSrc)).toBe(url);
}

for (const width of [390, 1440]) {
  test(`team cards and expanded portraits preserve their original pixels at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const transformed = [];
    page.on('request', request => { if (request.url().includes('/render/image/')) transformed.push(request.url()); });
    await page.goto('/team');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await expect(page.locator('.people-card')).toHaveCount(members.length);
    const image = page.locator('.people-card img').first();
    await fullOriginal(image, members[0].photo_url);
    await expect(image).toHaveAttribute('loading', 'eager');
    await expect(page.locator('.people-card img').nth(1)).toHaveAttribute('loading', 'lazy');
    await page.locator('.people-card > button').first().click();
    await fullOriginal(page.locator('.team-profile__photo img'), members[0].photo_url);
    expect(transformed).toEqual([]);
  });

  test(`event covers and book pages preserve their original pixels at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const transformed = [];
    page.on('request', request => { if (request.url().includes('/render/image/')) transformed.push(request.url()); });
    await page.goto('/events');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    const card = page.getByRole('button', { name: 'Open Original quality event book', exact: true });
    await fullOriginal(card.locator('img'), event.event_photos[0].photo_url);
    await card.click();
    if (width < 621) await page.getByRole('button', { name: 'Next book page', exact: true }).click();
    await fullOriginal(page.locator('.station-book__spread img').first(), event.event_photos[0].photo_url);
    expect(transformed).toEqual([]);
  });
}
