// Repeatable local measurements; CPU emulation is not a real-device FPS guarantee.
// node scripts/profile-interactions.mjs output/interaction-performance/before.json
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const destination = process.argv[2] || 'output/interaction-performance/latest.json';
const site = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
const vite = await createServer({ server: { host: '127.0.0.1', port: 0 } });
await vite.listen();
const origin = vite.resolvedUrls.local[0];
const browser = await chromium.launch({ headless: true });
const report = { conditions: 'Headless Chromium, 6x CPU slowdown; local assets; 4 seconds of activity. GPU/host scheduling affects timings.', samples: [] };
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 2 });
    const page = await context.newPage();
    page.on('pageerror', error => console.error(error.message));
    await page.route('**/api/site', route => route.fulfill({ json: site }));
    await page.addInitScript(mobile => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: mobile ? 2 : 12 });
      Object.defineProperty(navigator, 'deviceMemory', { value: mobile ? 2 : 8 });
      window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
        const renderer = event.detail;
        if (!renderer?.isWebGLRenderer) return;
        const render = renderer.render.bind(renderer);
        renderer.render = (scene, camera) => { render(scene, camera); window.towerView = { renderer, scene, camera }; };
      } };
    }, mobile);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await cdp.send('Performance.enable');
    const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(metric => [metric.name, metric.value]));
    for (const target of (process.argv[3] ? [process.argv[3]] : ['ripple', 'tower'])) {
      if (target === 'ripple') {
        await page.route('**/__ripple-profile', async route => route.fulfill({ contentType: 'text/html', body: await vite.transformIndexHtml('/__ripple-profile', `
          <meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#000}</style><div id="root"></div>
          <script type="module">import React from '/node_modules/.vite/deps/react.js';import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js';
          import {BackgroundRippleEffect} from '/src/components/ui/background-ripple-effect.tsx';
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(BackgroundRippleEffect));</script>`) }));
        await page.goto(origin + '__ripple-profile');
        await page.waitForSelector('.background-ripple-effect canvas');
      } else {
        await page.goto(origin + 'team');
        await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
        await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
        await page.locator('.people-page[data-tower-status="ready"]').waitFor({ timeout: 30000 });
        await page.waitForFunction(() => window.towerView);
      }
      await page.waitForTimeout(500);
      const before = await metrics();
      const activity = page.evaluate(async target => {
        const intervals = [];
        let previous, start, frame;
        const sample = time => { start ??= time; if (previous) intervals.push(time - previous); previous = time; frame = requestAnimationFrame(sample); };
        frame = requestAnimationFrame(sample);
        if (target === 'ripple') {
          const root = document.querySelector('.background-ripple-effect');
          for (let i = 0; i < 24; i++) {
            root.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 140 + i % 3 * 56, clientY: 252 }));
            await new Promise(resolve => setTimeout(resolve, 120));
          }
        }
        await new Promise(resolve => setTimeout(resolve, target === 'ripple' ? 1100 : 4000));
        cancelAnimationFrame(frame); intervals.sort((a, b) => a - b);
        const view = target === 'tower' ? window.towerView : null;
        const canvas = document.querySelector('canvas');
        return { p95FrameMs: intervals[Math.floor(intervals.length * .95)], frames: intervals.length,
          pixels: canvas.width * canvas.height, ...(view ? { triangles: view.renderer.info.render.triangles,
            calls: view.renderer.info.render.calls, shadows: view.renderer.shadowMap.enabled,
            antialias: view.renderer.getContext().getContextAttributes().antialias,
            quality: canvas.parentElement.dataset.quality } : {}) };
      }, target);
      if (target === 'tower') {
        const point = await page.evaluate(async () => {
          const THREE = await import('/node_modules/three/build/three.module.js');
          const { renderer, scene, camera } = window.towerView;
          const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
          const matrix = new THREE.Matrix4(); blocks.getMatrixAt(blocks.count - 2, matrix);
          const point = new THREE.Vector3(0, 0, .501).applyMatrix4(matrix).project(camera);
          const rect = renderer.domElement.getBoundingClientRect();
          return { x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 };
        });
        await page.mouse.click(point.x, point.y);
      }
      const sample = await activity, after = await metrics();
      report.samples.push({ target, device: mobile ? '2-core phone' : '12-core desktop', ...sample,
        taskMs: (after.TaskDuration - before.TaskDuration) * 1000,
        scriptMs: (after.ScriptDuration - before.ScriptDuration) * 1000,
        layouts: after.LayoutCount - before.LayoutCount });
    }
    await context.close();
  }
} finally { await browser.close(); await vite.close(); }
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
