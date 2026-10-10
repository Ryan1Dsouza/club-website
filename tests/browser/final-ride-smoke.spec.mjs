import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
for (const mobile of [false, true]) {
  test(`ride loads, accepts controls and exits cleanly on ${mobile ? 'mobile' : 'desktop'}`, async ({ browser }, info) => {
    test.setTimeout(90000);
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('http://127.0.0.1:5173/events');
    await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15000 });
    await page.getByRole('button', { name: 'The Nucleus Ride', exact: true }).first().click();
    await page.getByRole('button', { name: "Yes, Let's Go", exact: true }).click();
    await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 40000 });
    await expect(page.locator('.events-flight')).toHaveCount(0, { timeout: 20000 });
    await expect(page.locator('.nx-world canvas')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath('ride.png') });
    await page.getByRole('button', { name: 'Back to Events', exact: true }).click();
    await expect(page.locator('.nx-world')).toHaveCount(0);
    await expect(page.locator('.events-grid')).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
  });
}
