# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> touch tower at 844x390 >> play mode accepts vertical touch throws and returns to native scrolling
- Location: tests\browser\people-tower-touch.spec.mjs:113:5

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.people-tower__world').locator('canvas')
Expected: "pan-y"
Received: "none"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" locator('.people-tower__world').locator('canvas') with timeout 5000ms
  - waiting for locator('.people-tower__world').locator('canvas')
    14 × locator resolved to <canvas width="844" height="390" data-engine="three.js r180"></canvas>
       - unexpected value "none"

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
      - button "Back to the team" [ref=e14] [cursor=pointer]
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
            - generic [aria-hidden]:
              - paragraph:
                - text: The
                - emphasis: whole team.
              - generic: Meet everyone
            - paragraph: Grab any block. Drag and release to throw. Switch to Scroll to explore when you’re ready.
            - generic [ref=e24]:
              - button "Scroll to explore" [active] [pressed] [ref=e25] [cursor=pointer]
              - generic [ref=e26]:
                - generic [ref=e27]: —
                - generic [ref=e28]: / 15
              - generic [ref=e29]:
                - generic [ref=e30]: Jump to a member
                - combobox "Jump to a member" [ref=e31]:
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
              - button "Rebuild tower" [ref=e32] [cursor=pointer]
```

# Test source

```ts
  40  |       x: rect.left + (face.x + 1) * rect.width / 2, y: rect.top + (1 - face.y) * rect.height / 2 };
  41  |   }, index);
  42  | }
  43  | 
  44  | async function displacement(page, block) {
  45  |   return page.evaluate(({ index, position }) => {
  46  |     const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  47  |     const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  48  |     return Math.hypot(...matrix.elements.slice(12, 15).map((value, axis) => value - position[axis]));
  49  |   }, block);
  50  | }
  51  | 
  52  | for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
  53  |   test.describe(`touch tower at ${viewport.width}x${viewport.height}`, () => {
  54  |     test.use({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  55  | 
  56  |     test('taps pull, sideways drags play, and vertical swipes keep native scrolling', async ({ page }, info) => {
  57  |       const errors = []; page.on('pageerror', error => errors.push(error.message));
  58  |       await openTower(page);
  59  |       const world = page.locator('.people-tower__world');
  60  |       await expect(world.locator('canvas')).toHaveCSS('pointer-events', 'auto');
  61  |       await expect(page.getByText('Swipe up to meet the team.', { exact: false })).toBeVisible();
  62  |       await expect(page.locator('.people-tower__hint-mouse')).toBeHidden();
  63  |       const cdp = await page.context().newCDPSession(page);
  64  |       const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', {
  65  |         type, touchPoints: point ? [{ x: point.x, y: point.y }] : [],
  66  |       });
  67  |       const rebuild = async () => {
  68  |         await page.getByRole('button', { name: 'Rebuild tower' }).tap();
  69  |         await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  70  |       };
  71  |       const initial = await blockPoint(page);
  72  |       await touch('touchStart', initial);
  73  |       await expect(world).toHaveAttribute('data-dragging', 'true');
  74  |       await touch('touchEnd');
  75  |       await expect(world).not.toHaveAttribute('data-dragging');
  76  |       await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  77  |       expect(await page.evaluate(() => scrollY)).toBe(0);
  78  |       await rebuild();
  79  | 
  80  |       const dragged = await blockPoint(page);
  81  |       await touch('touchStart', dragged);
  82  |       for (let step = 1; step <= 10; step++) {
  83  |         await touch('touchMove', { x: dragged.x + step * 10, y: dragged.y });
  84  |         await page.evaluate(() => new Promise(requestAnimationFrame));
  85  |       }
  86  |       await expect(world).toHaveAttribute('data-dragging', 'true');
  87  |       await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  88  |       expect(await page.evaluate(() => scrollY)).toBe(0);
  89  |       await page.screenshot({ path: info.outputPath('touch-drag.png') });
  90  |       await touch('touchEnd');
  91  |       await expect(world).not.toHaveAttribute('data-dragging');
  92  |       await rebuild();
  93  | 
  94  |       await touch('touchStart', await blockPoint(page));
  95  |       await expect(world).toHaveAttribute('data-dragging', 'true');
  96  |       await touch('touchCancel');
  97  |       await expect(world).not.toHaveAttribute('data-dragging');
  98  |       await rebuild();
  99  | 
  100 |       const swiped = await blockPoint(page);
  101 |       await touch('touchStart', swiped);
  102 |       for (let step = 1; step <= 10; step++) {
  103 |         await touch('touchMove', { x: swiped.x, y: swiped.y - step * 15 });
  104 |         await page.evaluate(() => new Promise(requestAnimationFrame));
  105 |       }
  106 |       await touch('touchEnd');
  107 |       await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(80);
  108 |       await expect(world).not.toHaveAttribute('data-dragging');
  109 |       expect(errors).toEqual([]);
  110 |       await cdp.detach();
  111 |     });
  112 | 
  113 |     test('play mode accepts vertical touch throws and returns to native scrolling', async ({ page }, info) => {
  114 |       await openTower(page);
  115 |       await page.evaluate(() => {
  116 |         window.__modeEvents = [];
  117 |         for (const type of ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend']) document.addEventListener(type, event => {
  118 |           window.__modeEvents.push({ type, target: event.target.className, text: event.target.textContent?.slice(0, 35), time: performance.now() });
  119 |         }, true);
  120 |       });
  121 |       const world = page.locator('.people-tower__world');
  122 |       await page.getByRole('button', { name: 'Drag & throw' }).tap();
  123 |       await expect(world.locator('canvas')).toHaveCSS('touch-action', 'none');
  124 |       const block = await blockPoint(page);
  125 |       const cdp = await page.context().newCDPSession(page);
  126 |       const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] });
  127 |       await touch('touchStart', block);
  128 |       for (let step = 1; step <= 8; step++) {
  129 |         await touch('touchMove', { x: block.x + step * 3, y: block.y - step * 8 });
  130 |         await page.evaluate(() => new Promise(requestAnimationFrame));
  131 |       }
  132 |       await expect(world).toHaveAttribute('data-dragging', 'true');
  133 |       expect(await page.evaluate(() => scrollY)).toBe(0);
  134 |       await touch('touchEnd');
  135 |       await expect(world).not.toHaveAttribute('data-dragging');
  136 |       await expect.poll(() => displacement(page, block)).toBeGreaterThan(.5);
  137 |       await page.screenshot({ path: info.outputPath('throw.png') });
  138 |       await page.getByRole('button', { name: 'Scroll to explore' }).tap();
  139 |       await info.attach('touch-events', { body: JSON.stringify(await page.evaluate(() => window.__modeEvents)), contentType: 'application/json' });
