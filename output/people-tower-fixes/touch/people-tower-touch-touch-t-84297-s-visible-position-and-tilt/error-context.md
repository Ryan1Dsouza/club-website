# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> touch tower at 390x844 >> scrolling reveals a flung block from its visible position and tilt
- Location: tests\browser\people-tower-touch.spec.mjs:151:5

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.tower-profile')
Expected: "1"
Received: "0"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" locator('.tower-profile') with timeout 5000ms
  - waiting for locator('.tower-profile')
    5 × locator resolved to <div draggable="false" class="tower-profile" data-has-photo="true">…</div>
      - unexpected value "0"
    8 × locator resolved to <div draggable="false" class="tower-profile">…</div>
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
                      - generic: v
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
                - listitem:
                  - link:
                    - /url: /news
                    - generic [aria-hidden]:
                      - generic: L
                      - generic: i
                      - generic: v
                      - generic: e
                      - generic: "N"
                      - generic: e
                      - generic: w
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
                    - /url: /achievements
                    - generic [aria-hidden]:
                      - generic: A
                      - generic: c
                      - generic: h
                      - generic: i
                      - generic: e
                      - generic: v
                      - generic: e
                      - generic: m
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
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
    - generic [ref=e12]:
      - heading "The people behind Nucleus" [level=1] [ref=e13]
      - button "Back to the team" [ref=e15] [cursor=pointer]
      - region "Interactive team tower" [ref=e19]:
        - generic [ref=e21]:
          - generic [aria-hidden] [ref=e22]:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: NUCLEUS / SJEC
                    - generic:
                      - paragraph
                    - generic:
                      - generic: The people / Nucleus
                      - generic: Keep scrolling ↗
          - generic [aria-hidden]:
            - paragraph:
              - text: The
              - emphasis: whole team.
            - generic: Keep throwing, or scroll back to revisit.
          - paragraph: Grab any block. Drag and release to throw. Swipe on the background to meet the team.
          - generic [ref=e24]:
            - generic [ref=e25]:
              - generic [ref=e26]: Jump to a member
              - combobox "Jump to a member" [ref=e27]:
                - option "Meet the members" [disabled] [selected]
                - option "Deona Rego"
                - option "Dinol Castelino"
                - option "Joylin Mathias"
                - option "Karthik"
                - option "Manvitha Lewis"
                - option "Mohit"
                - option "Navya Suvarna"
                - option "Nikhitha Dsouza"
                - option "Nishanth Uday Naik"
                - option "Poorvik Kuthyala"
                - option "Prajwal Gaonkar"
                - option "Rakshith Dsouza"
                - option "Salim Pallikal"
                - option "Aisahath Saniya"
                - option "Sweedan Cardoza"
            - button "Rebuild tower" [ref=e28] [cursor=pointer]
