import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test.use({ viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true });
test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.__towerStartup = { compiling: false, renders: 0, disposed: false };
    let release;
    const held = new Promise(resolve => { release = resolve; });
    window.__releaseTowerCompilation = release;
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const compile = renderer.compileAsync.bind(renderer);
      const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer);
      renderer.compileAsync = async (...args) => {
        const result = await compile(...args);
        window.__towerStartup.compiling = true;
        await held;
        return result;
      };
      renderer.render = (...args) => { window.__towerStartup.renders++; return render(...args); };
      renderer.dispose = () => {
        dispose();
        window.__towerStartup.disposed = true;
        window.__towerStartup.memory = { ...renderer.info.memory };
      };
    } };
  });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect.poll(() => page.evaluate(() => window.__towerStartup.compiling)).toBe(true);
});

test('a scene started before navigation releases its GPU resources when compilation finishes', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('.people-page')).toHaveCount(0);
  await page.evaluate(() => window.__releaseTowerCompilation());
  await expect.poll(() => page.evaluate(() => window.__towerStartup.disposed)).toBe(true);
  expect(await page.evaluate(() => window.__towerStartup.memory)).toEqual({ geometries: 0, textures: 0 });
  expect(errors).toEqual([]);
});

test('a reduced-motion change during compilation cannot revive the animated scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'still');
  await page.evaluate(() => window.__releaseTowerCompilation());
  await expect.poll(() => page.evaluate(() => window.__towerStartup.disposed)).toBe(true);
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'still');
  await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
});

test('the tower waits for shader compilation before drawing its first frame', async ({ page }) => {
  expect(await page.evaluate(() => window.__towerStartup.renders)).toBe(0);
  await page.evaluate(() => window.__releaseTowerCompilation());
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await expect.poll(() => page.evaluate(() => window.__towerStartup.renders)).toBeGreaterThan(0);
});