> 140 |       await expect(world.locator('canvas')).toHaveCSS('touch-action', 'pan-y');
      |                                             ^ Error: expect(locator).toHaveCSS(expected) failed
  141 |       await page.getByRole('button', { name: 'Rebuild tower' }).tap();
  142 |       await touch('touchStart', { x: viewport.width / 2, y: viewport.height * .65 });
  143 |       for (let step = 1; step <= 10; step++) await touch('touchMove', { x: viewport.width / 2, y: viewport.height * .65 - step * 12 });
  144 |       await touch('touchEnd');
  145 |       await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(50);
  146 |       await cdp.detach();
  147 |     });
  148 | 
  149 |     test('scrolling reveals a flung block from its visible position and tilt', async ({ page }, info) => {
  150 |       await openTower(page);
  151 |       const flung = await blockPoint(page, 0);
  152 |       await page.touchscreen.tap(flung.x, flung.y);
  153 |       await expect.poll(() => displacement(page, flung)).toBeGreaterThan(2);
  154 |       // Compare actual rendered instance matrices across the exact handoff frame.
  155 |       await page.evaluate(index => {
  156 |         const { renderer } = window.__towerTouchView, render = renderer.render.bind(renderer);
  157 |         window.__handoff = { before: null, first: null };
  158 |         renderer.render = (scene, camera) => {
  159 |           const audit = window.__handoff;
  160 |           if (!audit.first) {
  161 |             const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  162 |             const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  163 |             if (Number(renderer.domElement.parentElement.dataset.activeMember) === index) audit.first = matrix.toArray();
  164 |             else audit.before = matrix.toArray();
  165 |           }
  166 |           render(scene, camera);
  167 |         };
  168 |       }, flung.index);
  169 |       await page.evaluate(() => new Promise(requestAnimationFrame));
  170 |       const seekStart = () => page.locator('.people-tower').evaluate((section, progress) => {
  171 |         const stage = section.querySelector('.people-tower__stage');
  172 |         const start = section.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
  173 |         window.scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  174 |       }, (TOWER_INTRO + flung.index + .003) / (TOWER_INTRO + site.team.length + TOWER_OUTRO));
  175 |       await seekStart();
  176 |       await expect.poll(() => page.evaluate(() => window.__handoff.first)).not.toBeNull();
  177 |       const handoff = await page.evaluate(() => window.__handoff);
  178 |       expect(handoff.before).not.toBeNull();
  179 |       expect(Math.hypot(...handoff.before.slice(12, 15).map((value, axis) => value - flung.position[axis]))).toBeGreaterThan(2);
  180 |       expect(Math.max(...handoff.first.map((value, axis) => Math.abs(value - handoff.before[axis])))).toBeLessThan(.05);
  181 |       await info.attach('visible-handoff', { body: JSON.stringify(handoff), contentType: 'application/json' });
  182 |       await page.screenshot({ path: info.outputPath('flung-reveal-start.png') });
  183 | 
  184 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index));
  185 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  186 |       await page.screenshot({ path: info.outputPath('flung-reveal-profile.png') });
  187 |       // Cross a member boundary before reversing: a queued tower return must
  188 |       // not replace the source of this member's already established flight.
  189 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index + 1));
  190 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  191 |       await seekStart();
  192 |       await expect.poll(() => page.evaluate(({ index, before }) => {
  193 |         const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  194 |         const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  195 |         return Math.max(...matrix.elements.map((value, axis) => Math.abs(value - before[axis])));
  196 |       }, { index: flung.index, before: handoff.before })).toBeLessThan(.05);
  197 |     });
  198 |   });
  199 | }
  200 | 
  201 | test('desktop retains click-to-pull and drag controls', async ({ page }) => {
  202 |   await page.setViewportSize({ width: 1280, height: 800 });
  203 |   await openTower(page);
  204 |   await expect(page.locator('.people-tower__hint-mouse')).toBeVisible();
  205 |   await expect(page.locator('.people-tower__hint-touch')).toBeHidden();
  206 |   const initial = await blockPoint(page);
  207 |   await page.mouse.click(initial.x, initial.y);
  208 |   await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  209 |   await page.getByRole('button', { name: 'Rebuild tower' }).click();
  210 |   await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  211 |   const dragged = await blockPoint(page);
  212 |   await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  213 |   await page.mouse.move(dragged.x + 160, dragged.y - 30, { steps: 10 });
  214 |   await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  215 |   await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  216 |   await page.mouse.up();
  217 |   await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  218 | });
  219 | 
```