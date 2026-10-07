import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test('a capable tower keeps its detail, then reduces geometry, lighting and resolution under sustained stalls', async ({ page }, info) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 12 });
    Object.defineProperty(navigator, 'deviceMemory', { value: 8 });
    const nativeRAF = requestAnimationFrame;
    window.requestAnimationFrame = callback => {
      const requested = performance.now();
      const tick = time => {
        if (window.slowTower && time - requested < 110) return nativeRAF(tick);
        callback(time);
      };
      return nativeRAF(tick);
    };
    window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer);
      renderer.render = (scene, camera) => {
        render(scene, camera); window.towerView = { renderer, scene, camera };
        const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
        window.firstTowerMetrics ??= { triangles: renderer.info.render.triangles,
          pixels: renderer.domElement.width * renderer.domElement.height, material: blocks.material.type,
          shadows: renderer.shadowMap.enabled, antialias: renderer.getContext().getContextAttributes().antialias };
      };
      renderer.dispose = () => { dispose(); window.disposedMemory = { ...renderer.info.memory }; };
    } };
  });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  const world = page.locator('.people-tower__world');
  await expect(world).toHaveAttribute('data-quality', '2');
  const metrics = () => page.evaluate(() => {
    const { renderer, scene } = window.towerView;
    const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
    return { triangles: renderer.info.render.triangles, pixels: renderer.domElement.width * renderer.domElement.height,
      material: blocks.material.type, shadows: renderer.shadowMap.enabled, antialias: renderer.getContext().getContextAttributes().antialias };
  });
  await expect.poll(() => page.evaluate(() => Boolean(window.towerView))).toBe(true);
  // Capture the actual first frame: a software GPU can already have triggered
  // adaptation by the time a later Playwright round trip reads the live state.
  const high = await page.evaluate(() => window.firstTowerMetrics);
  expect(high.shadows).toBe(true);
  expect(high.antialias).toBe(true);
  expect(high.material).toBe('MeshStandardMaterial');
  await page.screenshot({ path: info.outputPath('tower-after-startup.png') });
  const point = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { renderer, scene, camera } = window.towerView;
    const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
    const matrix = new THREE.Matrix4(); blocks.getMatrixAt(12, matrix);
    const point = new THREE.Vector3(0, 0, .501).applyMatrix4(matrix).project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return { x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 };
  });
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await expect(world).toHaveAttribute('data-dragging', 'true');
  await page.evaluate(() => { window.slowTower = true; });
  await expect(world).toHaveAttribute('data-quality', '0', { timeout: 15000 });
  await expect.poll(async () => (await metrics()).pixels).toBeLessThan(high.pixels * .5);
  const low = await metrics();
  expect(low.triangles).toBeLessThan(high.triangles * .15);
  expect(low.material).toBe('MeshLambertMaterial');
  expect(low.shadows).toBe(false);
  await expect(world).toHaveAttribute('data-dragging', 'true');
  await page.evaluate(() => { window.slowTower = false; });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Rebuild tower' }).click();
  await page.getByLabel('Jump to a member').selectOption('1');
  await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: info.outputPath('low-detail-profile.png') });
  await page.getByRole('button', { name: 'Back to Quick view' }).click();
  expect(await page.evaluate(() => window.disposedMemory)).toEqual({ geometries: 0, textures: 0 });
});

test('an extreme phone uses a small pooled ripple without DOM churn during bursts', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });
      Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
    });
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('/');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    const ripple = page.locator('.background-ripple-effect');
    const result = await ripple.evaluate(async root => {
      const canvas = root.querySelector('canvas');
      let peak = 0, added = 0;
      const observer = new MutationObserver(records => records.forEach(record => { added += record.addedNodes.length; }));
      observer.observe(root, { subtree: true, childList: true });
      for (let i = 0; i < 12; i++) {
        root.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100 + i % 3 * 56, clientY: 250 }));
        peak = Math.max(peak, Number(root.dataset.activeWaves));
        await new Promise(resolve => setTimeout(resolve, 130));
      }
      observer.disconnect();
      return { pixels: canvas.width * canvas.height, peak, added, sameCanvas: canvas === root.querySelector('canvas') };
    });
    expect(result.pixels).toBeLessThan(200_000);
    expect(result).toMatchObject({ peak: 1, added: 0, sameCanvas: true });
    await expect(ripple).toHaveAttribute('data-active-waves', '0');
  } finally { await context.close(); }
});
