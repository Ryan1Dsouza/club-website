# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interaction-adaptive.spec.mjs >> a capable tower keeps its detail, then reduces geometry, lighting and resolution under sustained stalls
- Location: tests\browser\interaction-adaptive.spec.mjs:6:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
                      - generic: NUCLEUS / SJEC
                      - generic: +
                      - generic:
                        - paragraph
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
                - generic [ref=e28]: —
                - generic [ref=e29]: / 15
              - generic [ref=e30]:
                - generic [ref=e31]: Jump to a member
                - combobox "Jump to a member" [ref=e32]:
                  - option "Meet the members" [disabled] [selected]
                  - option "Poorvik Kuthyala"
                  - option "Dinol Castelino"
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
  3   | 
  4   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5   | 
  6   | test('a capable tower keeps its detail, then reduces geometry, lighting and resolution under sustained stalls', async ({ page }, info) => {
  7   |   await page.setViewportSize({ width: 800, height: 600 });
  8   |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  9   |   await page.addInitScript(() => {
  10  |     Object.defineProperty(navigator, 'hardwareConcurrency', { value: 12 });
  11  |     Object.defineProperty(navigator, 'deviceMemory', { value: 8 });
  12  |     const nativeRAF = requestAnimationFrame;
  13  |     window.requestAnimationFrame = callback => {
  14  |       const requested = performance.now();
  15  |       const tick = time => {
  16  |         if (window.slowTower && time - requested < 110) return nativeRAF(tick);
  17  |         callback(time);
  18  |       };
  19  |       return nativeRAF(tick);
  20  |     };
  21  |     window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
  22  |       if (!renderer?.isWebGLRenderer) return;
  23  |       const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer);
  24  |       renderer.render = (scene, camera) => { render(scene, camera); window.towerView = { renderer, scene, camera }; };
  25  |       renderer.dispose = () => { dispose(); window.disposedMemory = { ...renderer.info.memory }; };
  26  |     } };
  27  |   });
  28  |   await page.goto('/team');
  29  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  30  |   await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  31  |   const world = page.locator('.people-tower__world');
  32  |   await expect(world).toHaveAttribute('data-quality', '2');
  33  |   const metrics = () => page.evaluate(() => {
  34  |     const { renderer, scene } = window.towerView;
  35  |     const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  36  |     return { triangles: renderer.info.render.triangles, pixels: renderer.domElement.width * renderer.domElement.height,
  37  |       material: blocks.material.type, shadows: renderer.shadowMap.enabled, antialias: renderer.getContext().getContextAttributes().antialias };
  38  |   });
  39  |   await expect.poll(() => page.evaluate(() => Boolean(window.towerView))).toBe(true);
  40  |   const high = await metrics();
> 41  |   expect(high.shadows).toBe(true);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  42  |   expect(high.antialias).toBe(true);
  43  |   expect(high.material).toBe('MeshStandardMaterial');
  44  |   await page.screenshot({ path: info.outputPath('high-detail.png') });
  45  |   const point = await page.evaluate(async () => {
  46  |     const THREE = await import('/node_modules/three/build/three.module.js');
  47  |     const { renderer, scene, camera } = window.towerView;
  48  |     const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  49  |     const matrix = new THREE.Matrix4(); blocks.getMatrixAt(12, matrix);
  50  |     const point = new THREE.Vector3(0, 0, .501).applyMatrix4(matrix).project(camera);
  51  |     const rect = renderer.domElement.getBoundingClientRect();
  52  |     return { x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 };
  53  |   });
  54  |   await page.mouse.move(point.x, point.y); await page.mouse.down();
  55  |   await expect(world).toHaveAttribute('data-dragging', 'true');
  56  |   await page.evaluate(() => { window.slowTower = true; });
  57  |   await expect(world).toHaveAttribute('data-quality', '0', { timeout: 15000 });
  58  |   await expect.poll(async () => (await metrics()).pixels).toBeLessThan(high.pixels * .5);
  59  |   const low = await metrics();
  60  |   expect(low.triangles).toBeLessThan(high.triangles * .15);
  61  |   expect(low.material).toBe('MeshLambertMaterial');
  62  |   expect(low.shadows).toBe(false);
  63  |   await expect(world).toHaveAttribute('data-dragging', 'true');
  64  |   await page.evaluate(() => { window.slowTower = false; });
  65  |   await page.mouse.up();
  66  |   await page.getByRole('button', { name: 'Rebuild tower' }).click();
  67  |   await page.getByLabel('Jump to a member').selectOption('1');
  68  |   await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  69  |   await page.screenshot({ path: info.outputPath('low-detail-profile.png') });
  70  |   await page.getByRole('button', { name: 'Back to Quick view' }).click();
  71  |   expect(await page.evaluate(() => window.disposedMemory)).toEqual({ geometries: 0, textures: 0 });
  72  | });
  73  | 
  74  | test('an extreme phone uses a small pooled ripple with no layout work during bursts', async ({ browser }) => {
  75  |   const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  76  |   try {
  77  |     const page = await context.newPage();
  78  |     await page.addInitScript(() => {
  79  |       Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });
  80  |       Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
  81  |     });
  82  |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  83  |     await page.goto('/');
  84  |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  85  |     const ripple = page.locator('.background-ripple-effect');
  86  |     const result = await ripple.evaluate(async root => {
  87  |       const canvas = root.querySelector('canvas');
  88  |       let peak = 0, added = 0;
  89  |       const observer = new MutationObserver(records => records.forEach(record => { added += record.addedNodes.length; }));
  90  |       observer.observe(root, { subtree: true, childList: true });
  91  |       for (let i = 0; i < 12; i++) {
  92  |         root.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100 + i % 3 * 56, clientY: 250 }));
  93  |         peak = Math.max(peak, Number(root.dataset.activeWaves));
  94  |         await new Promise(resolve => setTimeout(resolve, 130));
  95  |       }
  96  |       observer.disconnect();
  97  |       return { pixels: canvas.width * canvas.height, peak, added, sameCanvas: canvas === root.querySelector('canvas') };
  98  |     });
  99  |     expect(result.pixels).toBeLessThan(200_000);
  100 |     expect(result).toMatchObject({ peak: 1, added: 0, sameCanvas: true });
  101 |     await expect(ripple).toHaveAttribute('data-active-waves', '0');
  102 |   } finally { await context.close(); }
  103 | });
  104 | 
```