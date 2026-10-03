import { mkdir, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import os from 'node:os';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { createApp } from '../../server/app.mjs';
import { openDatabase } from '../../server/db.mjs';
import { render } from '../../dist/server/entry-server.js';

const directory = 'output/performance-audit-2026-10-03/hardware';
await mkdir(directory, { recursive: true });
const db = openDatabase(':memory:');
const server = createApp(db, { render, production: true, origin: 'https://nucleussjec.in', limits: false }).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium', headless: true, args: ['--enable-gpu', '--use-angle=d3d11', '--remote-debugging-port=9238'] });
const results = [];
try {
  const session = await browser.newBrowserCDPSession();
  const gpu = await session.send('SystemInfo.getInfo');
  const environment = { date: new Date().toISOString(), node: process.version, browser: browser.version(), cpu: os.cpus()[0].model, logicalCores: os.cpus().length, gpu: gpu.gpu, build: 'Production SSR, fresh build; isolated in-memory seed database; localhost', dataCounts: JSON.parse(await readFile('shared/public-data.json', 'utf8')).events.length };
  await writeFile(`${directory}/environment.json`, JSON.stringify(environment, null, 2));
  const assets = [];
  for (const file of await readdir('dist/client/assets')) {
    const bytes = await readFile(`dist/client/assets/${file}`);
    assets.push({ file, bytes: bytes.length, gzipBytes: /\.(js|css)$/.test(file) ? gzipSync(bytes).length : undefined });
  }
  await writeFile(`${directory}/assets.json`, JSON.stringify(assets.sort((a, b) => b.bytes - a.bytes), null, 2));
  for (const device of ['mobile', 'desktop']) {
    for (const [name, path] of [['home', '/'], ['experiences', '/events'], ['people', '/team'], ['projects', '/projects'], ['recruitment', '/recruitment']]) {
      const label = `${device}-${name}`;
      const reportName = process.argv[3] ? `${label}-${process.argv[3]}` : label;
      if (process.argv[2] && label !== process.argv[2]) continue;
      console.log(`START ${label}`);
      const options = { port: 9238, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance'], maxWaitForLoad: 45000 };
      if (device === 'desktop') Object.assign(options, { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } });
      else Object.assign(options, { screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false } });
      try {
        const result = await lighthouse(origin + path, options);
        await writeFile(`${directory}/${reportName}.html`, result.report[0]);
        await writeFile(`${directory}/${reportName}.json`, result.report[1]);
        const { audits, categories, configSettings, runWarnings, runtimeError } = result.lhr;
        const item = { label, score: categories.performance.score === null ? null : Math.round(categories.performance.score * 100), metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'total-blocking-time', 'cumulative-layout-shift', 'interactive'].map(key => [key, { value: audits[key]?.numericValue, display: audits[key]?.displayValue }])), bytes: audits['total-byte-weight']?.numericValue, requests: audits['network-requests']?.details?.items?.length, warnings: runWarnings, runtimeError, throttling: configSettings.throttling, issues: Object.values(audits).filter(audit => audit.score !== null && audit.score < 1 && !['notApplicable', 'informative', 'manual'].includes(audit.scoreDisplayMode)).map(audit => ({ id: audit.id, title: audit.title, value: audit.displayValue, savings: audit.metricSavings })) };
        results.push(item);
        console.log(JSON.stringify(item));
      } catch (error) { results.push({ label, error: error.stack }); console.log(JSON.stringify({ label, error: error.message })); }
      await writeFile(`${directory}/lighthouse-summary${process.argv[2] ? `-${process.argv[2]}` : ''}${process.argv[3] ? `-${process.argv[3]}` : ''}.json`, JSON.stringify(results, null, 2));
    }
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  db.close();
}
