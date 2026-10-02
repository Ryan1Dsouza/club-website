import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test.afterEach(async ({ page }, info) => {
  if (info.status === info.expectedStatus) return;
  await info.attach('arrival-diagnostics', { body: JSON.stringify(await page.locator('.nx-world').evaluate(el => ({ ...el.dataset, active: document.activeElement?.outerHTML.slice(0, 300) }))), contentType: 'application/json' });
  await page.screenshot({ path: info.outputPath('arrival-failure.png') });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`world station reveal and slow coast at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    test.setTimeout(105_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.route('**/api/site', route => route.fulfill({ json: { ...site, events: [] } }));
    await page.goto('/events');
    await page.getByRole('button', { name: /The Nucleus Ride/ }).click();
    await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15_000 });
    const world = page.locator('.nx-world'), card = world.locator('[data-world-card]').first();
    await expect(world.locator('.nx-world-markers button>span').first()).toHaveCSS('width', '46px');
    await expect(world.locator('.nx-world-markers button>span').first()).toHaveCSS('font-size', '15px');
    if (await page.getByRole('button', { name: 'Return to ride' }).isVisible()) await page.getByRole('button', { name: 'Return to ride' }).click();
    await world.focus();
    await expect(world).toHaveAttribute('data-drive-ready', 'true');
    await expect(card).toBeHidden();
    await page.evaluate(() => {
      window.arrivalSamples = [];
      const sample = () => {
        const world = document.querySelector('.nx-world'), card = world.querySelector('[data-world-card]');
        const style = getComputedStyle(card), rect = card.getBoundingClientRect();
        if (style.visibility === 'visible' && Number(style.opacity) > .1) window.arrivalSamples.push({
          opacity: Number(style.opacity), x: rect.x + rect.width / 2, y: rect.y + rect.height / 2,
          width: rect.width, phase: world.dataset.phase, dilation: Number(world.dataset.dilation),
          speed: Number(world.dataset.speed), focus: Number(world.dataset.stationFocus),
        });
        window.arrivalSampler = requestAnimationFrame(sample);
      };
      window.arrivalSampler = requestAnimationFrame(sample);
    });
    await world.focus(); await page.keyboard.down('w');
    await expect.poll(() => card.evaluate(el => Number(getComputedStyle(el).opacity)), { timeout: 40_000 }).toBeGreaterThan(.95);
    await page.keyboard.up('w');
    await expect(world).toHaveAttribute('data-phase', 'braking');
    await expect.poll(() => world.getAttribute('data-station-focus').then(Number)).toBeGreaterThan(.9);
    await expect(card).toBeVisible();
    await expect(card).toHaveCSS('pointer-events', 'none');
    await expect(card).toHaveCSS('left', '0px');
    await expect(card).toHaveCSS('top', '0px');
    const bounds = await card.boundingBox();
    expect(bounds.x).toBeGreaterThan(0); expect(bounds.x + bounds.width).toBeLessThan(viewport.width);
    expect(bounds.y).toBeGreaterThan(60); expect(bounds.y + bounds.height).toBeLessThan(viewport.height - 70);
    await page.screenshot({ path: info.outputPath('station-reveal.png') });
    await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible({ timeout: 25_000 });
    await expect(world).toHaveAttribute('data-distance', '211.00');
    const samples = await page.evaluate(() => { cancelAnimationFrame(window.arrivalSampler); return window.arrivalSamples; });
    const coasting = samples.filter(s => s.phase === 'braking');
    expect(coasting.some(s => s.opacity > .95 && s.dilation < .3 && Math.abs(s.speed) * s.dilation < 4)).toBe(true);
    expect(Math.max(...coasting.map(s => s.x)) - Math.min(...coasting.map(s => s.x))).toBeGreaterThan(10);
    expect(Math.max(...coasting.map(s => s.width)) - Math.min(...coasting.map(s => s.width))).toBeGreaterThan(15);
    const focused = coasting.findLast(s => s.focus > .99);
    expect(focused).toBeTruthy();
    expect(Math.abs(focused.x - viewport.width / 2)).toBeLessThan(20);
    expect(Math.abs(focused.y - viewport.height / 2)).toBeLessThan(20);
    await expect(world).toHaveAttribute('data-drive-ready', 'false');
    await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
    await expect(world).toHaveAttribute('data-drive-ready', 'true');
    await world.focus(); await page.keyboard.down('w');
    await expect(card).toBeHidden();
    await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeGreaterThan(219);
    await expect.poll(() => world.getAttribute('data-dilation').then(Number)).toBeGreaterThan(.95);
    if (viewport.width === 1440) {
      await expect.poll(() => world.getAttribute('data-distance').then(Number)).toBeGreaterThan(244);
      await page.keyboard.up('w');
      await page.getByRole('button', { name: /Travel to station 01/ }).click();
      await expect(world).toHaveAttribute('data-travel-target', '0');
      await expect.poll(() => card.evaluate(el => Number(getComputedStyle(el).opacity)), { timeout: 30_000 }).toBeGreaterThan(.95);
      await expect.poll(() => world.getAttribute('data-station-focus').then(Number)).toBeGreaterThan(.99);
      await expect(card).toBeVisible();
      await page.screenshot({ path: info.outputPath('reverse-station-reveal.png') });
      await expect(page.getByRole('dialog', { name: 'The first connection' })).toBeVisible({ timeout: 20_000 });
      await expect(world).toHaveAttribute('data-distance', '211.00');
    }
    await page.keyboard.up('w');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(world.locator('[data-world-card]')).toHaveCount(0);
    await expect(world).toHaveAttribute('data-dilation', '1.000');
    expect(errors).toEqual([]);
  });
}
