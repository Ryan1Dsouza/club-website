import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

test('a wheel notch settles without a second speed jump and the rendered cart stays with the leaf', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/events');
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 20_000 });
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  await page.locator('.nx-book-dialog').evaluate(async dialog => {
    await Promise.all(dialog.getAnimations().map(animation => animation.finished));
    await Promise.all([...dialog.querySelectorAll('img')].map(image => image.decode()));
  });
  const book = page.locator('.station-book');
  for (const direction of [1, -1]) {
    const frames = await book.evaluate(async (element, direction) => {
      const scroller = element.querySelector('.station-book__scroller');
      const journey = element.querySelector('.railway-track__journey');
      const width = journey.getBoundingClientRect().width;
      const count = Number(element.querySelector('[role=status]').textContent.split('/')[1]);
      const frames = [], start = performance.now();
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: direction * 80, bubbles: true, cancelable: true }));
      while (performance.now() - start < 1100) {
        const time = await new Promise(requestAnimationFrame);
        frames.push({ time, value: Number(element.dataset.bookProgress),
          cart: new DOMMatrix(getComputedStyle(journey).transform).m41 / width * count });
      }
      return frames;
    }, direction);
    await info.attach(`wheel-${direction}.json`, { body: JSON.stringify(frames), contentType: 'application/json' });
    expect(frames.at(-1).value).toBe(direction > 0 ? 1 : 0);
    const increases = [];
    for (let i = 1; i < frames.length; i++) {
      const current = frames[i], previous = frames[i - 1];
      expect((current.value - previous.value) * direction).toBeGreaterThanOrEqual(0);
      // Check the real CSS transform, not just the requested progress value.
      expect(current.cart).toBeCloseTo(current.value, 2);
      if (i < 2 || current.value < .04 || current.value > .96) continue;
      const before = frames[i - 2], dt = current.time - previous.time, previousDt = previous.time - before.time;
      if (dt < 8 || dt > 40 || previousDt < 8 || previousDt > 40) continue;
      const speed = direction * (current.value - previous.value) * 1000 / dt;
      const previousSpeed = direction * (previous.value - before.value) * 1000 / previousDt;
      increases.push(speed - previousSpeed);
    }
    expect(increases.length).toBeGreaterThan(8);
    // The old delayed exponential snap abruptly added ~6 pages/second.
    // Allow normal frame jitter while catching that visible kick in speed.
    expect(Math.max(...increases)).toBeLessThan(2.5);
  }
});
