import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { memberProgress, TOWER_INTRO, TOWER_OUTRO } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const duration = TOWER_INTRO + site.team.length + TOWER_OUTRO;
test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer);
      renderer.render = (scene, camera) => { render(scene, camera); window.__towerView = { renderer, scene, camera }; };
      renderer.dispose = () => { dispose(); window.__towerDisposed = { ...renderer.info.memory }; };
    } };
  });
});

async function seek(page, progress) {
  await page.locator('.people-tower').evaluate((element, progress) => {
    const stage = element.querySelector('.people-tower__stage');
    const scroller = matchMedia('(max-width: 768px), (pointer: coarse)').matches ? element.closest('.site-shell') : window;
    const current = scroller === window ? scrollY : scroller.scrollTop;
    const start = element.getBoundingClientRect().top + current - (parseFloat(getComputedStyle(stage).top) || 0);
    const range = element.offsetHeight - stage.offsetHeight;
    scroller.scrollTo({ top: start + progress * range, behavior: 'instant' });
  }, progress);
  // ResizeObserver can settle after a viewport change. Compare against the live
  // layout and actual scroll position, rather than an earlier rounded range.
  await expect.poll(() => page.locator('.people-tower').evaluate(element => {
    const stage = element.querySelector('.people-tower__stage');
    const scroller = matchMedia('(max-width: 768px), (pointer: coarse)').matches ? element.closest('.site-shell') : window;
    const current = scroller === window ? scrollY : scroller.scrollTop;
    const start = element.getBoundingClientRect().top + current - (parseFloat(getComputedStyle(stage).top) || 0);
    const range = element.offsetHeight - stage.offsetHeight;
    return Math.abs(Number(element.style.getPropertyValue('--tower-progress')) * range - (current - start));
  })).toBeLessThan(.05);
}

test('rendered blocks and DOM profiles reach zero together, including reverse seeks', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await seek(page, memberProgress(0, site.team.length));
  await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  const held = await page.locator('.tower-profile').boundingBox();
  expect(held.width).toBeGreaterThan(1300);
  const size = () => page.evaluate(() => {
    const blocks = window.__towerView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
    const matrix = blocks.matrix.clone(); blocks.getMatrixAt(0, matrix);
    return Math.hypot(...matrix.elements.slice(0, 3));
  });
  const fullSize = await size();
  let previous = fullSize;
  for (const local of [.82, .88, .94, .975]) {
    await seek(page, (TOWER_INTRO + local) / duration);
    const current = await size();
    expect(current).toBeLessThan(previous); expect(current).toBeGreaterThan(0);
    const opacity = await page.locator('.tower-profile').evaluate(element => Number(element.style.opacity));
    expect(opacity).toBeCloseTo(current / fullSize, 4);
    previous = current;
  }
  for (const local of [.99, 1.01, .99]) {
    await seek(page, (TOWER_INTRO + local) / duration);
    expect(await size()).toBe(0);
    await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '0');
  }
  await seek(page, (TOWER_INTRO + .9) / duration);
  expect(await size()).toBeGreaterThan(0);
  await expect(page.locator('.tower-profile')).toBeVisible();
  await page.screenshot({ path: info.outputPath('tower-exit.png') });
  await seek(page, memberProgress(0, site.team.length));
  await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
});

test.describe('low-end touch devices', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test('cap resolution, sleep while idle, resize and release GPU resources on context loss', async ({ page }, info) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
    });
    await page.goto('/team');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
    await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
    const metrics = () => page.evaluate(() => {
      const { renderer, scene } = window.__towerView;
      const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
      return { ratio: renderer.getPixelRatio(), pixels: renderer.domElement.width * renderer.domElement.height,
        shadows: renderer.shadowMap.enabled, bump: Boolean(blocks.material.bumpMap), frame: renderer.info.render.frame };
    });
    await expect.poll(() => page.evaluate(() => Boolean(window.__towerView))).toBe(true);
    const initial = await metrics();
    expect(initial.ratio).toBeGreaterThanOrEqual(.5);
    expect(initial.ratio).toBeLessThanOrEqual(1); expect(initial.pixels).toBeLessThanOrEqual(450_000);
    expect(initial.shadows).toBe(false); expect(initial.bump).toBe(false);
    await page.screenshot({ path: info.outputPath('extreme-phone-tower.png') });
    await expect.poll(async () => {
      const before = (await metrics()).frame; await page.waitForTimeout(200);
      return (await metrics()).frame === before;
    }, { timeout: 10_000 }).toBe(true);
    await seek(page, memberProgress(2, site.team.length));
    await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
    expect((await metrics()).frame).toBeGreaterThan(initial.frame);
    await page.setViewportSize({ width: 844, height: 390 });
    await seek(page, memberProgress(2, site.team.length));
    expect((await metrics()).pixels).toBeLessThanOrEqual(450_000);
    expect((await metrics()).shadows).toBe(false);
    for (let i = 0; i < 2; i++) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
      expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
      await expect(page.locator('.people-tower__labels')).toHaveCount(1);
    }
    await page.locator('.people-tower__world canvas').dispatchEvent('webglcontextlost');
    await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
    await expect(page.locator('.people-tower__world canvas, .people-tower__labels')).toHaveCount(0);
    expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
    expect(errors).toEqual([]);
  });
});

test('a failure partway through mounting removes the scene and releases its resources', async ({ page }) => {
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.evaluate(() => {
    const dispatch = window.__THREE_DEVTOOLS__.dispatchEvent;
    window.__THREE_DEVTOOLS__.dispatchEvent = event => {
      dispatch(event);
      if (event.detail?.isWebGLRenderer) event.detail.compileAsync = async () => { throw new Error('Simulated compilation failure'); };
    };
  });
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  await expect(page.locator('.people-tower__world canvas, .people-tower__labels')).toHaveCount(0);
  expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  await page.getByRole('button', { name: 'Back to Quick view' }).click();
  await expect(page.getByLabel('Find a team member').locator('option')).toHaveCount(site.team.length);
});
