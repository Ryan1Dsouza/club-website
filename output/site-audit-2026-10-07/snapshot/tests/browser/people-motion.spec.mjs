import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/team');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.fan-layout')).toHaveAttribute('data-ready', 'true');
});

test('side-card hover keeps the fan moving and leaves the visible card clickable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const carousel = page.locator('.fan-carousel');
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  // Find an exposed side card using hit testing, rather than its obscured center.
  const point = await page.locator('.fan-layout').evaluate(layout => {
    const bounds = layout.getBoundingClientRect();
    for (let y = bounds.top + 60; y < Math.min(bounds.bottom, innerHeight); y += 15) {
      for (let x = bounds.left + 20; x < bounds.right - 20; x += 15) {
        const card = document.elementFromPoint(x, y)?.closest('.fan-card');
        if (card && !card.inert && card.dataset.active === 'false') return { x, y, index: card.dataset.index };
      }
    }
  });
  expect(point).toBeTruthy();
  await page.mouse.move(point.x, point.y);
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  const transforms = () => page.locator('.fan-card').evaluateAll(cards => cards.map(card => card.style.transform));
  const frozen = await transforms();
  await page.waitForTimeout(250);
  expect(await transforms()).not.toEqual(frozen);
  const card = page.locator(`.fan-card[data-index="${point.index}"]`);
  const before = await card.evaluate(card => new DOMMatrixReadOnly(getComputedStyle(card).transform).m41);
  await page.mouse.move(5, 5);
  await expect(carousel).toHaveAttribute('data-autoplay', 'playing');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const after = await card.evaluate(card => new DOMMatrixReadOnly(getComputedStyle(card).transform).m41);
  expect(Math.abs(after - before)).toBeGreaterThan(0);
  expect(Math.abs(after - before)).toBeLessThan(20);
});

test('Jenga preview pauses offscreen and in hidden tabs, and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 700 });
  const button = page.getByRole('button', { name: 'Play Interactive Tower' });
  const block = page.locator('.jenga-preview__block');
  await expect(button).toHaveAttribute('data-animating', 'false');
  await expect(block).toHaveCSS('animation-play-state', 'paused');
  await button.scrollIntoViewIfNeeded();
  await expect(button).toHaveAttribute('data-animating', 'true');
  await expect(block).toHaveCSS('animation-play-state', 'running');
  const initial = await block.evaluate(block => getComputedStyle(block).transform);
  await expect.poll(() => block.evaluate(block => getComputedStyle(block).transform), { timeout: 3000 }).not.toBe(initial);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(button).toHaveAttribute('data-animating', 'false');
  const frozen = await block.evaluate(block => getComputedStyle(block).transform);
  await page.waitForTimeout(200);
  expect(await block.evaluate(block => getComputedStyle(block).transform)).toBe(frozen);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(button).toHaveAttribute('data-animating', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(block).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.fan-carousel')).toHaveAttribute('data-autoplay', 'paused');
  expect(await button.evaluate(button => button.getAnimations({ subtree: true }).length)).toBe(0);
});

test('successive automatic passes keep moving without jumps or a dwell between cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Find a team member').selectOption('0');
  await expect(page.locator('.fan-layout')).toHaveAttribute('data-settled', 'true');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('heading', { level: 1 }).click();
  const samples = await page.locator('.fan-card[data-index="0"]').evaluate(card => new Promise(resolve => {
    const carousel = card.closest('.fan-carousel'), frames = [];
    let start;
    const frame = time => {
      start ??= time;
      const pose = new DOMMatrixReadOnly(getComputedStyle(card).transform);
      frames.push({ time, x: pose.m41, y: pose.m42, index: carousel.dataset.activeIndex });
      if (time - start < 7700) requestAnimationFrame(frame);
      else resolve(frames);
    };
    requestAnimationFrame(frame);
  }));
  const handoffs = samples.flatMap((sample, index) => index > 2 && index < samples.length - 3 && sample.index !== samples[index - 1].index ? [index] : []);
  expect(handoffs.length).toBeGreaterThanOrEqual(2);
  for (const handoff of handoffs) {
    // The next pass continues from the current position without a dwell or jump.
    for (const index of [handoff - 1, handoff + 1]) {
      const a = samples[index - 1], b = samples[index];
      const speed = Math.hypot(b.x - a.x, b.y - a.y) * 1000 / (b.time - a.time);
      expect(speed).toBeGreaterThan(15);
      expect(speed).toBeLessThan(160);
    }
  }
});

test('Jenga animation stays smooth under 6x CPU throttling without recurring layout', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 400 });
  const button = page.getByRole('button', { name: 'Play Interactive Tower' });
  await button.scrollIntoViewIfNeeded();
  await expect(button).toHaveAttribute('data-animating', 'true');
  await page.waitForTimeout(1000);
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await session.send('Performance.enable');
  try {
    const before = await session.send('Performance.getMetrics');
    const sample = await button.evaluate(button => new Promise(resolve => {
      const frames = [];
      let start, previous;
      const frame = time => {
        start ??= time;
        if (previous !== undefined) frames.push(time - previous);
        previous = time;
        if (time - start < 3000) return requestAnimationFrame(frame);
        const sorted = [...frames].sort((a, b) => a - b);
        resolve({
          fps: frames.length * 1000 / (time - start),
          median: sorted[Math.floor(sorted.length / 2)],
          p95: sorted[Math.floor(sorted.length * .95)],
          animatedLayers: button.getAnimations({ subtree: true }).length,
        });
      };
      requestAnimationFrame(frame);
    }));
    const after = await session.send('Performance.getMetrics');
    const metric = (result, name) => result.metrics.find(metric => metric.name === name).value;
    sample.layouts = metric(after, 'LayoutCount') - metric(before, 'LayoutCount');
    await info.attach('jenga-performance.json', { body: JSON.stringify(sample, null, 2), contentType: 'application/json' });
    expect(sample.animatedLayers).toBe(2);
    expect(sample.layouts).toBe(0);
    expect(sample.median).toBeLessThan(20);
    expect(sample.fps).toBeGreaterThan(50);
  } finally {
    await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await session.detach();
  }
});
