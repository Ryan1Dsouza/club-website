import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`the ride docks, pans right, opens the book, then visits station 02 at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('/events');
    await page.getByRole('button', { name: 'The Nucleus Ride', exact: true }).first().click();
    await page.getByRole('button', { name: "Yes, Let's Go" }).click();
    await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
    if (await page.getByRole('button', { name: 'Return to ride' }).isVisible()) await page.getByRole('button', { name: 'Return to ride' }).click();
    const world = page.locator('.nx-world'), book = page.locator('.station-book');
    await page.evaluate(() => {
      new MutationObserver(() => { if (document.querySelector('.station-book')) window.__bookOpenedAt ??= performance.now(); })
        .observe(document.body, { childList:true, subtree:true });
    });
    await world.focus(); await page.keyboard.down('w');
    await expect(book).toBeVisible({ timeout: 50_000 });
    await page.keyboard.up('w');
    await expect(world).toHaveAttribute('data-phase', 'stopped');
    await expect(world).toHaveAttribute('data-distance', '211.00');
    await expect(world).toHaveAttribute('data-drive-ready', 'false');
    const timing = await world.evaluate(element => ({ pan:Number(element.dataset.panCompletedAt) - Number(element.dataset.panStartedAt), reveal:window.__bookOpenedAt - Number(element.dataset.panCompletedAt) }));
    expect(timing.pan).toBeLessThan(500); // 400ms tween plus one rendered frame.
    expect(timing.reveal).toBeGreaterThanOrEqual(0);
    expect(timing.reveal).toBeLessThanOrEqual(200);
    await expect(world).toHaveAttribute('data-pan-depth-of-field', 'false');
    await expect(book).toHaveAttribute('data-station-number', '01');
    await expect(world).toHaveAttribute('data-pan-angle', '-1.5708');
    await expect(world).toHaveAttribute('data-distance', '211.00');
    await page.screenshot({ path: info.outputPath('docked-inauguration-book.png') });
    await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
    await world.focus(); await page.keyboard.down('w');
    await expect(book).toHaveAttribute('data-station-number', '02', { timeout: 40_000 });
    await page.keyboard.up('w');
    await expect(world).toHaveAttribute('data-distance', '343.00');
    await expect(book).toHaveAttribute('data-station-number', '02');
    await expect(page.getByRole('dialog', { name: 'Dev', exact: true })).toBeVisible();
    await expect(world).toHaveAttribute('data-pan-angle', '-1.5708');
    expect(errors).toEqual([]);
  });
}
