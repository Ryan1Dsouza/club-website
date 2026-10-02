# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-performance.spec.mjs >> a failure partway through mounting removes the scene and releases its resources
- Location: tests\browser\people-tower-performance.spec.mjs:123:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.people-roster__member')
Expected: 15
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('.people-roster__member') with timeout 5000ms
  - waiting for locator('.people-roster__member')
    14 × locator resolved to 0 elements
       - unexpected value "0"

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
                      - generic: x
                      - generic: p
                      - generic: e
                      - generic: r
                      - generic: i
                      - generic: e
                      - generic: "n"
                      - generic: c
                      - generic: e
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
      - heading "The people behind Nucleus" [level=1] [ref=e13]
      - generic [ref=e15]:
        - generic [ref=e17]: 02 / The people
        - generic [aria-hidden]:
          - paragraph:
            - text: The
            - emphasis: whole team.
          - generic: Meet everyone
```

# Test source

```ts
  32  |     const range = element.offsetHeight - stage.offsetHeight;
  33  |     return Math.abs(Number(element.style.getPropertyValue('--tower-progress')) * range - (scrollY - start));
  34  |   })).toBeLessThan(.05);
  35  | }
  36  | 
  37  | test('rendered blocks and DOM profiles reach zero together, including reverse seeks', async ({ page }, info) => {
  38  |   await page.setViewportSize({ width: 1440, height: 1000 });
  39  |   await page.goto('/team');
  40  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  41  |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  42  |   await seek(page, memberProgress(0, site.team.length));
  43  |   await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  44  |   const held = await page.locator('.tower-profile').boundingBox();
  45  |   expect(held.width).toBeGreaterThan(1300);
  46  |   const size = () => page.evaluate(() => {
  47  |     const blocks = window.__towerView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  48  |     const matrix = blocks.matrix.clone(); blocks.getMatrixAt(0, matrix);
  49  |     return Math.hypot(...matrix.elements.slice(0, 3));
  50  |   });
  51  |   const fullSize = await size();
  52  |   let previous = fullSize;
  53  |   for (const local of [.82, .88, .94, .975]) {
  54  |     await seek(page, (TOWER_INTRO + local) / duration);
  55  |     const current = await size();
  56  |     expect(current).toBeLessThan(previous); expect(current).toBeGreaterThan(0);
  57  |     const opacity = await page.locator('.tower-profile').evaluate(element => Number(element.style.opacity));
  58  |     expect(opacity).toBeCloseTo(current / fullSize, 4);
  59  |     previous = current;
  60  |   }
  61  |   for (const local of [.99, 1.01, .99]) {
  62  |     await seek(page, (TOWER_INTRO + local) / duration);
  63  |     expect(await size()).toBe(0);
  64  |     await expect(page.locator('.tower-profile')).toBeHidden();
  65  |   }
  66  |   await seek(page, (TOWER_INTRO + .9) / duration);
  67  |   expect(await size()).toBeGreaterThan(0);
  68  |   await expect(page.locator('.tower-profile')).toBeVisible();
  69  |   await page.screenshot({ path: info.outputPath('tower-exit.png') });
  70  |   await seek(page, memberProgress(0, site.team.length));
  71  |   await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  72  | });
  73  | 
  74  | test.describe('low-end touch devices', () => {
  75  |   test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  76  |   test('cap resolution, sleep while idle, resize and release GPU resources on context loss', async ({ page }) => {
  77  |     const errors = []; page.on('pageerror', error => errors.push(error.message));
  78  |     await page.addInitScript(() => {
  79  |       Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
  80  |       Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
  81  |     });
  82  |     await page.goto('/team');
  83  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  84  |     await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  85  |     const metrics = () => page.evaluate(() => {
  86  |       const { renderer, scene } = window.__towerView;
  87  |       const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  88  |       return { ratio: renderer.getPixelRatio(), pixels: renderer.domElement.width * renderer.domElement.height,
  89  |         shadows: renderer.shadowMap.enabled, bump: Boolean(blocks.material.bumpMap), frame: renderer.info.render.frame };
  90  |     });
  91  |     await expect.poll(() => page.evaluate(() => Boolean(window.__towerView))).toBe(true);
  92  |     const initial = await metrics();
  93  |     expect(initial.ratio).toBeGreaterThanOrEqual(1);
  94  |     expect(initial.ratio).toBeLessThanOrEqual(1.25); expect(initial.pixels).toBeLessThanOrEqual(900_000);
  95  |     expect(initial.shadows).toBe(false); expect(initial.bump).toBe(false);
  96  |     await expect.poll(async () => {
  97  |       const before = (await metrics()).frame; await page.waitForTimeout(200);
  98  |       return (await metrics()).frame === before;
  99  |     }, { timeout: 10_000 }).toBe(true);
  100 |     await seek(page, memberProgress(2, site.team.length));
  101 |     await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  102 |     expect((await metrics()).frame).toBeGreaterThan(initial.frame);
  103 |     await page.setViewportSize({ width: 844, height: 390 });
  104 |     await seek(page, memberProgress(2, site.team.length));
  105 |     expect((await metrics()).pixels).toBeLessThanOrEqual(900_000);
  106 |     expect((await metrics()).shadows).toBe(false);
  107 |     for (let i = 0; i < 2; i++) {
  108 |       await page.emulateMedia({ reducedMotion: 'reduce' });
  109 |       await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
  110 |       expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  111 |       await page.emulateMedia({ reducedMotion: 'no-preference' });
  112 |       await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
  113 |       await expect(page.locator('.people-tower__labels')).toHaveCount(1);
  114 |     }
  115 |     await page.locator('.people-tower__world canvas').dispatchEvent('webglcontextlost');
  116 |     await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  117 |     await expect(page.locator('.people-tower__world canvas, .people-tower__labels')).toHaveCount(0);
  118 |     expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
  119 |     expect(errors).toEqual([]);
  120 |   });
  121 | });
  122 | 
  123 | test('a failure partway through mounting removes the scene and releases its resources', async ({ page }) => {
  124 |   await page.addInitScript(() => {
  125 |     window.IntersectionObserver = class { constructor() { throw new Error('Simulated setup failure'); } };
  126 |   });
  127 |   await page.goto('/team');
  128 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  129 |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'fallback');
  130 |   await expect(page.locator('.people-tower__world canvas, .people-tower__labels')).toHaveCount(0);
  131 |   expect(await page.evaluate(() => window.__towerDisposed)).toEqual({ geometries: 0, textures: 0 });
> 132 |   await expect(page.locator('.people-roster__member')).toHaveCount(site.team.length);
      |                                                        ^ Error: expect(locator).toHaveCount(expected) failed
  133 | });
  134 | 
```