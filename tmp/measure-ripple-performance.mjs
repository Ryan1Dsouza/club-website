import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const site = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    const page = await browser.newPage({ viewport });
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.goto('http://127.0.0.1:3016/tmp/ripple-benchmark.html?' + process.argv[2]);
    await page.waitForSelector('.background-ripple-effect');
    console.log('Measuring', process.argv[2], viewport);
    await page.waitForTimeout(1000);
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await session.send('Performance.enable');
    const metrics = async () => Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(item => [item.name, item.value]));
    const before = await metrics();
    const work = await page.evaluate(async () => {
      const root = document.querySelector('.background-ripple-effect');
      let added = 0, peakAnimations = 0;
      const observer = new MutationObserver(records => records.forEach(record => { added += record.addedNodes.length; }));
      observer.observe(root, { childList: true, subtree: true });
      const intervals = [];
      let frame = 0, previous = performance.now();
      const tick = time => { intervals.push(time - previous); previous = time; frame = requestAnimationFrame(tick); };
      frame = requestAnimationFrame(tick);
      for (let index = 0; index < 12; index++) {
        root.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 252 + (index % 3) * 56, clientY: 252 }));
        peakAnimations = Math.max(peakAnimations, root.getAnimations({ subtree: true }).length);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      await new Promise(resolve => setTimeout(resolve, 1200));
      cancelAnimationFrame(frame); observer.disconnect();
      intervals.sort((a, b) => a - b);
      return { addedNodes: added, peakAnimations, descendants: root.querySelectorAll('*').length, p95FrameMs: intervals[Math.floor(intervals.length * .95)], maxFrameMs: Math.max(...intervals) };
    });
    const after = await metrics();
    results.push({ viewport, ...work, taskMs: (after.TaskDuration - before.TaskDuration) * 1000, styleMs: (after.RecalcStyleDuration - before.RecalcStyleDuration) * 1000, layoutMs: (after.LayoutDuration - before.LayoutDuration) * 1000 });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`tmp/ripple-performance-${process.argv[2] || 'before'}.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
