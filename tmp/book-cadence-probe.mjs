import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const label = process.argv[2] ?? 'before';
const site = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
await mkdir('output/book-cadence', { recursive: true });
const browser = await chromium.launch();
for (const interval of [90, 165, 230]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('http://127.0.0.1:3067/events');
  await page.locator('[data-loading-screen]').waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  await page.locator('.nx-book-dialog').evaluate(async dialog => {
    await Promise.all(dialog.getAnimations().map(animation => animation.finished));
    await Promise.all([...dialog.querySelectorAll('img')].map(image => image.decode()));
  });
  const samples = await page.locator('.station-book').evaluate(async (book, interval) => {
    const scroller = book.querySelector('.station-book__scroller'), journey = book.querySelector('.railway-track__journey');
    const width = journey.getBoundingClientRect().width, frames = [];
    let active = true, packet = 0;
    function sample(t) {
      if (!active) return;
      frames.push({ t, packet, progress: Number(book.dataset.bookProgress), cart: new DOMMatrix(getComputedStyle(journey).transform).m41 / width * 7 });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
    for (let i = 0; i < 9; i++) {
      packet++;
      scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, cancelable: true, bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    active = false;
    return frames;
  }, interval);
  const speeds = samples.map((f, i) => ({ ...f, speed: i ? (f.cart - samples[i - 1].cart) * 1000 / (f.t - samples[i - 1].t) : 0 }));
  const changes = speeds.slice(2).map((f, i) => ({ t:f.t, packet:f.packet, jump:f.speed - speeds[i + 1].speed }));
  console.log(JSON.stringify({ interval, frames:samples.length, final:samples.at(-1).progress, minJump:Math.min(...changes.map(c => c.jump)), maxJump:Math.max(...changes.map(c => c.jump)), input:changes.filter((f, i) => f.packet !== speeds[i + 1].packet) }));
  await writeFile(`output/book-cadence/${label}-${interval}.json`, JSON.stringify(speeds, null, 2));
  await page.close();
}
await browser.close();
