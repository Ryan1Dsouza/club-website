import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { TOWER_INTRO, TOWER_OUTRO } from '../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../shared/public-data.json', import.meta.url), 'utf8'));
const output = new URL(`./tower-reverse-${process.argv[2] || 'before'}/`, import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.__reverseFrames = [];
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (!renderer?.isWebGLRenderer) return;
      const render = renderer.render.bind(renderer);
      renderer.render = (scene, camera) => {
        const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
        const section = document.querySelector('.people-tower');
        if (blocks && section && window.__captureReverse) {
          window.__reverseFrames.push({ time: performance.now(), progress: Number(section.style.getPropertyValue('--tower-progress')),
            active: Number(renderer.domElement.parentElement.dataset.activeMember),
            blocks: Array.from({ length: blocks.count }, (_, i) => {
              const m = blocks.instanceMatrix.array.subarray(i * 16, i * 16 + 16);
              return { position: [...m.slice(12, 15)], scale: [Math.hypot(...m.slice(0, 3)), Math.hypot(...m.slice(4, 7)), Math.hypot(...m.slice(8, 11))] };
            }) });
        }
        return render(scene, camera);
      };
    } };
  });
  await page.goto('http://127.0.0.1:5173/team');
  await page.locator('.site-shell[data-loading-stage="done"]').waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  await page.locator('.people-page[data-tower-status="ready"]').waitFor({ timeout: 30000 });
  const duration = TOWER_INTRO + site.team.length + TOWER_OUTRO;
  async function seek(progress) {
    await page.locator('.people-tower').evaluate((section, progress) => {
      const stage = section.querySelector('.people-tower__stage');
      const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
      scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
    }, progress);
  }
  await seek((TOWER_INTRO + .6) / duration);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { window.__captureReverse = true; });
  for (const local of [.42, .35, .3, .25, .2, .15, .105, .095, .05, .005, -.01]) {
    await seek((TOWER_INTRO + local) / duration);
    await page.waitForTimeout(160);
    if ([.3, .15, .095, -.01].includes(local)) await page.screenshot({ path: new URL(`local-${local}.png`, output).pathname.replace(/^\/(\w:)/, '$1') });
  }
  await seek(0);
  await page.waitForTimeout(600);
  const frames = await page.evaluate(() => window.__reverseFrames);
  await writeFile(new URL('frames.json', output), JSON.stringify(frames));
  const jumps = [];
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1], b = frames[i];
    for (let index = 0; index < b.blocks.length; index++) {
      if (a.blocks[index].scale[0] < .01 || b.blocks[index].scale[0] < .01) continue;
      const distance = Math.hypot(...b.blocks[index].position.map((x, axis) => x - a.blocks[index].position[axis]));
      jumps.push({ index, distance, dt: b.time - a.time, local: b.progress * duration - TOWER_INTRO, active: b.active });
    }
  }
  console.log(JSON.stringify({ frames: frames.length, largestJumps: jumps.sort((a, b) => b.distance - a.distance).slice(0, 12), final: frames.at(-1) }, null, 2));
} finally { await browser.close(); }
