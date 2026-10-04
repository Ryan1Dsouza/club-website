import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

for (const slow of [false, true]) {
  test.describe(slow ? 'CPU-throttled mobile book' : 'mobile book', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    test('the leaf tracks, holds and reverses under the finger without ending the gesture', async ({ page }) => {
      await page.route('**/api/site', route => route.fulfill({ json: site }));
      await page.addInitScript(() => {
        window.__bookCommits = 0;
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber: true, renderers: new Map(), inject: () => 1,
          onCommitFiberRoot: () => { window.__bookCommits++; }, onCommitFiberUnmount() {} };
      });
      await page.goto('/events');
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 20_000 });
      await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 20_000 });
      await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
      const book = page.locator('.station-book');
      await page.locator('.nx-book-dialog').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
      await book.locator('.station-book__spread img').evaluate(image => image.decode());
      const box = await book.locator('.station-book__surface').boundingBox();
      const x = box.x + box.width * .8, distance = Math.max(240, box.height * .8);
      const cdp = await page.context().newCDPSession(page);
      if (slow) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
      const input = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: y === undefined ? [] : [{ x, y }] });
      const value = () => book.getAttribute('data-book-progress').then(Number);
      async function pull(from, startValue, steps) {
        for (const offset of steps) {
          await input('touchMove', from - offset * distance);
          await expect.poll(async () => Math.abs(await value() - (startValue + offset))).toBeLessThan(.012);
        }
      }

      let start = box.y + box.height * .9;
      await input('touchStart', start);
      const commits = await page.evaluate(() => window.__bookCommits);
      await pull(start, 0, [.05, .1, .15, .2, .25, .3, .35, .4, .45, .5]);
      await expect(book).toHaveAttribute('data-book-turning', 'true');
      await expect(book.locator('.station-book__strip')).toHaveCount(4);
      await page.waitForTimeout(200);
      expect(await value()).toBeCloseTo(.5, 2);
      await pull(start, 0, [.45, .4, .35, .3, .25, .2]);
      expect(await page.evaluate(() => window.__bookCommits) - commits).toBeLessThan(8);
      await input('touchEnd');
      await expect(book).toHaveAttribute('data-book-progress', '0.000');

      // Complete a turn, then reverse from the image that gets replaced when
      // the previous leaf mounts. Its implicit capture loss must not end input.
      await input('touchStart', start);
      await pull(start, 0, [.1, .2, .3, .4, .5]);
      await input('touchEnd');
      await page.waitForTimeout(120);
      expect(await value()).toBeGreaterThan(.5);
      expect(await value()).toBeLessThan(.95);
      await expect(book).toHaveAttribute('data-book-progress', '1.000');
      start = box.y + box.height * .2;
      await input('touchStart', start);
      await pull(start, 1, [-.05, -.1, -.15, -.2, -.25, -.3, -.35, -.4, -.45, -.5]);
      await page.waitForTimeout(200);
      expect(await value()).toBeCloseTo(.5, 2);
      await input('touchEnd');
      await expect(book).toHaveAttribute('data-book-progress', '0.000');

      // Catch an automatic settle before it finishes and pull back immediately.
      start = box.y + box.height * .9;
      await input('touchStart', start);
      await pull(start, 0, [.1, .2, .3, .4, .5]);
      await input('touchEnd');
      await page.waitForTimeout(100);
      start = box.y + box.height * .2;
      await input('touchStart', start);
      const caught = await value();
      await pull(start, caught, [-.1, -.2, -.3, -.4]);
      await input('touchEnd');
      await expect(book).toHaveAttribute('data-book-progress', '0.000');
      await cdp.detach();
    });
  });
}
