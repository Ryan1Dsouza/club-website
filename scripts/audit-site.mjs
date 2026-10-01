import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';
import { render } from '../dist/server/entry-server.js';

// Audit the production build with isolated seed data; never touch the live database.
const db = openDatabase(':memory:');
const server = createApp(db, { render, production: true, origin: 'https://nucleussjec.in', limits: false }).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const browser = await chromium.launch({ args: ['--remote-debugging-port=9224'] });
const directory = 'output/site-audit';
await mkdir(directory, { recursive: true });
try {
  const summary = [];
  for (const device of ['desktop', 'mobile']) {
    for (const path of ['/', '/team']) {
      const name = `${device}-${path === '/' ? 'home' : 'people'}`;
      if (process.argv[2] && process.argv[2] !== name) continue;
      const options = { port: 9224, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };
      if (device === 'desktop') Object.assign(options, { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } });
      const result = await lighthouse(`http://127.0.0.1:${server.address().port}${path}`, options);
      await writeFile(`${directory}/${name}.html`, result.report[0]);
      await writeFile(`${directory}/${name}.json`, result.report[1]);
      const { categories, audits } = result.lhr;
      const item = { name, scores: Object.fromEntries(Object.entries(categories).map(([key, value]) => [key, Math.round(value.score * 100)])), metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'].map(key => [key, audits[key].displayValue])), issues: Object.values(audits).filter(audit => audit.score !== null && audit.score < 1 && !['notApplicable', 'informative', 'manual'].includes(audit.scoreDisplayMode)).map(audit => ({ id: audit.id, title: audit.title, value: audit.displayValue })) };
      summary.push(item);
      console.log(JSON.stringify(item));
    }
  }
  await writeFile(`${directory}/summary${process.argv[2] ? `-${process.argv[2]}` : ''}.json`, JSON.stringify(summary, null, 2));
  if (!process.argv[2]) for (const [device, viewport, scale] of [
    ['desktop', { width: 1440, height: 900 }, 1], ['mobile', { width: 390, height: 844 }, 3],
  ]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: scale, isMobile: device === 'mobile', hasTouch: device === 'mobile' });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/team`);
    await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
    await page.locator('.people-page[data-tower-status="ready"]').waitFor();
    await page.screenshot({ path: `${directory}/${device}-people.png` });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
    await page.locator('.dp-panel').first().evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight * .15, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${directory}/${device}-domains.png` });
    await context.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  db.close();
}
