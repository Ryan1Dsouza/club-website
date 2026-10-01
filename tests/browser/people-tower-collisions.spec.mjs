import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { memberProgress } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

for (const mobile of [false, true]) {
  test.describe(mobile ? 'touch tower' : 'desktop tower', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 1 });

    test('scroll poses collide, reverse cleanly and settle without continuous work', async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.route('**/api/site', route => route.fulfill({ json: site }));
      await page.addInitScript(mobile => {
        if (mobile) {
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
        }
        window.__towerAudit = { violations: [], frames: 0, active: [], draws: 0, renderMs: [], frameMs: [] };
        let lastFrame = 0;
        window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
          const renderer = event.detail;
          if (!renderer?.isWebGLRenderer) return;
          const render = renderer.render.bind(renderer);
          renderer.render = (scene, camera) => {
            const audit = window.__towerAudit, now = performance.now();
            if (audit.measuring) {
              if (lastFrame) audit.frameMs.push(now - lastFrame);
              lastFrame = now;
            } else lastFrame = 0;
            if (!audit.gpu) {
              const gl = renderer.getContext(), extension = gl.getExtension('WEBGL_debug_renderer_info');
              audit.gpu = extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable';
            }
            const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
            const active = Number(renderer.domElement.parentElement.dataset.activeMember);
            if (blocks && active >= 0) {
              const bounds = [];
              for (let i = 0; i < blocks.count; i++) {
                const e = blocks.instanceMatrix.array.subarray(i * 16, i * 16 + 16);
                const half = [0, 1, 2].map(axis => (Math.abs(e[axis]) + Math.abs(e[axis + 4]) + Math.abs(e[axis + 8])) / 2);
                bounds.push({ min: half.map((h, axis) => e[12 + axis] - h), max: half.map((h, axis) => e[12 + axis] + h), visible: half.some(h => h > .00001) });
              }
              const a = bounds[active], floor = scene.getObjectByName('timber-tabletop').position.y;
              if (a?.visible) {
                if (!audit.active.includes(active)) audit.active.push(active);
                if (a.min[1] < floor - .003) audit.violations.push({ active, floor: a.min[1] - floor });
                const aboveBoard = a.min[0] < 2.75 && a.max[0] > -2.75 && a.min[2] < 2.75 && a.max[2] > -2.75;
                if (aboveBoard && a.min[1] < floor + .28 - .003) audit.violations.push({ active, board: a.min[1] - floor - .28 });
                bounds.forEach((b, index) => {
                  if (index === active || !b.visible) return;
                  const depth = Math.min(...[0, 1, 2].map(axis => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis])));
                  if (depth > .003) audit.violations.push({ active, other: index, depth });
                });
              }
            }
            const start = performance.now(); render(scene, camera);
            audit.renderMs.push(performance.now() - start); audit.frames++;
            audit.draws = Math.max(audit.draws, renderer.info.render.calls);
          };
        } };
      }, mobile);
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto('/team');
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15_000 });
      await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
      await expect(page.locator('html')).not.toHaveClass(/lenis/);

      // Real wheel/touch input must scroll without dragging the stack or being cancelled.
      if (mobile) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 670 }] });
        for (let y = 650; y >= 270; y -= 20) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
          await page.evaluate(() => new Promise(requestAnimationFrame));
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      } else {
        await page.mouse.move(700, 500); await page.mouse.wheel(0, 400);
      }
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
      await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');

      // Sample every rendered pose along continuous forward/backward scrolling,
      // then stress skipped members and reversals using abrupt destination changes.
      await page.evaluate(async () => {
        const section = document.querySelector('.people-tower'), stage = section.querySelector('.people-tower__stage');
        const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
        const range = section.offsetHeight - stage.offsetHeight;
        window.__towerAudit.measuring = true;
        for (const [from, to] of [[0, 1], [1, 0]]) {
          const began = performance.now();
          await new Promise(resolve => {
            function tick(now) {
              const t = Math.min(1, (now - began) / 6500);
              scrollTo({ top: start + (from + (to - from) * t) * range, behavior: 'instant' });
              if (t < 1) requestAnimationFrame(tick); else resolve();
            }
            requestAnimationFrame(tick);
          });
        }
        window.__towerAudit.measuring = false;
        for (const progress of [.9, .15, .65, .01, .98, .35]) {
          scrollTo({ top: start + progress * range, behavior: 'instant' });
          await new Promise(resolve => setTimeout(resolve, 130));
        }
      });
      const destination = memberProgress(0, site.team.length);
      await page.locator('.people-tower').evaluate((section, progress) => {
        const stage = section.querySelector('.people-tower__stage');
        const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
        scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
      }, destination);
      await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
      await expect.poll(() => page.locator('.people-tower').evaluate(section => {
        const stage = section.querySelector('.people-tower__stage');
        const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
        return Math.abs(Number(section.style.getPropertyValue('--tower-progress')) - (scrollY - start) / (section.offsetHeight - stage.offsetHeight));
      })).toBeLessThan(.000001);
      await expect.poll(async () => {
        const before = await page.evaluate(() => window.__towerAudit.frames);
        await page.waitForTimeout(250);
        return await page.evaluate(() => window.__towerAudit.frames) === before;
      }).toBe(true);
      const metrics = await page.evaluate(() => {
        const audit = window.__towerAudit;
        const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * p)];
        return { violations: audit.violations.slice(0, 10), frames: audit.frames, members: audit.active.length, draws: audit.draws, gpu: audit.gpu,
          renderMedianMs: percentile(audit.renderMs, .5), renderP95Ms: percentile(audit.renderMs, .95), frameMedianMs: percentile(audit.frameMs, .5), frameP95Ms: percentile(audit.frameMs, .95) };
      });
      await info.attach('scroll-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
      expect(metrics.violations).toEqual([]);
      expect(metrics.members).toBe(site.team.length); expect(metrics.draws).toBeLessThanOrEqual(8);
      expect(errors).toEqual([]);
      await page.screenshot({ path: info.outputPath('settled-profile.png') });
    });
  });
}
