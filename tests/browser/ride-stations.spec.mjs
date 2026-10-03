import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const numbers = ['01', '02', '03', '04', '05', '06', '07'];
const distances = [211, 343, 595, 727, 1027, 1243, 1487];
const titles = ['Inauguration', 'Dev', 'Khoj', 'LinkedIn', 'n8n', 'Noesis', 'Unlocked'];
const primary = ['in1.avif', 'd1.avif', 'kh1.avif', 'linkdin1.avif', 'n8n1.avif', 'no1.avif', 'un1.avif'];
const counts = [12, 2, 4, 1, 4, 7, 6];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`seven matching stations are separate and boardable at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('/events');
    await page.getByRole('button', { name: 'Ride Immersive Experience', exact: true }).first().click();
    await page.getByRole('button', { name: "Yes, Let's Go" }).click();
    await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15_000 });
    if (viewport.width <= 768) await page.getByRole('button', { name: 'Open holographic map' }).click();
    const world = page.locator('.nx-world'), markers = world.locator('[data-world-station]');
    await expect(markers).toHaveCount(7);
    await expect(markers.locator('span')).toHaveText(numbers);
    for (const marker of await markers.all()) {
      await expect(marker).toBeVisible();
      await expect(marker.locator('span')).toHaveCSS('width', '46px');
    }
    const groups = [markers];
    if (viewport.width > 768) groups.push(page.getByRole('navigation', { name: 'Ride route map' }).getByRole('button'));
    for (const group of groups) {
      const boxes = await group.evaluateAll(elements => elements.map(element => {
        const r = element.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, radius: r.width / 2 };
      }));
      expect(boxes).toHaveLength(7);
      for (const [i, box] of boxes.entries()) for (const other of boxes.slice(i + 1)) {
        expect(Math.hypot(box.x - other.x, box.y - other.y)).toBeGreaterThan(box.radius + other.radius);
      }
    }
    await page.screenshot({ path: info.outputPath('seven-station-map.png') });
    for (let index = 0; index < 7; index++) {
      await page.getByRole('button', { name: `Ride from station ${numbers[index]}: ${titles[index]}`, exact: true }).click();
      const book = page.locator('.station-book');
      await expect(page.getByRole('dialog', { name: titles[index], exact: true })).toBeVisible();
      await expect(world).toHaveAttribute('data-pan-progress', '1.000');
      await expect(world).toHaveAttribute('data-pan-angle', '-1.5708');
      await expect(book).toHaveAttribute('data-station-number', numbers[index]);
      await expect(book).toHaveAttribute('data-scroll-engine', 'lenis');
      await expect(world).toHaveAttribute('data-distance', distances[index].toFixed(2));
      const opening = book.locator('.station-book__cover-art img');
      await expect(opening).toHaveAttribute('src', new RegExp(primary[index].replace('.', '\\.')));
      await expect.poll(() => opening.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
      await opening.evaluate(async image => { await image.decode(); });
      await book.evaluate(element => Promise.all(element.closest('dialog').getAnimations().map(animation => animation.finished)));
      const primarySource = await opening.getAttribute('src');
      if (index === 0) await page.screenshot({ path: info.outputPath('inauguration-first-spread.png') });
      const before = await world.getAttribute('data-distance');
      if (counts[index] > 1) {
        await book.locator('.station-book__page--right').hover();
        await page.mouse.wheel(0, 420);
        await expect(book).toHaveAttribute('data-book-turning', 'true');
        await expect(book.locator('.station-book__leaf')).toBeVisible();
        await expect(book).toHaveAttribute('data-book-page', '2');
        await expect(book).toHaveAttribute('data-book-turning', 'false');
        const gallery = book.locator('.station-book__spread');
        await expect(gallery.locator('img')).toHaveCount(Math.min(2, counts[index] - 1));
        await expect.poll(() => gallery.locator('img').evaluateAll(images => images.every(image => image.naturalWidth > 0))).toBe(true);
        expect(await gallery.innerText()).toBe('');
        expect(await gallery.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src')))).not.toContain(primarySource);
        if (index === 0) await page.screenshot({ path: info.outputPath('inauguration-photo-gallery.png') });
        await page.getByRole('button', { name: 'Previous book page' }).click();
        await expect(book).toHaveAttribute('data-book-progress', '0.000');
      } else await expect(page.getByRole('button', { name: 'Close book after last page' })).toBeEnabled();
      await expect(world).toHaveAttribute('data-distance', before);
      await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
      await expect(world).toHaveAttribute('data-drive-ready', 'true');
      await page.getByRole('button', { name: 'Open holographic map' }).click();
    }
    expect(errors).toEqual([]);
  });
}