```

# Test source

```ts
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
  100 |       const swiped = { x: 20, y: viewport.height * .65 };
  101 |       await touch('touchStart', swiped);
  102 |       for (let step = 1; step <= 10; step++) {
  103 |         await touch('touchMove', { x: swiped.x, y: swiped.y - step * 15 });
  104 |         await page.evaluate(() => new Promise(requestAnimationFrame));
  105 |       }
  106 |       await touch('touchEnd');
  107 |       await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeGreaterThan(.01);
  108 |       expect(await page.evaluate(() => scrollY)).toBe(0);
  109 |       await expect(world).not.toHaveAttribute('data-dragging');
  110 |       expect(errors).toEqual([]);
  111 |       await cdp.detach();
  112 |     });
  113 | 
  114 |     test('vertical touch throws and background exploration work without a mode toggle', async ({ page }, info) => {
  115 |       await openTower(page);
  116 |       await page.evaluate(() => {
  117 |         window.__modeEvents = [];
  118 |         for (const type of ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend']) document.addEventListener(type, event => {
  119 |           window.__modeEvents.push({ type, target: event.target.className, text: event.target.textContent?.slice(0, 35), time: performance.now() });
  120 |         }, true);
  121 |       });
  122 |       const world = page.locator('.people-tower__world');
  123 |       await expect(page.locator('.people-tower__hud button')).toHaveCount(1);
  124 |       await expect(page.getByRole('button', { name: 'Scroll to explore' })).toHaveCount(0);
  125 |       await expect(world.locator('canvas')).toHaveCSS('touch-action', 'none');
  126 |       const block = await blockPoint(page);
  127 |       const cdp = await page.context().newCDPSession(page);
  128 |       const touch = (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: point ? [{ x: point.x, y: point.y }] : [] });
  129 |       await touch('touchStart', block);
  130 |       for (let step = 1; step <= 8; step++) {
  131 |         await touch('touchMove', { x: block.x + step * 3, y: block.y - step * 8 });
  132 |         await page.evaluate(() => new Promise(requestAnimationFrame));
  133 |       }
  134 |       await expect(world).toHaveAttribute('data-dragging', 'true');
  135 |       expect(await page.evaluate(() => scrollY)).toBe(0);
  136 |       await touch('touchEnd');
  137 |       await expect(world).not.toHaveAttribute('data-dragging');
  138 |       await expect.poll(() => displacement(page, block)).toBeGreaterThan(.5);
  139 |       await page.screenshot({ path: info.outputPath('throw.png') });
  140 |       await info.attach('touch-events', { body: JSON.stringify(await page.evaluate(() => window.__modeEvents)), contentType: 'application/json' });
  141 |       await expect(world.locator('canvas')).toHaveCSS('touch-action', 'none');
  142 |       await page.getByRole('button', { name: 'Rebuild tower' }).tap();
  143 |       await touch('touchStart', { x: 20, y: viewport.height * .65 });
  144 |       for (let step = 1; step <= 10; step++) await touch('touchMove', { x: 20, y: viewport.height * .65 - step * 12 });
  145 |       await touch('touchEnd');
  146 |       await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeGreaterThan(.01);
  147 |       expect(await page.evaluate(() => scrollY)).toBe(0);
  148 |       await cdp.detach();
  149 |     });
  150 | 
  151 |     test('scrolling reveals a flung block from its visible position and tilt', async ({ page }, info) => {
  152 |       await openTower(page);
  153 |       const flung = await blockPoint(page, 0);
  154 |       await page.touchscreen.tap(flung.x, flung.y);
  155 |       await expect.poll(() => displacement(page, flung)).toBeGreaterThan(2);
  156 |       // Compare actual rendered instance matrices across the exact handoff frame.
  157 |       await page.evaluate(index => {
  158 |         const { renderer } = window.__towerTouchView, render = renderer.render.bind(renderer);
  159 |         window.__handoff = { before: null, first: null };
  160 |         renderer.render = (scene, camera) => {
  161 |           const audit = window.__handoff;
  162 |           if (!audit.first) {
  163 |             const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  164 |             const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  165 |             if (Number(renderer.domElement.parentElement.dataset.activeMember) === index) audit.first = matrix.toArray();
  166 |             else audit.before = matrix.toArray();
  167 |           }
  168 |           render(scene, camera);
  169 |         };
  170 |       }, flung.index);
  171 |       await page.evaluate(() => new Promise(requestAnimationFrame));
  172 |       const seekStart = () => page.locator('.people-tower').evaluate((section, { progress, count }) => {
  173 |         const stage = section.querySelector('.people-tower__stage');
  174 |         const current = Number(section.style.getPropertyValue('--tower-progress'));
  175 |         stage.dispatchEvent(new WheelEvent('wheel', { deltaY: (progress - current) * stage.clientHeight * (count * .55 + .2), bubbles: true, cancelable: true }));
  176 |       }, { progress: (TOWER_INTRO + flung.index + .003) / (TOWER_INTRO + site.team.length + TOWER_OUTRO), count: site.team.length });
  177 |       await seekStart();
  178 |       await expect.poll(() => page.evaluate(() => window.__handoff.first)).not.toBeNull();
  179 |       const handoff = await page.evaluate(() => window.__handoff);
  180 |       expect(handoff.before).not.toBeNull();
  181 |       expect(Math.hypot(...handoff.before.slice(12, 15).map((value, axis) => value - flung.position[axis]))).toBeGreaterThan(2);
  182 |       expect(Math.max(...handoff.first.map((value, axis) => Math.abs(value - handoff.before[axis])))).toBeLessThan(.05);
  183 |       await info.attach('visible-handoff', { body: JSON.stringify(handoff), contentType: 'application/json' });
  184 |       await page.screenshot({ path: info.outputPath('flung-reveal-start.png') });
  185 | 
  186 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index));
