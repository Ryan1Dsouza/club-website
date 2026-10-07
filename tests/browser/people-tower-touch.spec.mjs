import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { TOWER_INTRO, TOWER_OUTRO, memberProgress } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => { render(scene, camera); window.__towerTouchView = { renderer, scene, camera }; };
    } };
  });
});

async function openTower(page) {
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  await expect.poll(() => page.evaluate(() => Boolean(window.__towerTouchView))).toBe(true);
}

async function blockPoint(page, index = 12) {
  return page.evaluate(async index => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { renderer, scene, camera } = window.__towerTouchView;
    const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
    const matrix = new THREE.Matrix4(); blocks.getMatrixAt(index, matrix);
    const face = new THREE.Vector3(0, 0, .501).applyMatrix4(matrix).project(camera);
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(face.x, face.y), camera);
    const hit = ray.intersectObject(blocks)[0];
    if (!hit) throw new Error('The test block must be visible from the initial camera');
    blocks.getMatrixAt(hit.instanceId, matrix);
    const rect = renderer.domElement.getBoundingClientRect();
    return { index: hit.instanceId, position: matrix.elements.slice(12, 15),
      x: rect.left + (face.x + 1) * rect.width / 2, y: rect.top + (1 - face.y) * rect.height / 2 };
  }, index);
}

async function displacement(page, block) {
  return page.evaluate(({ index, position }) => {
    const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
    const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
    return Math.hypot(...matrix.elements.slice(12, 15).map((value, axis) => value - position[axis]));
  }, block);
}

