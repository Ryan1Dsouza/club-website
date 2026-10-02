import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.__logoFrames = [];
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => {
        render(scene, camera);
        if (!renderer.domElement.closest('.logo-landing__scene')) return;
        const assembly = scene.children.find(object => object.geometry?.getAttribute('aStart'));
        window.__logoFrames.push({
          time: assembly.material.uniforms.uTime.value,
          particles: assembly.geometry.getAttribute('position').count,
          stage: document.querySelector('.site-shell')?.dataset.loadingStage,
          curtain: Boolean(document.querySelector('[data-loading-screen]')),
          assemblyVisible: assembly.visible,
        });
      };
    } };
  });
});

for (const mobile of [true, false]) {
  test.describe(mobile ? 'phone logo' : 'desktop logo', () => {
    test.use({ viewport: mobile ? { width: 393, height: 851 } : { width: 1280, height: 800 },
      isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2.75 : 1 });

    test('formation plays after the loader and reveals the title only when assembled', async ({ page }, info) => {
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto('/');
      const hero = page.locator('.logo-landing');
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
      await expect(hero).toHaveAttribute('data-status', 'ready');
      await expect.poll(() => page.evaluate(() => window.__logoFrames.length)).toBeGreaterThan(0);
      const first = await page.evaluate(() => window.__logoFrames[0]);
      expect(first.stage).toBe('done');
      expect(first.curtain).toBe(false);
      expect(first.time).toBe(0);
      expect(first.assemblyVisible).toBe(true);
      expect(first.particles).toBeLessThanOrEqual(mobile ? 900 : 1400);
      await expect(hero).toHaveAttribute('data-text-ready', 'false');
      await expect(hero.locator('.mu-morph-wrap')).toBeHidden();
      await expect.poll(() => page.evaluate(() => window.__logoFrames.at(-1).time)).toBeGreaterThan(.8);
      await page.screenshot({ path: info.outputPath('forming.png') });
      await expect(hero).toHaveAttribute('data-text-ready', 'true', { timeout: 15_000 });
      await expect(hero.locator('.mu-morph-wrap')).toBeVisible();
      await expect(hero.locator('.logo-landing__fallback')).toBeHidden();
      expect(await page.evaluate(() => window.__logoFrames.at(-1).assemblyVisible)).toBe(false);
      await page.screenshot({ path: info.outputPath('formed.png') });
      if (mobile) {
        const frames = await page.evaluate(() => window.__logoFrames.length);
        await page.waitForTimeout(400);
        expect(await page.evaluate(() => window.__logoFrames.length)).toBe(frames);
        await page.setViewportSize({ width: 851, height: 393 });
        await expect.poll(() => page.evaluate(() => window.__logoFrames.length)).toBeGreaterThan(frames);
        await expect(hero).toHaveAttribute('data-text-ready', 'true');
        await expect(hero.locator('canvas')).toHaveCount(1);
      }
      expect(errors).toEqual([]);
    });
  });
}

test.describe('mobile startup', () => {
  test.use({ viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true });
  test('slow scene loading does not show a completed logo or title before formation', async ({ page }) => {
    let release;
    const ready = new Promise(resolve => { release = resolve; });
    await page.route('**/src/lib/logo-scene.ts*', async route => { await ready; await route.continue(); });
    await page.goto('/');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    const hero = page.locator('.logo-landing');
    await expect(hero).toHaveAttribute('data-status', 'loading');
    await expect(hero.locator('.logo-landing__fallback')).toHaveCSS('opacity', '0');
    await expect(hero.locator('.mu-morph-wrap')).toBeHidden();
    release();
    await expect(hero).toHaveAttribute('data-status', 'ready');
    await expect.poll(() => page.evaluate(() => window.__logoFrames.length)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.__logoFrames[0].time)).toBe(0);
  });

  test('reduced motion still provides the static logo without creating a WebGL scene', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const hero = page.locator('.logo-landing');
    await expect(hero).toHaveAttribute('data-status', 'still');
    await expect(hero.locator('.logo-landing__fallback')).toBeVisible();
    await expect(hero.locator('.mu-morph-wrap')).toBeVisible();
    await expect(hero.locator('canvas')).toHaveCount(0);
  });
});