> 187 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
      |                                                    ^ Error: expect(locator).toHaveCSS(expected) failed
  188 |       await page.screenshot({ path: info.outputPath('flung-reveal-profile.png') });
  189 |       // Cross a member boundary before reversing: a queued tower return must
  190 |       // not replace the source of this member's already established flight.
  191 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index + 1));
  192 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  193 |       await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress'))))
  194 |         .toBeCloseTo(memberProgress(flung.index + 1, site.team.length), 6);
  195 |       await seekStart();
  196 |       await expect.poll(() => page.evaluate(({ index, before }) => {
  197 |         const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  198 |         const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  199 |         return Math.max(...matrix.elements.map((value, axis) => Math.abs(value - before[axis])));
  200 |       }, { index: flung.index, before: handoff.before })).toBeLessThan(.05);
  201 |     });
  202 | 
  203 |     test('the viewport stays fixed at both timeline ends, survives rotation, and unlocks on exit', async ({ page }) => {
  204 |       await openTower(page);
  205 |       const timeline = () => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')));
  206 |       const coverage = async () => {
  207 |         const bounds = await page.locator('.people-tower__stage').evaluate(el => ({ top: el.getBoundingClientRect().top,
  208 |           width: el.clientWidth, height: el.clientHeight, viewportWidth: innerWidth, viewportHeight: innerHeight,
  209 |           pageWidth: document.documentElement.scrollWidth, scroll: scrollY }));
  210 |         expect(bounds).toEqual({ top: 0, width: bounds.viewportWidth, height: bounds.viewportHeight,
  211 |           viewportWidth: bounds.viewportWidth, viewportHeight: bounds.viewportHeight, pageWidth: bounds.viewportWidth, scroll: 0 });
  212 |       };
  213 |       await coverage();
  214 |       await page.getByLabel('Jump to a member').selectOption('1');
  215 |       await expect.poll(timeline).toBeCloseTo(memberProgress(1, site.team.length), 6);
  216 |       await page.mouse.move(viewport.width / 2, viewport.height / 2);
  217 |       await page.mouse.wheel(0, 300);
  218 |       await expect.poll(timeline).toBeGreaterThan(memberProgress(1, site.team.length) + .01);
  219 |       await coverage();
  220 |       await page.mouse.wheel(0, -300);
  221 |       await expect.poll(timeline).toBeCloseTo(memberProgress(1, site.team.length), 6);
  222 |       await page.locator('#main-content').focus();
  223 |       await page.keyboard.press('End');
  224 |       await expect.poll(timeline).toBe(1);
  225 |       await page.mouse.wheel(0, 2000);
  226 |       await coverage();
  227 |       expect(await timeline()).toBe(1);
  228 |       await page.keyboard.press('Home');
  229 |       await expect.poll(timeline).toBe(0);
  230 |       await page.mouse.wheel(0, -2000);
  231 |       await coverage();
  232 |       expect(await timeline()).toBe(0);
  233 | 
  234 |       await page.getByLabel('Jump to a member').selectOption('3');
  235 |       await expect.poll(timeline).toBeCloseTo(memberProgress(3, site.team.length), 6);
  236 |       await page.setViewportSize({ width: viewport.height, height: viewport.width });
  237 |       await coverage();
  238 |       await expect.poll(timeline).toBeCloseTo(memberProgress(3, site.team.length), 6);
  239 |       await expect.poll(() => page.locator('.tower-profile').evaluate(profile => {
  240 |         const box = profile.getBoundingClientRect(), hud = document.querySelector('.people-tower__hud').getBoundingClientRect();
  241 |         return box.left >= 0 && box.right <= innerWidth && box.top >= 70 && box.bottom < hud.top;
  242 |       })).toBe(true);
  243 |       await page.getByRole('button', { name: 'Rebuild tower' }).tap();
  244 |       await expect.poll(timeline).toBe(0);
  245 |       await page.emulateMedia({ reducedMotion: 'reduce' });
  246 |       await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'still');
  247 |       await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
  248 |       await page.getByRole('button', { name: 'Back to the team', exact: true }).tap();
  249 |       await expect(page.locator('html')).not.toHaveClass(/people-tower-open|people-tower-playing/);
  250 |       await expect(page.locator('body')).toHaveCSS('position', 'static');
  251 |       await page.mouse.wheel(0, 500);
  252 |       await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  253 |     });
  254 |   });
  255 | }
  256 | 
  257 | test('desktop retains click-to-pull and drag controls', async ({ page }) => {
  258 |   await page.setViewportSize({ width: 1280, height: 800 });
  259 |   await openTower(page);
  260 |   await expect(page.locator('.people-tower__hint-mouse')).toBeVisible();
  261 |   await expect(page.locator('.people-tower__hint-touch')).toBeHidden();
  262 |   const initial = await blockPoint(page);
  263 |   await page.mouse.click(initial.x, initial.y);
  264 |   await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  265 |   await page.getByRole('button', { name: 'Rebuild tower' }).click();
  266 |   await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  267 |   const dragged = await blockPoint(page);
  268 |   await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  269 |   await page.mouse.move(dragged.x + 160, dragged.y - 30, { steps: 10 });
  270 |   await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  271 |   await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  272 |   await page.mouse.up();
  273 |   await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  274 | });
  275 | 
```