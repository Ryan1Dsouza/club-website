import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { memberProgress, sortTowerMembers, TOWER_INTRO, TOWER_OUTRO } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const variants = JSON.parse(await readFile(new URL('../../src/lib/team-portraits.json', import.meta.url), 'utf8'));
const ordered = sortTowerMembers(site.team);
const duration = TOWER_INTRO + ordered.length + TOWER_OUTRO;

async function seek(page, progress) {
  await page.locator('.people-tower').evaluate((element, progress) => {
    const shell = element.closest('.site-shell');
    const scroller = matchMedia('(max-width: 768px), (pointer: coarse)').matches ? shell : window;
    const current = scroller === window ? scrollY : scroller.scrollTop;
    const stage = element.querySelector('.people-tower__stage');
    const start = element.getBoundingClientRect().top + current - (parseFloat(getComputedStyle(stage).top) || 0);
    const range = element.offsetHeight - stage.offsetHeight;
    scroller.scrollTo({ top: start + progress * range, behavior: 'instant' });
    element.dataset.testTarget = String(((scroller === window ? scrollY : scroller.scrollTop) - start) / range);
  }, progress);
  await expect.poll(() => page.locator('.people-tower').evaluate(element =>
    Math.abs(Number(element.style.getPropertyValue('--tower-progress')) - Number(element.dataset.testTarget))
  )).toBeLessThan(.00001);
}

for (const mobile of [false, true]) {
  test.describe(mobile ? 'older phone banner' : 'desktop banner', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });

    test.beforeEach(async ({ page }) => {
      await page.route('**/api/site', route => route.fulfill({ json: site }));
      await page.addInitScript(lowEnd => {
        if (lowEnd) {
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
        }
        window.__portraitDecodes = [];
        const decode = HTMLImageElement.prototype.decode;
        HTMLImageElement.prototype.decode = function () {
          const src = this.src;
          return decode.call(this).then(() => { window.__portraitDecodes.push(src); });
        };
        window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
          if (!renderer?.isWebGLRenderer) return;
          const render = renderer.render.bind(renderer);
          renderer.render = (...args) => { render(...args); window.__bannerRenderer = renderer; };
        } };
      }, mobile);
    });

    test('decodes ahead of reveals, reuses one banner, and preserves forward/reverse flight', async ({ page }, info) => {
      const errors = [], requests = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/team_images/**', async route => {
        requests.push(new URL(route.request().url()).pathname);
        await new Promise(resolve => setTimeout(resolve, 200));
        await route.continue();
      });
      await page.goto('/team');
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15_000 });
      await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
      const source = index => variants[ordered[index].image][mobile ? 'small' : 'large'];
      await expect.poll(() => page.evaluate(() => window.__portraitDecodes.filter(src => src.includes('/team_images/')).length)).toBe(3);
      expect(requests).toEqual(expect.arrayContaining([source(0), source(1), source(2)]));
      expect(requests).toHaveLength(3);
      await expect(page.locator('.tower-profile')).toHaveCount(1);
      await expect(page.locator('.tower-profile')).toHaveCSS('pointer-events', 'none');

      await page.getByLabel('Jump to a member').selectOption('0');
      await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
      await expect(page.locator('.tower-profile__photo')).toHaveAttribute('src', source(0));
      expect(await page.locator('.tower-profile__photo').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      const box = await page.locator('.tower-profile').boundingBox();
      expect(box.width).toBeGreaterThan((mobile ? 390 : 1440) * .9);
      await page.screenshot({ path: info.outputPath('loaded-banner.png') });

      const frame = await page.evaluate(() => window.__bannerRenderer.info.render.frame);
      await seek(page, (TOWER_INTRO + .65) / duration);
      expect(await page.evaluate(() => window.__bannerRenderer.info.render.frame)).toBe(frame);

      for (const index of [1, 7, 14, 1, 0]) {
        await seek(page, (TOWER_INTRO + index + .24) / duration);
        await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '0');
        await seek(page, memberProgress(index, ordered.length));
        await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
        await expect(page.locator('.tower-profile__role')).toHaveText(ordered[index].role);
        // A delayed request may show initials, but must never show another member.
        const displayed = await page.locator('.tower-profile').evaluate(element => element.querySelector('.tower-profile__photo')?.getAttribute('src'));
        if (displayed) expect(displayed).toBe(source(index));
        await expect(page.locator('.tower-profile__photo')).toHaveAttribute('src', source(index));
        await expect(page.locator('.tower-profile')).toHaveCount(1);
        await seek(page, (TOWER_INTRO + index + .99) / duration);
        await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '0');
      }
      if (mobile) {
        const budget = await page.evaluate(() => {
          const renderer = window.__bannerRenderer;
          return { ratio: renderer.getPixelRatio(), antialias: renderer.getContext().getContextAttributes().antialias,
            shadows: renderer.shadowMap.enabled, triangles: renderer.info.render.triangles };
        });
        expect(budget.ratio).toBeLessThanOrEqual(1);
        expect(budget.ratio).toBeGreaterThanOrEqual(.75);
        expect(budget.antialias).toBe(false); expect(budget.shadows).toBe(false);
        expect(budget.triangles).toBeLessThan(2000);
      }
      expect(errors).toEqual([]);
    });

    test('a failed photo preserves initials and a late photo cannot replace the active member', async ({ page }) => {
      const first = variants[ordered[0].image][mobile ? 'small' : 'large'];
      const second = variants[ordered[1].image][mobile ? 'small' : 'large'];
      let release;
      const held = new Promise(resolve => { release = resolve; });
      await page.route(`**${first}`, async route => { await held; await route.continue(); });
      await page.route(`**${second}`, route => route.fulfill({ status: 404, body: '' }));
      await page.goto('/team');
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15_000 });
      await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
      await seek(page, memberProgress(1, ordered.length));
      await expect(page.locator('.tower-profile__monogram')).toHaveText(ordered[1].initials);
      await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
      await expect(page.locator('.tower-profile__photo')).toHaveCount(0);
      release();
      await expect.poll(() => page.evaluate(src => window.__portraitDecodes.some(url => url.endsWith(src)), first)).toBe(true);
      await expect(page.locator('.tower-profile__photo')).toHaveCount(0);
      await seek(page, memberProgress(0, ordered.length));
      await expect(page.locator('.tower-profile__photo')).toHaveAttribute('src', first);
    });
  });
}
