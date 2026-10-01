import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const directory = new URL('../output/home-reveal-preview/', import.meta.url);
await mkdir(directory, { recursive: true });
const site = JSON.parse(await readFile(new URL('../shared/public-data.json', import.meta.url), 'utf8'));
const server = await createServer({ server: { host: '127.0.0.1', port: 3015, strictPort: true } });
await server.listen();
let browser;
const report = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const device of [
    { name: 'desktop', viewport: { width: 1440, height: 900 } },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  ]) {
    const { name, ...options } = device;
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('http://127.0.0.1:3015/');
    await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
    await page.locator('.dp-section[data-motion="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const placeAt = async (selector, ratio) => {
      await page.locator(selector).first().evaluate((element, ratio) => {
        let top = 0;
        for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
        window.scrollTo({ top: top - innerHeight * ratio, behavior: 'instant' });
      }, ratio);
      await page.waitForTimeout(800);
    };
    const capture = async label => {
      await page.screenshot({ path: new URL(`${name}-${label}.png`, directory).pathname.replace(/^\/(\w:)/, '$1') });
      const state = await page.evaluate(() => {
        const surface = document.querySelector('.dp-panel__inner');
        const matrix = new DOMMatrixReadOnly(getComputedStyle(surface).transform);
        const units = [...document.querySelectorAll('.dp-line-1 .text-reveal__unit')].map(unit => ({
          opacity: Number(getComputedStyle(unit).opacity), filter: getComputedStyle(unit).filter,
        }));
        return { scrollY, overflow: document.documentElement.scrollWidth > innerWidth,
          card: { opacity: Number(getComputedStyle(surface).opacity), scale: matrix.a }, units };
      });
      report.push({ device: name, label, ...state });
    };
    await placeAt('.dp-line-1', .70);
    await capture('text-enter');
    await placeAt('.dp-line-1', .30);
    await capture('text-settled');
    await placeAt('.dp-line-1', .70);
    await capture('text-reverse');
    await placeAt('.dp-panel', .70);
    await capture('card-enter');
    await placeAt('.dp-panel', .03);
    await capture('card-settled');
    await placeAt('.dp-panel', .70);
    await capture('card-reverse');
    await placeAt('.community-section', .15);
    await capture('community');
    report.push({ device: name, errors });
    await context.close();
  }
  await writeFile(new URL('report.json', directory), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.map(({ units, ...record }) => record), null, 2));
} finally {
  await browser?.close();
  await server.close();
}
