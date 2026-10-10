import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';
import { render } from '../dist/server/entry-server.js';

// Run after npm run build. Sequential audits avoid contention between pages.
const directory = resolve(process.argv[2] || 'output/page-performance-2026-10-08');
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, '.gitignore'), '*\n');
const started = Date.now();
const db = openDatabase(':memory:');
const server = createApp(db, { render, production: true, origin: 'https://nucleussjec.in', limits: false }).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium', headless: true, args: ['--remote-debugging-port=9259'] });
const pages = [['Home', '/'], ['About', '/about'], ['Events', '/events'], ['Work', '/projects'], ['Achievements', '/achievements'], ['News', '/news'], ['Team', '/team'], ['Recruitment', '/recruitment']];
const report = { measuredAt: new Date().toISOString(), browser: browser.version(), conditions: 'Local production SSR; isolated seeded database; live public content requests; cold-cache Lighthouse simulated throttling; one run per page/device. /live-news aliases /news. Scores are lab measurements, not field data.', pages: [], interactions: [] };
const save = async () => writeFile(resolve(directory, 'summary.json'), JSON.stringify(report, null, 2));
try {
  for (const [label, path] of pages) for (const device of ['mobile', 'desktop']) {
    const name = `${device}-${path.slice(1) || 'home'}`;
    console.log(`START ${name} (${Math.round((Date.now() - started) / 1000)}s)`);
    const options = { port: 9259, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance'] };
    if (device === 'desktop') Object.assign(options, { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } });
    try {
      const result = await lighthouse(origin + path, options);
      await writeFile(resolve(directory, `${name}.html`), result.report[0]);
      await writeFile(resolve(directory, `${name}.json`), result.report[1]);
      const { audits, categories, runWarnings, runtimeError, configSettings } = result.lhr;
      const item = { label, path, device, score: categories.performance.score === null ? null : Math.round(categories.performance.score * 100), metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(key => [key, { value: audits[key]?.numericValue, display: audits[key]?.displayValue }])), bytes: audits['total-byte-weight']?.numericValue, mainThreadMs: audits['mainthread-work-breakdown']?.numericValue, warnings: runWarnings, runtimeError, throttling: configSettings.throttling, screen: configSettings.screenEmulation, issues: Object.values(audits).filter(a => a.score !== null && a.score < 1 && !['notApplicable', 'informative', 'manual'].includes(a.scoreDisplayMode)).map(a => ({ id: a.id, title: a.title, display: a.displayValue, savings: a.metricSavings, savingsMs: a.details?.overallSavingsMs })), resources: [...(audits['network-requests']?.details?.items || [])].sort((a, b) => b.transferSize - a.transferSize).slice(0, 8).map(a => ({ url: a.url.replace(origin, ''), bytes: a.transferSize, type: a.resourceType, status: a.statusCode })) };
      report.pages.push(item);
      console.log(JSON.stringify({ name, score: item.score, lcp: item.metrics['largest-contentful-paint'].display, tbt: item.metrics['total-blocking-time'].display, cls: item.metrics['cumulative-layout-shift'].display, warnings: item.warnings }));
    } catch (error) { report.pages.push({ label, path, device, error: error.message }); console.log(`ERROR ${name}: ${error.message}`); }
    await save();
  }
  for (const device of ['mobile', 'desktop']) for (const scene of ['tower', 'ride']) {
    console.log(`SCENE ${device}-${scene} (${Math.round((Date.now() - started) / 1000)}s)`);
    const mobile = device === 'mobile';
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 1 });
    try {
      await page.goto(origin + (scene === 'tower' ? '/team' : '/events'));
      await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
      if (scene === 'ride') await page.getByRole('button', { name: 'The Nucleus Ride', exact: true }).first().click();
      const entryStart = Date.now();
      await page.getByRole('button', { name: scene === 'tower' ? 'Play Interactive Tower' : "Yes, Let's Go", exact: true }).click();
      if (scene === 'tower') await page.locator('.people-page[data-tower-status="ready"]').waitFor();
      else { await page.locator('.events-flight').waitFor({ state: 'detached' }); await page.locator('canvas').first().waitFor(); }
      const entryMs = Date.now() - entryStart;
      const frameSample = page.evaluate(async () => {
        const intervals = [], longTasks = [];
        const observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(e => e.duration)));
        observer.observe({ type: 'longtask' });
        let last, frame;
        const tick = time => { if (last !== undefined) intervals.push(time - last); last = time; frame = requestAnimationFrame(tick); };
        frame = requestAnimationFrame(tick);
        await new Promise(resolve => setTimeout(resolve, 4000));
        cancelAnimationFrame(frame); observer.disconnect();
        const sorted = [...intervals].sort((a, b) => a - b);
        return { sampledMs: intervals.reduce((a, b) => a + b, 0), frames: intervals.length, p95FrameMs: sorted[Math.floor(sorted.length * .95)], framesOver50ms: intervals.filter(v => v > 50).length, longTasks: longTasks.length, longTaskMs: longTasks.reduce((a, b) => a + b, 0), averageRafFps: intervals.length * 1000 / intervals.reduce((a, b) => a + b, 0) };
      });
      await page.mouse.wheel(0, 850);
      const sample = await frameSample;
      const item = { device, scene, entryMs, ...sample, errors, conditions: `${mobile ? '4x' : '1x'} CPU, unthrottled local network, 4-second window after entry with one wheel input; rAF cadence is not GPU-rendered FPS or a physical-device benchmark.` };
      report.interactions.push(item);
      console.log(JSON.stringify(item));
      await page.screenshot({ path: resolve(directory, `${device}-${scene}.png`) });
    } catch (error) { report.interactions.push({ device, scene, error: error.message, errors }); console.log(`SCENE ERROR ${device}-${scene}: ${error.message}`); }
    finally { await context.close(); }
    await save();
  }
} finally {
  report.elapsedSeconds = Math.round((Date.now() - started) / 1000);
  await save();
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  db.close();
}
console.log(`DONE: ${report.pages.length} page runs, ${report.interactions.length} scene runs, ${report.elapsedSeconds}s. ${directory}`);
