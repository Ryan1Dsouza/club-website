import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { BLOCK_SIZE, TOWER_INTRO, TOWER_OUTRO, towerSlots } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const members = site.team.filter(member => member.status !== 'alumni');
const duration = TOWER_INTRO + members.length + TOWER_OUTRO;
const distance = (a, b) => Math.hypot(...a.map((value, axis) => value - b[axis]));

async function seek(page, progress) {
  const actual = await page.locator('.people-tower').evaluate((section, progress) => {
    const stage = section.querySelector('.people-tower__stage');
    if (matchMedia('(max-width: 760px), (pointer: coarse)').matches) {
      const current = Number(section.style.getPropertyValue('--tower-progress'));
      const count = section.querySelector('select').options.length - 1;
      const range = section.querySelector('.people-tower__world').clientHeight * (count * .55 + .2);
      // A rewind can interrupt a still-settling member jump. Scroll past the
      // start so it clamps to zero regardless of that outstanding destination.
      const deltaY = progress === 0 ? -range * 2 : (progress - current) * range;
      stage.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true }));
      return progress;
    }
    const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
    const range = section.offsetHeight - stage.offsetHeight;
    scrollTo({ top: start + progress * range, behavior: 'instant' });
    return Math.max(0, (scrollY - start) / range);
  }, progress);
  await expect.poll(() => page.locator('.people-tower').evaluate(section => Number(section.style.getPropertyValue('--tower-progress')))).toBeCloseTo(actual, 5);
  return actual;
}

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  test(`reverse scroll returns each banner's own plank and shows readable roles at ${viewport.width}px`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.addInitScript(() => {
      window.__reverseAudit = [];
      window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
        if (!renderer?.isWebGLRenderer) return;
        const render = renderer.render.bind(renderer);
        renderer.render = (scene, camera) => {
          const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
          const section = document.querySelector('.people-tower');
          if (blocks && section) {
            window.__reverseAudit.push({
              progress: Number(section.style.getPropertyValue('--tower-progress')),
              active: Number(renderer.domElement.parentElement.dataset.activeMember),
              cameraPosition: camera.position.toArray(), aspect: camera.aspect,
              cameraBasis: [0, 1, 2, 4, 5, 6, 8, 9, 10].map(i => camera.matrixWorld.elements[i]),
              blocks: Array.from({ length: blocks.count }, (_, index) => {
                const m = blocks.instanceMatrix.array.subarray(index * 16, index * 16 + 16);
                const scale = [0, 4, 8].map(i => Math.hypot(m[i], m[i + 1], m[i + 2]));
                return { position: [...m.slice(12, 15)], scale,
                  basis: [0, 1, 2, 4, 5, 6, 8, 9, 10].map((i, j) => m[i] / scale[Math.floor(j / 3)]) };
              }),
            });
          }
          return render(scene, camera);
        };
      } };
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/team');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 30_000 });
    await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
    await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready', { timeout: 15_000 });
    const longest = members.reduce((a, b) => a.role.length > b.role.length ? a : b);
    await page.getByLabel('Jump to a member').selectOption({ label: longest.name });
    await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
    await expect(page.locator('.tower-profile__role')).toHaveText(longest.role);
    await expect(page.locator('.tower-profile__role')).toHaveCSS('font-size', viewport.width > 760 ? '16px' : '14px');
    const role = await page.locator('.tower-profile__role').boundingBox(), banner = await page.locator('.tower-profile').boundingBox();
    expect(role.x).toBeGreaterThanOrEqual(banner.x);
    expect(role.x + role.width).toBeLessThanOrEqual(banner.x + banner.width);
    await page.screenshot({ path: info.outputPath('profile-role.png') });
    // Each banner borrows just its own plank. Only the members already passed
    // in reverse have landed, including all three distinct pieces of a layer.
    await seek(page, 1);
    const slots = towerSlots(members.map(member => member.id));
    async function expectReturnedAfter(active) {
      await expect.poll(async () => {
        const frame = await page.evaluate(() => window.__reverseAudit.at(-1));
        return frame.blocks.every((block, index) => index > active
          ? block.scale[0] > .01 && distance(block.position, slots[index].position) < .001
          : block.scale[0] < .01);
      }).toBe(true);
    }
    for (const index of [members.length - 1, members.length - 2, members.length - 3]) {
      await seek(page, (TOWER_INTRO + index + .6) / duration);
      await expectReturnedAfter(index);
      await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
    }
    await page.screenshot({ path: info.outputPath('foundation-layer.png') });
    for (let index = members.length - 4; index >= 0; index--) {
      await seek(page, (TOWER_INTRO + index + .6) / duration);
      await expectReturnedAfter(index);
    }
    // A fast rewind still lands every skipped member in its exact slot.
    await seek(page, 1);
    await page.evaluate(() => { window.__reverseAudit.length = 0; });
    await seek(page, 0);
    await expect.poll(() => page.evaluate(() => window.__reverseAudit.at(-1).blocks.map(block => block.position)))
      .toEqual(slots.map(slot => slot.position.map(Math.fround)));
    const frames = await page.evaluate(() => window.__reverseAudit);
    for (const frame of frames) {
      frame.blocks.forEach((block, index) => {
        if (block.scale[0] < .01) return;
        expect(block.position.every(Number.isFinite)).toBe(true);
        expect(block.scale.every(Number.isFinite)).toBe(true);
      });
    }
    expect(errors).toEqual([]);
    await page.screenshot({ path: info.outputPath('returned-tower.png') });
    await info.attach('reverse-frames', { body: JSON.stringify(frames), contentType: 'application/json' });
  });
}
