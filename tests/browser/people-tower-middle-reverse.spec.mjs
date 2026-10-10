import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { TOWER_INTRO, TOWER_OUTRO, sortTowerMembers, towerSlots } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const members = sortTowerMembers(site.team.filter(member => member.status !== 'alumni'));
const slots = towerSlots(members.map(member => member.id));
const duration = TOWER_INTRO + members.length + TOWER_OUTRO;
const memberTime = (index, local = .6) => (TOWER_INTRO + index + local) / duration;

async function seek(page, progress, settle = true) {
  const actual = await page.locator('.people-tower').evaluate((section, progress) => {
    const stage = section.querySelector('.people-tower__stage');
    if (matchMedia('(max-width: 760px), (pointer: coarse)').matches) {
      const current = Number(section.style.getPropertyValue('--tower-progress'));
      const count = section.querySelector('select').options.length - 1;
      const range = section.querySelector('.people-tower__world').clientHeight * (count * .55 + .2);
      stage.dispatchEvent(new WheelEvent('wheel', {
        deltaY: progress === 0 ? -range * 2 : (progress - current) * range, bubbles: true, cancelable: true,
      }));
      return progress;
    }
    const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
    const range = section.offsetHeight - stage.offsetHeight;
    scrollTo({ top: start + progress * range, behavior: 'instant' });
    return Math.max(0, Math.min(1, (scrollY - start) / range));
  }, progress);
  if (settle) await expect.poll(() => page.locator('.people-tower').evaluate(section =>
    Number(section.style.getPropertyValue('--tower-progress')))).toBeCloseTo(actual, 5);
}

async function expectStack(page, firstVisible) {
  const expected = slots.map((slot, index) => index < firstVisible ? null : slot.position.map(Math.fround));
  await expect.poll(() => page.evaluate(() => window.__middleReverseFrames.at(-1)?.blocks.map(block =>
    block.scale[0] < .01 ? null : block.position)), { message: 'every returned plank lands in its original slot' }).toEqual(expected);
}

async function expectForwardStack(page) {
  await expect.poll(() => page.evaluate(slots => {
    const frame = window.__middleReverseFrames.at(-1);
    return frame?.blocks.every((block, index) => index === frame.active || (index < frame.active
      ? block.scale[0] < .01
      : block.scale[0] > .01 && block.position.every((value, axis) => value === Math.fround(slots[index].position[axis]))));
  }, slots), { message: 'resuming forward leaves no other plank stranded between its return and its slot' }).toBe(true);
}

for (const mobile of [false, true]) {
  test.describe(mobile ? 'touch viewport' : 'desktop viewport', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
      isMobile: mobile, hasTouch: mobile });

    test('middle reversals fold each banner into its own plank and survive direction changes', async ({ page }, info) => {
      test.setTimeout(120_000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/site', route => route.fulfill({ json: site }));
      await page.addInitScript(() => {
        window.__middleReverseFrames = [];
        window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
          if (!renderer?.isWebGLRenderer) return;
          const render = renderer.render.bind(renderer);
          renderer.render = (scene, camera) => {
            const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
            const section = document.querySelector('.people-tower');
            if (blocks && section) {
              const frames = window.__middleReverseFrames;
              frames.push({ progress: Number(section.style.getPropertyValue('--tower-progress')),
                active: Number(renderer.domElement.parentElement.dataset.activeMember),
                blocks: Array.from({ length: blocks.count }, (_, index) => {
                  const m = blocks.instanceMatrix.array.subarray(index * 16, index * 16 + 16);
                  return { position: [...m.slice(12, 15)], scale: [0, 4, 8].map(i => Math.hypot(m[i], m[i + 1], m[i + 2])) };
                }) });
              if (frames.length > 1000) frames.shift();
            }
            return render(scene, camera);
          };
        } };
      });
      await page.goto('/team');
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 30_000 });
      await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
      await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready', { timeout: 30_000 });

      // Every banner owns one plank in both directions; reversing must not
      // restore its neighbours early or leave a second copy in the tower.
      for (const index of [7, 4, 1, 13]) {
        await page.getByRole('button', { name: 'Rebuild tower', exact: true }).click();
        await seek(page, memberTime(index, .2));
        const forwardFlight = await page.evaluate(index => window.__middleReverseFrames.at(-1).blocks[index], index);
        await seek(page, memberTime(index));
        await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
        if (index === 7) await page.screenshot({ path: info.outputPath('middle-forward.png') });
        await seek(page, memberTime(index, .45));
        if (index === 7) await page.screenshot({ path: info.outputPath('middle-reverse.png') });
        await expectStack(page, index + 1);
        await expect(page.locator('.tower-profile__role')).toHaveText(members[index].role);
        await seek(page, memberTime(index, .2));
        await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '0');
        await expectForwardStack(page);
        const flying = await page.evaluate(index => window.__middleReverseFrames.at(-1).blocks[index], index);
        expect(flying.scale[0]).toBeGreaterThan(.01);
        expect(Math.hypot(...flying.position.map((value, axis) => value - slots[index].position[axis]))).toBeGreaterThan(.3);
        expect(Math.hypot(...flying.position.map((value, axis) => value - forwardFlight.position[axis]))).toBeLessThan(.01);
        if (index === 7) await page.screenshot({ path: info.outputPath('middle-folded-return.png') });
        await seek(page, memberTime(index, .005));
        const landing = await page.evaluate(index => window.__middleReverseFrames.at(-1).blocks[index], index);
        expect(Math.hypot(...landing.position.map((value, axis) => value - slots[index].position[axis]))).toBeLessThan(.01);

        // Cross a member boundary, then reverse all the way to the beginning.
        await seek(page, memberTime(index - 1));
        await expectStack(page, index);
        await seek(page, 0);
        await expectStack(page, 0);
      }

      // Interrupt the pull, flight, unfolding, hold and exit in both directions.
      // Reversing forward during the 350ms return must not freeze a plank aloft.
      for (const local of [.07, .20, .36, .60, .90]) {
        await page.getByRole('button', { name: 'Rebuild tower', exact: true }).click();
        await seek(page, memberTime(7, local));
        await seek(page, memberTime(7, local - .04), false);
        await page.waitForTimeout(80);
        await page.mouse.move(mobile ? 195 : 640, mobile ? 450 : 500);
        await page.mouse.wheel(0, 60);
        await page.waitForTimeout(500);
        await expectForwardStack(page);
        await seek(page, 0);
        await expectStack(page, 0);
      }

      await page.screenshot({ path: info.outputPath('middle-restored.png') });
      await info.attach('middle-reverse-frames', {
        body: JSON.stringify(await page.evaluate(() => window.__middleReverseFrames)), contentType: 'application/json',
      });
      expect(errors).toEqual([]);
    });
  });
}
