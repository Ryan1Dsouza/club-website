import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { workshops } from '../fixtures/workshops.mjs';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const folders = workshops.map(workshop => workshop.id);
const titles = workshops.map(workshop => workshop.title);
const counts = workshops.map(workshop => workshop.photos);

async function open(page, data = site) {
  await page.route('**/api/site', route => route.fulfill({ json: data }));
  await page.goto('/events');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout:15000 });
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15000 });
}

for (const [width, columns] of [[2560, 3], [1440, 3], [820, 2], [390, 1]]) {
  test(`Events grid has ${columns} columns, working images and two portals at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height:900 });
    await open(page, width === 2560 ? { ...site, events:[] } : site);
    await expect(page).toHaveTitle(/Events/);
    const cards = page.locator('.event-card');
    await expect(cards).toHaveCount(workshops.length);
    expect(await cards.evaluateAll(elements => elements.map(element => element.dataset.workshop))).toEqual(folders);
    const boxes = await cards.evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x:box.x, y:box.y, width:box.width, height:box.height }; }));
    expect(new Set(boxes.map(box => box.x)).size).toBe(columns);
    for (const box of boxes) { expect(box.width).toBeGreaterThan(250); expect(box.height).toBeGreaterThan(300); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width); }
    if (columns > 1) expect(boxes[1].x - boxes[0].x - boxes[0].width).toBeLessThanOrEqual(81);
    if (columns === 3) expect((await page.locator('.events-archive').boundingBox()).width).toBeLessThanOrEqual(1440);
    for (let index = 0; index < workshops.length; index++) {
      await cards.nth(index).scrollIntoViewIfNeeded();
      const photo = cards.nth(index).locator('img');
      await expect(photo).toHaveAttribute('src', new RegExp(`/workshops/${folders[index]}/.*1\\.avif`));
      await expect.poll(() => photo.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    }
    await expect(page.locator('.events-portal')).toHaveCount(2);
    await expect(page.getByRole('button', { name:'The Nucleus Ride', exact:true })).toHaveCount(columns === 3 ? 2 : 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path:info.outputPath('events-grid.png'), fullPage:true });
  });
}

test('every card opens its own sequential, edge-to-edge book and the last turn dismisses it', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await open(page);
  for (let index = 0; index < workshops.length; index++) {
    const card = page.getByRole('button', { name:`Open ${titles[index]} event book`, exact:true });
    await card.click();
    const dialog = page.getByRole('dialog', { name:titles[index], exact:true }), book = dialog.locator('.station-book');
    await expect(book).toHaveAttribute('data-scroll-engine', 'lenis');
    await expect(book).toHaveAttribute('data-workshop', folders[index]);
    await expect(book.locator('.station-book__story')).toContainText('Key highlights');
    const cover = book.locator('.station-book__cover-art img');
    await expect(cover).toHaveAttribute('src', new RegExp(`/workshops/${folders[index]}/.*1\\.avif`));
    await expect(cover).toHaveCSS('object-fit', 'contain');
    if (index === 0) await page.screenshot({ path:info.outputPath('book-editorial.png') });
    const sources = [await cover.getAttribute('src')];
    const spreads = 1 + Math.ceil((counts[index] - 1) / 2);
    for (let spread = 2; spread <= spreads; spread++) {
      await dialog.getByRole('button', { name:'Next book page', exact:true }).click();
      await expect(book).toHaveAttribute('data-book-page', String(spread));
      const pages = book.locator('.station-book__spread');
      expect(await pages.innerText()).toBe('');
      sources.push(...await pages.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src'))));
      for (const image of await pages.locator('img').all()) {
        await expect(image).toHaveCSS('object-fit', 'contain');
        await expect.poll(() => image.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
        await image.evaluate(image => image.decode());
        expect((await image.boundingBox()).height).toBeGreaterThan(100);
      }
      if (index === 0 && spread === 2) await page.screenshot({ path:info.outputPath('book-photo-spread.png') });
    }
    expect(sources).toHaveLength(counts[index]);
    expect(new Set(sources).size).toBe(counts[index]);
    await book.getByRole('region', { name:`${titles[index]} event book`, exact:true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  }
});

test('scroll drives a curved page turn, locks background scrolling and restores focus', async ({ page }, info) => {
  await open(page);
  const card = page.getByRole('button', { name:'Open Inauguration event book', exact:true });
  await card.focus();
  await expect(card).toHaveCSS('outline-style', 'solid');
  await card.hover();
  await expect(card.locator('.event-card__view')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await card.click();
  const scroll = await page.evaluate(() => scrollY);
  await page.locator('.station-book__page--right').hover();
  await page.mouse.wheel(0, 200);
  await expect(page.locator('.station-book')).toHaveAttribute('data-book-turning', 'true');
  await expect(page.locator('.station-book__strip')).toHaveCount(8);
  await page.screenshot({ path:info.outputPath('book-mid-turn.png') });
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(card).toBeFocused();
});

test('both portals require confirmation, animate into the ride and return focus', async ({ page }, info) => {
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/LogoWorld|event-world/.test(request.url())) requests.push(request.url()); });
  await open(page);
  expect(requests).toEqual([]);
  for (let index = 0; index < 2; index++) {
    const trigger = page.getByRole('button', { name:'The Nucleus Ride', exact:true }).nth(index);
    await trigger.click();
    await expect(page.getByRole('dialog')).toContainText('Do you want to hop into the Nucleus Ride?');
    await page.getByRole('button', { name:'Maybe Later', exact:true }).click();
    await expect(trigger).toBeFocused();
    await expect(page.locator('.nx-world')).toHaveCount(0);
  }
  expect(requests).toEqual([]);
  await page.getByRole('button', { name:'The Nucleus Ride', exact:true }).last().click();
  await page.screenshot({ path:info.outputPath('portal-invitation.png') });
  await page.getByRole('button', { name:"Yes, Let's Go" }).click();
  await expect(page.getByRole('status', { name:'Entering the Nucleus Ride' })).toBeVisible();
  await expect(page.locator('.events-page')).toHaveAttribute('data-event-mode', 'immersive');
  await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout:30000 });
  await page.getByRole('button', { name:'Back to Events', exact:true }).click();
  await expect(page.getByRole('button', { name:'The Nucleus Ride', exact:true }).last()).toBeFocused();
  await expect(page.locator('.nx-world')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('grid, invitation and book remain accessible on a small phone', async ({ page }) => {
  await page.setViewportSize({ width:320, height:568 });
  await page.emulateMedia({ reducedMotion:'reduce' });
  await open(page);
  expect((await new AxeBuilder({ page }).include('.events-page').analyze()).violations).toEqual([]);
  await page.getByRole('button', { name:'The Nucleus Ride', exact:true }).first().click();
  expect((await new AxeBuilder({ page }).include('.events-portal-dialog').analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name:'Open Inauguration event book', exact:true }).click();
  const dialog = page.getByRole('dialog'), box = await dialog.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320); expect(box.y + box.height).toBeLessThanOrEqual(568);
  expect((await new AxeBuilder({ page }).include('.nx-book-dialog').analyze()).violations).toEqual([]);
});
