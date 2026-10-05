# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-performance.spec.mjs >> rendered blocks and DOM profiles reach zero together, including reverse seeks
- Location: tests\browser\people-tower-performance.spec.mjs:41:1

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('.tower-profile')
Expected: hidden
Received: visible
Timeout:  5000ms

Call log:
  - Expect "toBeHidden" locator('.tower-profile') with timeout 5000ms
  - waiting for locator('.tower-profile')
    14 × locator resolved to <div draggable="false" class="tower-profile">…</div>
       - unexpected value "visible"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - generic:
        - generic [ref=e5]:
          - link "Nucleus home" [ref=e6] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Open menu" [ref=e7] [cursor=pointer]
        - generic [aria-hidden]:
          - generic:
            - generic:
              - list:
                - listitem:
                  - link:
                    - /url: /
                    - generic [aria-hidden]:
                      - generic: H
                      - generic: o
                      - generic: m
                      - generic: e
                - listitem:
                  - link:
                    - /url: /events
                    - generic [aria-hidden]:
                      - generic: E
                      - generic: v
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
                - listitem:
                  - link:
                    - /url: /projects
                    - generic [aria-hidden]:
                      - generic: O
                      - generic: u
                      - generic: r
                      - generic: w
                      - generic: o
                      - generic: r
                      - generic: k
                - listitem:
                  - link:
                    - /url: /team
                    - generic [aria-hidden]:
                      - generic: T
                      - generic: h
                      - generic: e
                      - generic: p
                      - generic: e
                      - generic: o
                      - generic: p
                      - generic: l
                      - generic: e
              - list:
                - listitem:
                  - link:
                    - /url: https://www.instagram.com/nucleus_sjec/
                    - text: Instagram
                - listitem:
                  - link:
                    - /url: https://www.linkedin.com/company/nucleus-sjec/
                    - text: LinkedIn
                - listitem:
                  - link:
                    - /url: https://github.com/nucleus-sjec
                    - text: GitHub
                - listitem:
                  - link:
                    - /url: mailto:nucleussjec@gmail.com
                    - text: Email
            - generic:
              - generic:
                - generic: Made of many minds
                - generic: © 2026 Nucleus SJEC
              - generic:
                - generic: The community
                - button: Stay connected
  - main [ref=e11]:
    - region [ref=e12]:
      - button "Back to Quick view" [ref=e14] [cursor=pointer]
      - generic [ref=e17]:
        - heading "The people behind Nucleus" [level=1] [ref=e18]
        - region "Interactive team tower" [ref=e19]:
          - generic [ref=e21]:
            - generic [aria-hidden] [ref=e22]:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic: NUCLEUS / SJEC
                        - generic: 02 / 15
                      - generic: DC
                      - generic: +
                      - generic:
                        - paragraph: Vice President
                        - generic:
                          - generic: Dinol
                          - generic: Castelino
                      - generic:
                        - generic: The people / Nucleus
                        - generic: Keep scrolling ↗
            - generic [ref=e24]: 02 / The people
            - generic [aria-hidden]:
              - paragraph:
                - text: The
                - emphasis: whole team.
              - generic: Meet everyone
            - paragraph: Click a block to pull it out. Drag to play. Scroll to meet the team.
            - generic [ref=e26]:
              - generic [ref=e27]:
                - generic [ref=e28]: "02"
                - generic [ref=e29]: / 15
              - generic [ref=e30]:
                - generic [ref=e31]: Jump to a member
                - combobox "Jump to a member" [ref=e32]:
                  - option "Meet the members" [disabled]
                  - option "Poorvik Kuthyala"
                  - option "Dinol Castelino" [selected]
                  - option "Joylin Mathias"
                  - option "Karthik"
                  - option "Nishanth Uday Naik"
                  - option "Prajwal Gaonkar"
                  - option "Mohit"
                  - option "Rakshith Dsouza"
                  - option "Navya Suvarna"
                  - option "Deona Rego"
                  - option "Sweedan Cardoza"
                  - option "Manvitha Lewis"
                  - option "Salim Pallikal"
                  - option "Nikhitha Dsouza"
                  - option "Aisahath Saniya"
              - button "Rebuild tower" [ref=e33] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import { memberProgress, TOWER_INTRO, TOWER_OUTRO } from '../../src/lib/people-tower-motion.ts';
  4   | 
  5   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  6   | const duration = TOWER_INTRO + site.team.length + TOWER_OUTRO;
  7   | test.beforeEach(async ({ page }) => {
  8   |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  9   |   await page.addInitScript(() => {
  10  |     window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
  11  |       const renderer = event.detail;
  12  |       if (!renderer?.isWebGLRenderer) return;
  13  |       const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer);
  14  |       renderer.render = (scene, camera) => { render(scene, camera); window.__towerView = { renderer, scene, camera }; };
  15  |       renderer.dispose = () => { dispose(); window.__towerDisposed = { ...renderer.info.memory }; };
  16  |     } };
  17  |   });
  18  | });
  19  | 
  20  | async function seek(page, progress) {
  21  |   await page.locator('.people-tower').evaluate((element, progress) => {
  22  |     const stage = element.querySelector('.people-tower__stage');
  23  |     const scroller = matchMedia('(max-width: 768px), (pointer: coarse)').matches ? element.closest('.site-shell') : window;
  24  |     const current = scroller === window ? scrollY : scroller.scrollTop;
  25  |     const start = element.getBoundingClientRect().top + current - (parseFloat(getComputedStyle(stage).top) || 0);
  26  |     const range = element.offsetHeight - stage.offsetHeight;
  27  |     scroller.scrollTo({ top: start + progress * range, behavior: 'instant' });
  28  |   }, progress);
  29  |   // ResizeObserver can settle after a viewport change. Compare against the live
  30  |   // layout and actual scroll position, rather than an earlier rounded range.
  31  |   await expect.poll(() => page.locator('.people-tower').evaluate(element => {
  32  |     const stage = element.querySelector('.people-tower__stage');
  33  |     const scroller = matchMedia('(max-width: 768px), (pointer: coarse)').matches ? element.closest('.site-shell') : window;
  34  |     const current = scroller === window ? scrollY : scroller.scrollTop;
  35  |     const start = element.getBoundingClientRect().top + current - (parseFloat(getComputedStyle(stage).top) || 0);
  36  |     const range = element.offsetHeight - stage.offsetHeight;
  37  |     return Math.abs(Number(element.style.getPropertyValue('--tower-progress')) * range - (current - start));
  38  |   })).toBeLessThan(.05);
  39  | }
  40  | 
  41  | test('rendered blocks and DOM profiles reach zero together, including reverse seeks', async ({ page }, info) => {
  42  |   await page.setViewportSize({ width: 1440, height: 1000 });
  43  |   await page.goto('/team');
  44  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  45  |   await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  46  |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  47  |   await seek(page, memberProgress(0, site.team.length));
  48  |   await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  49  |   const held = await page.locator('.tower-profile').boundingBox();
  50  |   expect(held.width).toBeGreaterThan(1300);
  51  |   const size = () => page.evaluate(() => {
  52  |     const blocks = window.__towerView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  53  |     const matrix = blocks.matrix.clone(); blocks.getMatrixAt(0, matrix);
  54  |     return Math.hypot(...matrix.elements.slice(0, 3));
  55  |   });
  56  |   const fullSize = await size();
  57  |   let previous = fullSize;
  58  |   for (const local of [.82, .88, .94, .975]) {
  59  |     await seek(page, (TOWER_INTRO + local) / duration);
  60  |     const current = await size();
  61  |     expect(current).toBeLessThan(previous); expect(current).toBeGreaterThan(0);
  62  |     const opacity = await page.locator('.tower-profile').evaluate(element => Number(element.style.opacity));
  63  |     expect(opacity).toBeCloseTo(current / fullSize, 4);
  64  |     previous = current;
  65  |   }
  66  |   for (const local of [.99, 1.01, .99]) {
  67  |     await seek(page, (TOWER_INTRO + local) / duration);
  68  |     expect(await size()).toBe(0);
> 69  |     await expect(page.locator('.tower-profile')).toBeHidden();
      |                                                  ^ Error: expect(locator).toBeHidden() failed
  70  |   }
  71  |   await seek(page, (TOWER_INTRO + .9) / duration);
  72  |   expect(await size()).toBeGreaterThan(0);
  73  |   await expect(page.locator('.tower-profile')).toBeVisible();
  74  |   await page.screenshot({ path: info.outputPath('tower-exit.png') });
  75  |   await seek(page, memberProgress(0, site.team.length));
  76  |   await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  77  | });
  78  | 
  79  | test.describe('low-end touch devices', () => {
  80  |   test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  81  |   test('cap resolution, sleep while idle, resize and release GPU resources on context loss', async ({ page }) => {
  82  |     const errors = []; page.on('pageerror', error => errors.push(error.message));
  83  |     await page.addInitScript(() => {
  84  |       Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
  85  |       Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
  86  |     });
  87  |     await page.goto('/team');
  88  |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  89  |     await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  90  |     await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  91  |     const metrics = () => page.evaluate(() => {
  92  |       const { renderer, scene } = window.__towerView;
  93  |       const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  94  |       return { ratio: renderer.getPixelRatio(), pixels: renderer.domElement.width * renderer.domElement.height,
  95  |         shadows: renderer.shadowMap.enabled, bump: Boolean(blocks.material.bumpMap), frame: renderer.info.render.frame };
  96  |     });
  97  |     await expect.poll(() => page.evaluate(() => Boolean(window.__towerView))).toBe(true);
  98  |     const initial = await metrics();
  99  |     expect(initial.ratio).toBeGreaterThanOrEqual(.5);
  100 |     expect(initial.ratio).toBeLessThanOrEqual(1); expect(initial.pixels).toBeLessThanOrEqual(450_000);
  101 |     expect(initial.shadows).toBe(false); expect(initial.bump).toBe(false);
  102 |     await expect.poll(async () => {
  103 |       const before = (await metrics()).frame; await page.waitForTimeout(200);
  104 |       return (await metrics()).frame === before;
  105 |     }, { timeout: 10_000 }).toBe(true);
  106 |     await seek(page, memberProgress(2, site.team.length));
  107 |     await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  108 |     expect((await metrics()).frame).toBeGreaterThan(initial.frame);
  109 |     await page.setViewportSize({ width: 844, height: 390 });
  110 |     await seek(page, memberProgress(2, site.team.length));
  111 |     expect((await metrics()).pixels).toBeLessThanOrEqual(450_000);
  112 |     expect((await metrics()).shadows).toBe(false);
  113 |     for (let i = 0; i < 2; i++) {
  114 |       await page.emulateMedia({ reducedMotion: 'reduce' });
  115 |       await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
  116 |       expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  117 |       await page.emulateMedia({ reducedMotion: 'no-preference' });
  118 |       await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
  119 |       await expect(page.locator('.people-tower__labels')).toHaveCount(1);
  120 |     }
  121 |     await page.locator('.people-tower__world canvas').dispatchEvent('webglcontextlost');
  122 |     await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  123 |     await expect(page.locator('.people-tower__world canvas, .people-tower__labels')).toHaveCount(0);
  124 |     expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  125 |     expect(errors).toEqual([]);
  126 |   });
  127 | });
  128 | 
  129 | test('a failure partway through mounting removes the scene and releases its resources', async ({ page }) => {
  130 |   await page.goto('/team');
  131 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  132 |   await page.evaluate(() => {
  133 |     const dispatch = window.__THREE_DEVTOOLS__.dispatchEvent;
  134 |     window.__THREE_DEVTOOLS__.dispatchEvent = event => {
  135 |       dispatch(event);
  136 |       if (event.detail?.isWebGLRenderer) event.detail.compileAsync = async () => { throw new Error('Simulated compilation failure'); };
  137 |     };
  138 |   });
  139 |   await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  140 |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  141 |   await expect(page.locator('.people-tower__world canvas, .people-tower__labels')).toHaveCount(0);
  142 |   expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  143 |   await page.getByRole('button', { name: 'Back to Quick view' }).click();
  144 |   await expect(page.getByLabel('Find a team member').locator('option')).toHaveCount(site.team.length);
  145 | });
  146 | 
```