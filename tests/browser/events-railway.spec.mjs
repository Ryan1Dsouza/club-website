import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function open(page) {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('/events');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 20_000 });
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 20_000 });
}

for (const mobile of [false, true]) {
  test(`railcart follows ${mobile ? 'native mobile' : 'Lenis desktop'} scroll and returns to the start`, async ({ browser }, info) => {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    try {
      await open(page);
      const track = page.locator('.events-portal-lane--left .railway-track');
      const journey = track.locator('.railway-track__journey');
      if (mobile) {
        const label = await page.locator('.events-portal-lane--left .events-portal__label').boundingBox();
        expect(label.y + label.height).toBeLessThanOrEqual((await track.boundingBox()).y);
      }
      const position = () => journey.evaluate(element => {
        const matrix = new DOMMatrix(getComputedStyle(element).transform);
        return { x: matrix.m41, y: matrix.m42 };
      });
      const initial = await position();
      if (mobile) await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * .5));
      else { await page.mouse.move(700, 650); await page.mouse.wheel(0, 750); }
      await expect.poll(async () => (await position()).y).toBeGreaterThan(30);
      await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
      const progress = await journey.evaluate(element => ({
        painted: Number(element.style.getPropertyValue('--rail-progress')),
        actual: scrollY / (document.documentElement.scrollHeight - innerHeight),
      }));
      expect(Math.abs(progress.painted - progress.actual)).toBeLessThan(.005);
      await page.screenshot({ path: info.outputPath('railway-scroll.png') });
      await page.evaluate(() => scrollTo(0, 0));
      await expect.poll(async () => (await position()).y).toBeCloseTo(initial.y, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    } finally { await context.close(); }
  });
}

test('continuous wheel packets advance smoothly before release and can reverse', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  const book = page.locator('.station-book');
  const samples = await book.evaluate(async element => {
    const scroller = element.querySelector('.station-book__scroller');
    const values = [];
    for (let i = 0; i < 25; i++) {
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 14, bubbles: true, cancelable: true }));
      await new Promise(requestAnimationFrame);
      values.push(Number(element.dataset.bookProgress));
    }
    return values;
  });
  expect(samples[9]).toBeGreaterThan(.06);
  expect(samples.at(-1)).toBeGreaterThan(.5);
  for (let i = 1; i < samples.length; i++) expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
  await expect(book).toHaveAttribute('data-book-progress', '1.000');
  await book.locator('.station-book__surface').hover();
  await page.mouse.wheel(0, -280);
  await expect(book).toHaveAttribute('data-book-progress', '0.000');
});

test('completed and reversed turns never paint a stale photo or reset leaf under CPU load', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await open(page);
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  const book = page.locator('.station-book');
  await page.locator('.nx-book-dialog').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await book.evaluate(element => {
    window.__bookFrames = [];
    window.__sampleBook = true;
    const sample = () => {
      if (!window.__sampleBook) return;
      const value = Number(element.dataset.bookProgress);
      const leaf = element.querySelector('.station-book__leaf');
      window.__bookFrames.push({
        value, page: Number(element.dataset.bookPage), turning: element.dataset.bookTurning === 'true',
        angle: parseFloat(leaf.style.getPropertyValue('--book-turn')),
        progress: Number(element.querySelector('.station-book__progress').style.getPropertyValue('--rail-progress')),
        front: leaf.querySelector('img')?.getAttribute('src'),
        photos: [...element.querySelectorAll('.station-book__spread img')].map(image => image.getAttribute('src')),
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  for (const number of [2, 3, 2, 1, 2]) {
    const current = Number(await book.getAttribute('data-book-page'));
    await page.getByRole('button', { name: number > current ? 'Next book page' : 'Previous book page', exact: true }).click();
    await expect(book).toHaveAttribute('data-book-progress', `${number - 1}.000`);
  }
  const frames = await page.evaluate(() => { window.__sampleBook = false; return window.__bookFrames; });
  await cdp.detach();
  expect(frames.filter(frame => frame.turning).length).toBeGreaterThan(10);
  for (const frame of frames) {
    // Progress is rounded to 3 decimals for diagnostics; avoid that rounding edge.
    const fraction = frame.value - Math.floor(frame.value);
    if (fraction > .002 && fraction < .998) {
      expect(frame.page).toBe(Math.floor(frame.value) + 1);
      expect(frame.angle).toBeCloseTo(-180 * fraction, 0);
    }
    if (!frame.turning) {
      expect(frame.value).toBeCloseTo(frame.page - 1, 2);
      expect(frame.angle).toBe(0);
      expect(frame.photos[0]).toMatch(new RegExp(`/inauguration/.*${frame.page === 1 ? 1 : (frame.page - 1) * 2}\\.avif$`));
    }
    expect(frame.progress).toBeCloseTo(frame.value / 7, 3);
  }
  expect(errors).toEqual([]);
});
