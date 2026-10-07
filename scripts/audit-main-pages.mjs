import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';

// Use a frozen production build and a temporary local database. External public
// content requests remain real; no routes, animations, or assets are suppressed.
const phase = process.argv[2] || 'baseline';
if (!/^[a-z0-9-]+$/.test(phase)) throw new Error('Use a simple phase name.');
const directory = resolve('output/lighthouse-main-2026-10-07', phase);
const requested = new Set(process.argv.slice(3));
const { render } = await import(pathToFileURL(resolve(directory, 'server/entry-server.js')).href);
const db = openDatabase(':memory:');
const server = createApp(db, {
  render, dist: resolve(directory, 'client'), production: true,
  origin: 'https://nucleussjec.in', limits: false,
}).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const port = 9248;
const browser = await chromium.launch({ channel: 'chromium', headless: true, args: [`--remote-debugging-port=${port}`] });
const paths = ['/', '/team', '/events', '/projects', '/achievements', '/news', '/recruitment', '/about', '/live-news'];
const results = [];
await mkdir(directory, { recursive: true });
try {
  const cdp = await browser.newBrowserCDPSession();
  const system = await cdp.send('SystemInfo.getInfo');
  await writeFile(resolve(directory, 'environment.json'), JSON.stringify({
    browser: browser.version(), node: process.version, measuredAt: new Date().toISOString(),
    gpu: system.gpu, notes: 'Local production SSR; isolated seeded SQLite; real public Supabase reads; cold browser cache per Lighthouse navigation; simulated network/CPU throttling.',
  }, null, 2));
  for (const device of ['mobile', 'desktop']) for (const path of paths) {
    const name = `${device}-${path.slice(1) || 'home'}`;
    if (requested.size && !requested.has(name)) continue;
    console.log(`Starting ${phase}: ${name}`);
    const options = {
      port, output: ['html', 'json'], logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };
    if (device === 'desktop') Object.assign(options, {
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
      throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
    });
    try {
      const result = await lighthouse(origin + path, options);
      await writeFile(resolve(directory, `${name}.html`), result.report[0]);
      await writeFile(resolve(directory, `${name}.json`), result.report[1]);
      const { audits, categories, runWarnings, runtimeError } = result.lhr;
      const item = {
        name, path, scores: Object.fromEntries(Object.entries(categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
        metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(key => [key, { value: audits[key].numericValue, display: audits[key].displayValue }])),
        bytes: audits['total-byte-weight']?.numericValue,
        mainThreadMs: audits['mainthread-work-breakdown']?.numericValue,
        warnings: runWarnings, runtimeError,
        issues: Object.values(audits).filter(audit => audit.score !== null && audit.score < 1 && !['notApplicable', 'informative', 'manual'].includes(audit.scoreDisplayMode)).map(audit => ({ id: audit.id, title: audit.title, value: audit.displayValue, savings: audit.metricSavings })),
      };
      results.push(item);
      console.log(JSON.stringify({ name, scores: item.scores, metrics: item.metrics, bytes: item.bytes, warnings: item.warnings }));
    } catch (error) {
      results.push({ name, error: error.message });
      console.log(JSON.stringify({ name, error: error.message }));
    }
    await writeFile(resolve(directory, requested.size ? `summary-${[...requested].join('_')}.json` : 'summary.json'), JSON.stringify(results, null, 2));
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  db.close();
}
