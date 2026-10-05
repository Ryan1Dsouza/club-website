import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function openBook(page) {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/events');
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 20_000 });
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  await page.locator('.nx-book-dialog').evaluate(async dialog => { await Promise.all(dialog.getAnimations().map(animation => animation.finished)); });
  return page.locator('.station-book');
}

test('wheel settlement never reopens a completed page and reversals immediately change direction', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const book = await openBook(page);
  const result = await book.evaluate(async element => {
    const scroller = element.querySelector('.station-book__scroller');
    const frame = () => new Promise(requestAnimationFrame);
    const samples = [];
    const wheel = deltaY => scroller.dispatchEvent(new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true }));
    wheel(441); // Cross one leaf, then stop just beyond its boundary.
    for (let i = 0; i < 80; i++) {
      await frame();
      samples.push(Number(element.dataset.bookProgress));
    }
    // Repeated fractional deltas can sum to 4.000000000000002. They must
    // settle on page 4 rather than treating floating-point noise as a turn.
    for (let i = 0; i < 20; i++) wheel(42);
    for (let i = 0; i < 80; i++) await frame();
    const exactBoundary = Number(element.dataset.bookProgress);
    const runs = [];
    for (const direction of [-1, 1, -1, 1]) {
      const values = [];
      for (let i = 0; i < 12; i++) {
        wheel(direction * 42);
        await frame(); await frame();
        values.push(Number(element.dataset.bookProgress));
      }
      runs.push({ direction, values });
    }
    return { samples, exactBoundary, runs };
  });
  expect(result.samples.at(-1)).toBe(2);
  expect(result.exactBoundary).toBe(4);
  for (let i = 1; i < result.samples.length; i++) expect(result.samples[i]).toBeGreaterThanOrEqual(result.samples[i - 1]);
  for (const { direction, values } of result.runs) {
    for (let i = 1; i < values.length; i++) expect((values[i] - values[i - 1]) * direction).toBeGreaterThan(0);
  }
});

test.describe('mobile reading and page compositing', () => {
  test.use({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });

  test('the contents scroll in both directions and one reading swipe cannot turn the page', async ({ page }, info) => {
    const book = await openBook(page);
    const story = book.getByRole('region', { name: 'Event story', exact: true });
    expect(await story.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(100);
    const box = await story.boundingBox(), x = box.x + box.width * .75;
    const cdp = await page.context().newCDPSession(page);
    async function swipe(from, to) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from }] });
      for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from + (to - from) * i / 12 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const top = box.y + 25, bottom = box.y + box.height - 25;
    await swipe(bottom, top);
    await expect.poll(() => story.evaluate(element => element.scrollTop)).toBeGreaterThan(100);
    await expect(book).toHaveAttribute('data-book-progress', '0.000');
    await expect(story.locator('.station-book__details')).toBeInViewport();
    await page.screenshot({ path: info.outputPath('mobile-story-scrolled.png') });
    await swipe(top, bottom);
    await expect.poll(() => story.evaluate(element => element.scrollTop)).toBe(0);
    await expect(book).toHaveAttribute('data-book-progress', '0.000');
    await swipe(bottom, top);
    await expect.poll(() => story.evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThan(2);
    await swipe(bottom, top);
    await expect(book).toHaveAttribute('data-book-progress', '1.000');
    await page.getByRole('button', { name: 'Previous book page' }).click();
    await expect(book).toHaveAttribute('data-book-progress', '0.000');
    await expect.poll(() => story.evaluate(element => element.scrollTop)).toBeGreaterThan(100);
    await cdp.detach();
  });

  test('photo leaves keep the correct image and cart position through rapid turns under CPU load', async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const book = await openBook(page);
    await page.screenshot({ path: info.outputPath('mobile-story.png') });
    await page.getByRole('button', { name: 'Next book page', exact: true }).click();
    await expect(book).toHaveAttribute('data-book-progress', '1.000');
    const photo = book.locator('.station-book__spread a');
    const opened = page.context().waitForEvent('page');
    await photo.tap();
    const popup = await opened;
    await popup.waitForURL(await photo.getAttribute('href'));
    await popup.close();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    const frames = await book.evaluate(async element => {
      const frames = [], scroller = element.querySelector('.station-book__scroller');
      let running = true;
      function sample() {
        if (!running) return;
        const leaf = element.querySelector('.station-book__leaf');
        frames.push({ value: Number(element.dataset.bookProgress), page: Number(element.dataset.bookPage),
          angle: parseFloat(leaf.style.getPropertyValue('--book-turn')), visible: getComputedStyle(leaf).visibility === 'visible',
          front: leaf.querySelector('img')?.getAttribute('src'), photo: element.querySelector('.station-book__spread img')?.getAttribute('src'),
          cart: Number(element.querySelector('.station-book__progress').style.getPropertyValue('--rail-progress')) });
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
      for (const delta of [441, 441, -441, 441, -441, 441]) {
        scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true }));
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      await new Promise(resolve => setTimeout(resolve, 900));
      running = false; return frames;
    });
    await cdp.detach();
    expect(frames.filter(frame => frame.visible).length).toBeGreaterThan(20);
    for (const frame of frames) {
      const fraction = frame.value - Math.floor(frame.value);
      if (fraction > .003 && fraction < .997) {
        expect(frame.page).toBe(Math.floor(frame.value) + 1);
        expect(frame.angle).toBeCloseTo(180 * fraction, 0);
        expect(frame.front).toMatch(new RegExp(`/inauguration/.*${frame.page - 1}\\.avif$`));
        expect(frame.photo).toMatch(new RegExp(`/inauguration/.*${frame.page}\\.avif$`));
      }
      if (!frame.visible) expect(frame.angle).toBe(0);
      expect(frame.cart).toBeCloseTo(frame.value / 13, 3);
    }
    expect(errors).toEqual([]);
    expect(page.context().pages()).toHaveLength(1);
  });
});
