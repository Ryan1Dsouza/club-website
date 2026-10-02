import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const shell = page => page.locator('[data-event-mode]');
const carousel = page => page.locator('.event-carousel');

async function open(page, data = site) {
  await page.route('**/api/site', route => route.fulfill({ json: data }));
  await page.goto('/events');
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 12_000 });
}

async function browse(page) {
  await page.getByRole('button', { name: /Quick Browse/ }).click();
  await expect(page.getByRole('region', { name: 'Event carousel' })).toBeVisible();
  await expect(page.locator('.ec-title__mask').first().locator('span')).toHaveCSS('transform', 'none');
}

test('choice screen loads neither scene, Quick Browse snaps with parallax, and details preserve focus', async ({ page }, info) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const worldRequests = []; page.on('request', request => { if (/LogoWorld|event-world/.test(request.url())) worldRequests.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await expect(shell(page)).toHaveAttribute('data-event-mode', 'choice');
  await expect(page.locator('.nx-world,.ec-scroll')).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('events-choice-desktop.png') });
  await browse(page);
  expect(worldRequests).toEqual([]);
  const scroller = page.getByRole('region', { name: 'Event carousel' });
  await expect(scroller).toHaveCSS('scroll-snap-type', 'y mandatory');
  await expect(scroller).toBeFocused();
  const first = page.locator('[data-event-card]').first();
  const [art, slab] = await Promise.all([first.locator('[data-event-art]').boundingBox(), first.locator('.ec-slab').boundingBox()]);
  expect(art.y).toBeLessThan(slab.y);
  expect(art.width).toBeGreaterThan(slab.width);
  await page.screenshot({ path: info.outputPath('event-carousel-desktop.png') });
  const background = await carousel(page).evaluate(element => getComputedStyle(element).backgroundColor);
  const before = await first.locator('[data-event-art]').evaluate(element => getComputedStyle(element).transform);
  await page.mouse.move(1100, 650);
  await page.mouse.wheel(0, 780);
  await expect(carousel(page)).toHaveAttribute('data-active-event', site.events[1].id);
  await expect.poll(() => scroller.evaluate(element => Math.abs(element.scrollTop - element.clientHeight))).toBeLessThan(2);
  await expect.poll(() => carousel(page).evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(background);
  await expect.poll(() => first.locator('[data-event-art]').evaluate(element => getComputedStyle(element).transform)).not.toBe(before);
  await page.screenshot({ path: info.outputPath('event-carousel-second.png') });
  const explore = page.getByRole('button', { name: `Explore ${site.events[1].title}`, exact: true });
  await explore.click();
  await expect(page.getByRole('dialog')).toContainText(site.events[1].description);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(explore).toBeFocused();
  await scroller.focus();
  await page.keyboard.press('End');
  await expect(carousel(page)).toHaveAttribute('data-active-event', site.events.at(-1).id);
  await expect(page.getByRole('button', { name: 'Next event', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Change experience' }).click();
  await expect(page.getByRole('button', { name: /Quick Browse/ })).toBeFocused();
  await expect(page.locator('.ec-scroll')).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 280, height: 653 }]) {
  test(`choice and carousel stay readable at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: info.outputPath(`events-choice-${viewport.width}.png`), fullPage: true });
    await browse(page);
    const card = page.locator('[data-event-card][data-active="true"]');
    await expect(card).toHaveCSS('height', `${viewport.height}px`);
    for (const target of [card.locator('h2'), card.locator('.ec-open'), page.getByRole('button', { name: 'Change experience' }), page.getByRole('button', { name: 'Next event', exact: true })]) {
      const box = await target.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1); expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    await page.screenshot({ path: info.outputPath(`event-carousel-${viewport.width}.png`) });
    await page.getByRole('button', { name: 'Next event', exact: true }).click();
    await expect(carousel(page)).toHaveAttribute('data-active-event', site.events[1].id);
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
    expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
  });
}

test('photos overflow their panel, unpublished events stay private, and one-event navigation is bounded', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><circle cx="300" cy="290" r="230" fill="#c3e5c8"/><path d="M130 750L470 750 380 200 220 200Z" fill="#364939"/><text x="300" y="330" text-anchor="middle" fill="white" font-size="66">NUCLEUS</text></svg>');
  const event = { ...site.events[0], photos: [{ id: 'photo', name: 'Event poster', url: image }], registrationUrl: 'https://example.com/register', albumUrl: 'https://example.com/album' };
  await open(page, { ...site, events: [event, { ...site.events[1], published: false }] });
  await browse(page);
  await expect(page.locator('[data-event-card]')).toHaveCount(1);
  await expect(page.locator('.ec-photo-main')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next event', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Previous event', exact: true })).toBeDisabled();
  await page.screenshot({ path: info.outputPath('event-carousel-photo.png') });
  await page.getByRole('button', { name: `Explore ${event.title}` }).click();
  await expect(page.getByRole('link', { name: /Register for event/ })).toHaveAttribute('href', event.registrationUrl);
  await expect(page.getByRole('img', { name: 'Event poster' })).toBeVisible();
});

test('empty collections have an honest empty state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, { ...site, events: [] });
  await page.getByRole('button', { name: /Quick Browse/ }).click();
  await expect(page.getByRole('heading', { name: /The next connection/ })).toBeVisible();
  await expect(page.locator('.ec-scroll')).toHaveCount(0);
  await page.getByRole('button', { name: 'Change experience' }).click();
  await expect(shell(page)).toHaveAttribute('data-event-mode', 'choice');
});

test('long titles and failed photos remain usable on a short phone screen', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/missing-event-photo.png', route => route.abort());
  const event = { ...site.events[0], title: 'A collaborative workshop on building useful artificial intelligence with the Nucleus community', photos: [{ id: 'broken', name: 'Unavailable photo', url: '/missing-event-photo.png' }] };
  await open(page, { ...site, events: [event] });
  await browse(page);
  await expect(page.locator('.ec-foreground .event-sculpture')).toBeVisible();
  const title = await page.getByRole('heading', { name: event.title, exact: true }).boundingBox();
  expect(title.x).toBeGreaterThanOrEqual(0); expect(title.x + title.width).toBeLessThanOrEqual(320);
  const button = await page.locator('.ec-open').boundingBox();
  expect(button.y + button.height).toBeLessThan(568);
  await page.screenshot({ path: info.outputPath('event-carousel-long-title.png') });
});

test('the immersive choice still mounts the ride and switching back disposes the scene', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.rideContexts = new Set();
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      const context = getContext.call(this, type, ...args);
      if (context && (type === 'webgl2' || type === 'webgl')) window.rideContexts.add(context);
      return context;
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page.getByRole('button', { name: /The Nucleus Ride/ }).click();
  await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator('.nx-world canvas')).toHaveCount(1);
  expect(await page.evaluate(() => window.rideContexts.size)).toBe(1);
  await expect.poll(() => page.locator('.nx-world').getAttribute('data-draw-calls').then(Number)).toBeLessThan(60);
  await page.getByRole('button', { name: 'Change experience' }).click();
  await expect(page.locator('.nx-world canvas')).toHaveCount(0);
  expect(await page.evaluate(() => [...window.rideContexts].every(context => context.isContextLost()))).toBe(true);
  await expect(page.getByRole('button', { name: /The Nucleus Ride/ })).toBeFocused();
  await browse(page);
  await expect(page.locator('.nx-world')).toHaveCount(0);
  expect(errors).toEqual([]);
});
