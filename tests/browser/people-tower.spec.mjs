import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { memberProgress, sortTowerMembers, TOWER_INTRO, TOWER_OUTRO } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const ordered = sortTowerMembers(site.team);
test.beforeEach(async ({ page }) => { await page.route('**/api/site', route => route.fulfill({ json: site })); });
async function seek(page, progress) {
  await page.locator('.people-tower').evaluate((element, progress) => {
    const stage = element.querySelector('.people-tower__stage');
    const start = element.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
    window.scrollTo({ top: start + progress * (element.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  }, progress);
}

test('tower ends in two centered directory cards, reverses, and opens both pages', async ({ page }, info) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
  await page.waitForTimeout(300);
  await page.screenshot({ path: info.outputPath('tower-intro.png') });
  const duration = TOWER_INTRO + site.team.length + TOWER_OUTRO;
  await seek(page, (TOWER_INTRO + .24) / duration);
  await page.waitForTimeout(600);
  await page.screenshot({ path: info.outputPath('tower-tumble.png') });
  for (const index of [0, 1, 7, 14, 0]) {
    await seek(page, memberProgress(index, site.team.length));
    await expect(page.locator('.people-tower__world')).toHaveAttribute('data-active-member', String(index));
    await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
    await expect(page.locator('.tower-profile__role')).toHaveText(ordered[index].role);
    await expect.poll(async () => (await page.locator('.tower-profile').boundingBox()).width).toBeGreaterThan(1300);
    if (index === 0) await page.screenshot({ path: info.outputPath('tower-profile.png') });
  }
  await page.getByLabel('Jump to a member').selectOption(String(ordered.findIndex(member => member.id === 'nishanth')));
  await expect(page.locator('.tower-profile__name')).toHaveText('NishanthUday Naik');
  await expect(page.locator('.people-roster__member')).toHaveCount(0);
  await seek(page, memberProgress(site.team.length - 1, site.team.length));
  await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  await expect(page.locator('.people-directory')).toBeHidden();
  const middle = (TOWER_INTRO + site.team.length + TOWER_OUTRO * .375) / duration;
  await seek(page, middle);
  await expect.poll(() => page.locator('.people-directory__cards').evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.45);
  const entering = await page.locator('.people-directory__cards').boundingBox();
  expect(entering.y + entering.height / 2).toBeGreaterThan(600);
  await seek(page, 1);
  await expect(page.locator('.people-directory__cards')).toHaveCSS('opacity', '1');
  await expect(page.locator('.people-directory__card')).toHaveCount(2);
  const centered = await page.locator('.people-directory__cards').boundingBox();
  expect(centered.x + centered.width / 2).toBeCloseTo(720, 0);
  expect(centered.y + centered.height / 2).toBeCloseTo(500, 0);
  expect(await page.locator('.people-directory').evaluate(el => getComputedStyle(el, '::before').backdropFilter)).toBe('blur(30px)');
  await page.screenshot({ path: info.outputPath('directory-desktop.png') });
  await page.mouse.wheel(0, -1800);
  await expect(page.locator('.people-directory')).toBeHidden();
  await expect(page.locator('.site-header')).not.toHaveAttribute('inert');
  await page.getByRole('button', { name: 'Members & Alumni' }).click();
  await expect(page.locator('.people-directory__cards')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('link', { name: 'Members', exact: true })).toBeFocused();
  await page.getByRole('link', { name: 'Members', exact: true }).click();
  await expect(page).toHaveURL(/\/members$/);
  await expect(page.getByRole('heading', { name: 'Members', exact: true })).toBeVisible();
  await expect(page.locator('.people-roster__member')).toHaveCount(15);
  await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
  await expect(page.locator('.site-header')).not.toHaveAttribute('inert');
  await page.locator('.people-directory-page__nav').getByRole('link', { name: 'The people', exact: true }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await page.getByRole('button', { name: 'Members & Alumni' }).click();
  await expect(page.locator('.people-directory__cards')).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: 'Alumni', exact: true }).click();
  await expect(page).toHaveURL(/\/alumni$/);
  await expect(page.getByRole('heading', { name: 'Alumni', exact: true })).toBeVisible();
  await expect(page.getByText('Alumni profiles will be added soon.')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`member cards and canvas fit ${viewport.width}×${viewport.height}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
    await page.waitForTimeout(200);
    await page.screenshot({ path: info.outputPath('mobile-tower.png') });
    await seek(page, memberProgress(3, site.team.length));
    await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
    await page.waitForTimeout(300);
    const profile = await page.locator('.tower-profile').boundingBox();
    expect(profile.x).toBeGreaterThanOrEqual(0);
    expect(profile.x + profile.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(profile.width).toBeGreaterThan(viewport.width * .9);
    const overflowing = await page.locator('.tower-profile__name').evaluate(el => [...el.children].some(child => child.scrollWidth > child.clientWidth + 1));
    expect(overflowing).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    const pixels = await page.locator('.people-tower__world canvas').evaluate(el => el.width * el.height);
    expect(pixels).toBeLessThanOrEqual(2_200_000);
    await page.screenshot({ path: info.outputPath('mobile-profile.png') });
    await seek(page, 1);
    await expect(page.locator('.people-directory__cards')).toHaveCSS('opacity', '1');
    const cards = await page.locator('.people-directory__cards').boundingBox();
    expect(cards.x).toBeGreaterThanOrEqual(0);
    expect(cards.y).toBeGreaterThanOrEqual(0);
    expect(cards.x + cards.width).toBeLessThanOrEqual(viewport.width);
    expect(cards.y + cards.height).toBeLessThanOrEqual(viewport.height);
    expect(cards.y + cards.height / 2).toBeCloseTo(viewport.height / 2, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({ path: info.outputPath('directory-mobile.png') });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'still');
    await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
    await expect(page.locator('.people-roster__member')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Members', exact: true })).toBeInViewport();
    await expect(page.getByRole('link', { name: 'Alumni', exact: true })).toBeInViewport();
    await page.getByRole('link', { name: 'Alumni', exact: true }).click();
    await expect(page).toHaveURL(/\/alumni$/);
  });
}

test('WebGL failure and missing API team data retain both directories without a long scroll region', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.includes('webgl')) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  await expect(page.getByRole('link', { name: 'Members', exact: true })).toBeInViewport();
  await expect(page.getByRole('link', { name: 'Alumni', exact: true })).toBeInViewport();
  await expect(page.locator('.people-tower')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(1000);
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, team: [] } }));
  await page.reload();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  await page.getByRole('link', { name: 'Members', exact: true }).click();
  await expect(page).toHaveURL(/\/members$/);
  await expect(page.locator('.people-roster__member')).toHaveCount(15);
});

test('physics interaction, idle orbit, batching, rebuild and GPU cleanup work together', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /THREE|WebGL|shader/i.test(message.text())) errors.push(message.text()); });
  // Use Three's inspector protocol, keeping test instrumentation out of production.
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer);
      renderer.render = (scene, camera) => { render(scene, camera); window.__towerView = { renderer, scene, camera }; };
      renderer.dispose = () => { dispose(); window.__towerDisposed = { ...renderer.info.memory }; };
    } };
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await expect.poll(() => page.evaluate(() => Boolean(window.__towerView))).toBe(true);
  const metrics = () => page.evaluate(() => {
    const { renderer, scene, camera } = window.__towerView;
    const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
    const matrix = blocks.matrix.clone(); blocks.getMatrixAt(12, matrix);
    const center = blocks.position.clone().setFromMatrixPosition(matrix);
    const face = blocks.position.clone().set(0, 0, .501).applyMatrix4(matrix).project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, frame: renderer.info.render.frame, shadows: renderer.shadowMap.enabled,
      instances: scene.children.filter(object => object.isInstancedMesh).map(object => object.count),
      camera: camera.position.toArray(), position: center.toArray(),
      point: { x: rect.left + (face.x + 1) * rect.width / 2, y: rect.top + (1 - face.y) * rect.height / 2 } };
  });
  await page.waitForTimeout(1600);
  const initial = await metrics();
  expect(initial.instances).toEqual([15, 15]); expect(initial.calls).toBeLessThanOrEqual(8); expect(initial.triangles).toBeLessThan(5500);
  await page.waitForTimeout(600);
  const orbit = await metrics();
  if (orbit.shadows) expect(Math.abs(initial.camera[0] - orbit.camera[0])).toBeGreaterThan(.02);
  else {
    // Slow GPUs deliberately stop decorative orbiting before reducing detail.
    await expect.poll(async () => {
      const before = (await metrics()).frame; await page.waitForTimeout(200);
      return (await metrics()).frame === before;
    }).toBe(true);
  }
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.screenshot({ path: info.outputPath('physics-tower-intro.png') });
  await page.mouse.move(orbit.point.x, orbit.point.y); await page.mouse.down();
  await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  const held = await metrics(); await page.waitForTimeout(200);
  expect((await metrics()).camera).toEqual(held.camera);
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await metrics()).position[0] - initial.position[0])).toBeGreaterThan(2);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: info.outputPath('physics-tower-pulled.png') });
  await page.getByRole('button', { name: 'Rebuild tower', exact: true }).click();
  await expect.poll(async () => Math.abs((await metrics()).position[0])).toBeLessThan(.1);
  const rebuilt = await metrics();
  await page.mouse.move(rebuilt.point.x, rebuilt.point.y); await page.mouse.down();
  await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  await page.mouse.move(rebuilt.point.x + 330, rebuilt.point.y - 40, { steps: 15 });
  await page.waitForTimeout(600); await page.mouse.up();
  await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  await expect.poll(async () => Math.hypot(...(await metrics()).position.map((value, index) => value - rebuilt.position[index]))).toBeGreaterThan(1);
  await seek(page, 1);
  await expect.poll(() => page.locator('.people-tower').evaluate(element => element.style.getPropertyValue('--tower-progress'))).toBe('1');
  await seek(page, 0);
  await expect.poll(() => page.locator('.people-tower').evaluate(element => Number(element.style.getPropertyValue('--tower-progress')))).toBeLessThan(.0001);
  const reversed = await metrics();
  await page.mouse.move(reversed.point.x, reversed.point.y); await page.mouse.down();
  await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  await page.locator('.people-tower__world canvas').dispatchEvent('pointercancel', { pointerId: 1 });
  await page.mouse.up();
  await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  await page.getByRole('button', { name: 'Members & Alumni' }).click();
  await expect(page.locator('.people-directory__cards')).toHaveCSS('opacity', '1');
  await expect.poll(() => page.locator('.people-tower').evaluate(element => element.style.getPropertyValue('--tower-progress'))).toBe('1');
  await page.waitForTimeout(300);
  const pausedFrame = (await metrics()).frame; await page.waitForTimeout(300);
  expect((await metrics()).frame).toBe(pausedFrame);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
  expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
