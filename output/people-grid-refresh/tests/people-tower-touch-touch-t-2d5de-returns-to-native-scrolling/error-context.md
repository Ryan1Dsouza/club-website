# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> touch tower at 390x844 >> play mode accepts vertical touch throws and returns to native scrolling
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
    13 × locator resolved to <canvas width="390" height="844" data-engine="three.js r180"></canvas>
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
            - generic: 02 / The people
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
  33  |     const face = new THREE.Vector3(0, 0, .501).applyMatrix4(matrix).project(camera);
  34  |     const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(face.x, face.y), camera);
  35  |     const hit = ray.intersectObject(blocks)[0];
  36  |     if (!hit) throw new Error('The test block must be visible from the initial camera');
  37  |     blocks.getMatrixAt(hit.instanceId, matrix);
  38  |     const rect = renderer.domElement.getBoundingClientRect();
  39  |     return { index: hit.instanceId, position: matrix.elements.slice(12, 15),
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
  115 |       const world = page.locator('.people-tower__world');
  116 |       await page.getByRole('button', { name: 'Drag & throw' }).tap();
  117 |       await expect(world.locator('canvas')).toHaveCSS('touch-action', 'none');
  118 |       const block = await blockPoint(page);
  119 |       const cdp = await page.context().newCDPSession(page);
  120 |       const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] });
  121 |       await touch('touchStart', block);
  122 |       for (let step = 1; step <= 8; step++) {
  123 |         await touch('touchMove', { x: block.x + step * 3, y: block.y - step * 8 });
  124 |         await page.evaluate(() => new Promise(requestAnimationFrame));
  125 |       }
  126 |       await expect(world).toHaveAttribute('data-dragging', 'true');
  127 |       expect(await page.evaluate(() => scrollY)).toBe(0);
  128 |       await touch('touchEnd');
  129 |       await expect(world).not.toHaveAttribute('data-dragging');
  130 |       await expect.poll(() => displacement(page, block)).toBeGreaterThan(.5);
  131 |       await page.screenshot({ path: info.outputPath('throw.png') });
  132 |       await page.getByRole('button', { name: 'Scroll to explore' }).tap();
> 133 |       await expect(world.locator('canvas')).toHaveCSS('touch-action', 'pan-y');
      |                                             ^ Error: expect(locator).toHaveCSS(expected) failed
  134 |       await page.getByRole('button', { name: 'Rebuild tower' }).tap();
  135 |       await touch('touchStart', { x: viewport.width / 2, y: viewport.height * .65 });
  136 |       for (let step = 1; step <= 10; step++) await touch('touchMove', { x: viewport.width / 2, y: viewport.height * .65 - step * 12 });
  137 |       await touch('touchEnd');
  138 |       await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(50);
  139 |       await cdp.detach();
  140 |     });
  141 | 
  142 |     test('scrolling reveals a flung block from its visible position and tilt', async ({ page }, info) => {
  143 |       await openTower(page);
  144 |       const flung = await blockPoint(page, 0);
  145 |       await page.touchscreen.tap(flung.x, flung.y);
  146 |       await expect.poll(() => displacement(page, flung)).toBeGreaterThan(2);
  147 |       // Compare actual rendered instance matrices across the exact handoff frame.
  148 |       await page.evaluate(index => {
  149 |         const { renderer } = window.__towerTouchView, render = renderer.render.bind(renderer);
  150 |         window.__handoff = { before: null, first: null };
  151 |         renderer.render = (scene, camera) => {
  152 |           const audit = window.__handoff;
  153 |           if (!audit.first) {
  154 |             const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  155 |             const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  156 |             if (Number(renderer.domElement.parentElement.dataset.activeMember) === index) audit.first = matrix.toArray();
  157 |             else audit.before = matrix.toArray();
  158 |           }
  159 |           render(scene, camera);
  160 |         };
  161 |       }, flung.index);
  162 |       await page.evaluate(() => new Promise(requestAnimationFrame));
  163 |       const seekStart = () => page.locator('.people-tower').evaluate((section, progress) => {
  164 |         const stage = section.querySelector('.people-tower__stage');
  165 |         const start = section.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
  166 |         window.scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  167 |       }, (TOWER_INTRO + flung.index + .003) / (TOWER_INTRO + site.team.length + TOWER_OUTRO));
  168 |       await seekStart();
  169 |       await expect.poll(() => page.evaluate(() => window.__handoff.first)).not.toBeNull();
  170 |       const handoff = await page.evaluate(() => window.__handoff);
  171 |       expect(handoff.before).not.toBeNull();
  172 |       expect(Math.hypot(...handoff.before.slice(12, 15).map((value, axis) => value - flung.position[axis]))).toBeGreaterThan(2);
  173 |       expect(Math.max(...handoff.first.map((value, axis) => Math.abs(value - handoff.before[axis])))).toBeLessThan(.05);
  174 |       await info.attach('visible-handoff', { body: JSON.stringify(handoff), contentType: 'application/json' });
  175 |       await page.screenshot({ path: info.outputPath('flung-reveal-start.png') });
  176 | 
  177 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index));
  178 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  179 |       await page.screenshot({ path: info.outputPath('flung-reveal-profile.png') });
  180 |       // Cross a member boundary before reversing: a queued tower return must
  181 |       // not replace the source of this member's already established flight.
  182 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index + 1));
  183 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  184 |       await seekStart();
  185 |       await expect.poll(() => page.evaluate(({ index, before }) => {
  186 |         const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  187 |         const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  188 |         return Math.max(...matrix.elements.map((value, axis) => Math.abs(value - before[axis])));
  189 |       }, { index: flung.index, before: handoff.before })).toBeLessThan(.05);
  190 |     });
  191 |   });
  192 | }
  193 | 
  194 | test('desktop retains click-to-pull and drag controls', async ({ page }) => {
  195 |   await page.setViewportSize({ width: 1280, height: 800 });
  196 |   await openTower(page);
  197 |   await expect(page.locator('.people-tower__hint-mouse')).toBeVisible();
  198 |   await expect(page.locator('.people-tower__hint-touch')).toBeHidden();
  199 |   const initial = await blockPoint(page);
  200 |   await page.mouse.click(initial.x, initial.y);
  201 |   await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  202 |   await page.getByRole('button', { name: 'Rebuild tower' }).click();
  203 |   await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  204 |   const dragged = await blockPoint(page);
  205 |   await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  206 |   await page.mouse.move(dragged.x + 160, dragged.y - 30, { steps: 10 });
  207 |   await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  208 |   await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  209 |   await page.mouse.up();
  210 |   await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  211 | });
  212 | 
```