for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test.describe(`touch tower at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

    test('taps pull, sideways drags play, and vertical swipes animate without scrolling the page', async ({ page }, info) => {
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await openTower(page);
      const world = page.locator('.people-tower__world');
      await expect(world.locator('canvas')).toHaveCSS('pointer-events', 'auto');
      await expect(page.getByText('Swipe up to meet the team.', { exact: false })).toBeVisible();
      await expect(page.locator('.people-tower__hint-mouse')).toBeHidden();
      const cdp = await page.context().newCDPSession(page);
      const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', {
        type, touchPoints: point ? [{ x: point.x, y: point.y }] : [],
      });
      const rebuild = async () => {
        await page.getByRole('button', { name: 'Rebuild tower' }).tap();
        await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
      };
      const initial = await blockPoint(page);
      await touch('touchStart', initial);
      await expect(world).toHaveAttribute('data-dragging', 'true');
      await touch('touchEnd');
      await expect(world).not.toHaveAttribute('data-dragging');
      await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await rebuild();

      const dragged = await blockPoint(page);
      await touch('touchStart', dragged);
      for (let step = 1; step <= 10; step++) {
        await touch('touchMove', { x: dragged.x + step * 10, y: dragged.y });
        await page.evaluate(() => new Promise(requestAnimationFrame));
      }
      await expect(world).toHaveAttribute('data-dragging', 'true');
      await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: info.outputPath('touch-drag.png') });
      await touch('touchEnd');
      await expect(world).not.toHaveAttribute('data-dragging');
      await rebuild();

      await touch('touchStart', await blockPoint(page));
      await expect(world).toHaveAttribute('data-dragging', 'true');
      await touch('touchCancel');
      await expect(world).not.toHaveAttribute('data-dragging');
      await rebuild();

      const swiped = await blockPoint(page);
      await touch('touchStart', swiped);
      for (let step = 1; step <= 10; step++) {
        await touch('touchMove', { x: swiped.x, y: swiped.y - step * 15 });
        await page.evaluate(() => new Promise(requestAnimationFrame));
      }
      await touch('touchEnd');
      await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeGreaterThan(.01);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await expect(world).not.toHaveAttribute('data-dragging');
      expect(errors).toEqual([]);
      await cdp.detach();
    });

    test('play mode accepts vertical touch throws and returns to the fixed exploration timeline', async ({ page }, info) => {
      await openTower(page);
      await page.evaluate(() => {
        window.__modeEvents = [];
        for (const type of ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend']) document.addEventListener(type, event => {
          window.__modeEvents.push({ type, target: event.target.className, text: event.target.textContent?.slice(0, 35), time: performance.now() });
        }, true);
      });
      const world = page.locator('.people-tower__world');
      await page.getByRole('button', { name: 'Drag & throw' }).tap();
      await expect(world.locator('canvas')).toHaveCSS('touch-action', 'none');
      const block = await blockPoint(page);
      const cdp = await page.context().newCDPSession(page);
      const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] });
      await touch('touchStart', block);
      for (let step = 1; step <= 8; step++) {
        await touch('touchMove', { x: block.x + step * 3, y: block.y - step * 8 });
        await page.evaluate(() => new Promise(requestAnimationFrame));
      }
      await expect(world).toHaveAttribute('data-dragging', 'true');
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await touch('touchEnd');
      await expect(world).not.toHaveAttribute('data-dragging');
      await expect.poll(() => displacement(page, block)).toBeGreaterThan(.5);
      await page.screenshot({ path: info.outputPath('throw.png') });
      await page.getByRole('button', { name: 'Scroll to explore' }).tap();
      await info.attach('touch-events', { body: JSON.stringify(await page.evaluate(() => window.__modeEvents)), contentType: 'application/json' });
      await expect(world.locator('canvas')).toHaveCSS('touch-action', 'none');
      await page.getByRole('button', { name: 'Rebuild tower' }).tap();
      await touch('touchStart', { x: viewport.width / 2, y: viewport.height * .65 });
      for (let step = 1; step <= 10; step++) await touch('touchMove', { x: viewport.width / 2, y: viewport.height * .65 - step * 12 });
      await touch('touchEnd');
      await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeGreaterThan(.01);
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await cdp.detach();
    });

    test('scrolling reveals a flung block from its visible position and tilt', async ({ page }, info) => {
      await openTower(page);
      const flung = await blockPoint(page, 0);
      await page.touchscreen.tap(flung.x, flung.y);
      await expect.poll(() => displacement(page, flung)).toBeGreaterThan(2);
      // Compare actual rendered instance matrices across the exact handoff frame.
      await page.evaluate(index => {
        const { renderer } = window.__towerTouchView, render = renderer.render.bind(renderer);
        window.__handoff = { before: null, first: null };
        renderer.render = (scene, camera) => {
          const audit = window.__handoff;
          if (!audit.first) {
            const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
            const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
            if (Number(renderer.domElement.parentElement.dataset.activeMember) === index) audit.first = matrix.toArray();
            else audit.before = matrix.toArray();
          }
          render(scene, camera);
        };
      }, flung.index);
      await page.evaluate(() => new Promise(requestAnimationFrame));
      const seekStart = () => page.locator('.people-tower').evaluate((section, { progress, count }) => {
        const stage = section.querySelector('.people-tower__stage');
        const current = Number(section.style.getPropertyValue('--tower-progress'));
        stage.dispatchEvent(new WheelEvent('wheel', { deltaY: (progress - current) * stage.clientHeight * (count * .55 + .2), bubbles: true, cancelable: true }));
      }, { progress: (TOWER_INTRO + flung.index + .003) / (TOWER_INTRO + site.team.length + TOWER_OUTRO), count: site.team.length });
      await seekStart();
      await expect.poll(() => page.evaluate(() => window.__handoff.first)).not.toBeNull();
      const handoff = await page.evaluate(() => window.__handoff);
      expect(handoff.before).not.toBeNull();
      expect(Math.hypot(...handoff.before.slice(12, 15).map((value, axis) => value - flung.position[axis]))).toBeGreaterThan(2);
      expect(Math.max(...handoff.first.map((value, axis) => Math.abs(value - handoff.before[axis])))).toBeLessThan(.05);
      await info.attach('visible-handoff', { body: JSON.stringify(handoff), contentType: 'application/json' });
      await page.screenshot({ path: info.outputPath('flung-reveal-start.png') });

      await page.getByLabel('Jump to a member').selectOption(String(flung.index));
      await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
      await page.screenshot({ path: info.outputPath('flung-reveal-profile.png') });
      // Cross a member boundary before reversing: a queued tower return must
      // not replace the source of this member's already established flight.
      await page.getByLabel('Jump to a member').selectOption(String(flung.index + 1));
      await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
      await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress'))))
        .toBeCloseTo(memberProgress(flung.index + 1, site.team.length), 6);
      await seekStart();
      await expect.poll(() => page.evaluate(({ index, before }) => {
        const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
        const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
        return Math.max(...matrix.elements.map((value, axis) => Math.abs(value - before[axis])));
      }, { index: flung.index, before: handoff.before })).toBeLessThan(.05);
    });

    test('the viewport stays fixed at both timeline ends, survives rotation, and unlocks on exit', async ({ page }) => {
      await openTower(page);
      const timeline = () => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')));
      const coverage = async () => {
        const bounds = await page.locator('.people-tower__stage').evaluate(el => ({ top: el.getBoundingClientRect().top,
          width: el.clientWidth, height: el.clientHeight, viewportWidth: innerWidth, viewportHeight: innerHeight,
          pageWidth: document.documentElement.scrollWidth, scroll: scrollY }));
        expect(bounds).toEqual({ top: 0, width: bounds.viewportWidth, height: bounds.viewportHeight,
          viewportWidth: bounds.viewportWidth, viewportHeight: bounds.viewportHeight, pageWidth: bounds.viewportWidth, scroll: 0 });
      };
      await coverage();
      await page.getByLabel('Jump to a member').selectOption('1');
      await expect.poll(timeline).toBeCloseTo(memberProgress(1, site.team.length), 6);
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      await page.mouse.wheel(0, 300);
      await expect.poll(timeline).toBeGreaterThan(memberProgress(1, site.team.length) + .01);
      await coverage();
      await page.mouse.wheel(0, -300);
      await expect.poll(timeline).toBeCloseTo(memberProgress(1, site.team.length), 6);
      await page.locator('#main-content').focus();
      await page.keyboard.press('End');
      await expect.poll(timeline).toBe(1);
      await page.mouse.wheel(0, 2000);
      await coverage();
      expect(await timeline()).toBe(1);
      await page.keyboard.press('Home');
      await expect.poll(timeline).toBe(0);
      await page.mouse.wheel(0, -2000);
      await coverage();
      expect(await timeline()).toBe(0);

      await page.getByLabel('Jump to a member').selectOption('3');
      await expect.poll(timeline).toBeCloseTo(memberProgress(3, site.team.length), 6);
      await page.setViewportSize({ width: viewport.height, height: viewport.width });
      await coverage();
      await expect.poll(timeline).toBeCloseTo(memberProgress(3, site.team.length), 6);
      await expect.poll(() => page.locator('.tower-profile').evaluate(profile => {
        const box = profile.getBoundingClientRect(), hud = document.querySelector('.people-tower__hud').getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth && box.top >= 70 && box.bottom < hud.top;
      })).toBe(true);
      await page.getByRole('button', { name: 'Rebuild tower' }).tap();
      await expect.poll(timeline).toBe(0);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'still');
      await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
      await page.getByRole('button', { name: 'Back to the team', exact: true }).tap();
      await expect(page.locator('html')).not.toHaveClass(/people-tower-open|people-tower-playing/);
      await expect(page.locator('body')).toHaveCSS('position', 'static');
      await page.mouse.wheel(0, 500);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    });
  });
}

test('desktop retains click-to-pull and drag controls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openTower(page);
  await expect(page.locator('.people-tower__hint-mouse')).toBeVisible();
  await expect(page.locator('.people-tower__hint-touch')).toBeHidden();
  const initial = await blockPoint(page);
  await page.mouse.click(initial.x, initial.y);
  await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Rebuild tower' }).click();
  await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  const dragged = await blockPoint(page);
  await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  await page.mouse.move(dragged.x + 160, dragged.y - 30, { steps: 10 });
  await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  await page.mouse.up();
  await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
});
