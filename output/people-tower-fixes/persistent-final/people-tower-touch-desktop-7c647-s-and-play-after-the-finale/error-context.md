# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> desktop persistent throws >> one portrait, a grabbable profile, preserved reverse poses, and play after the finale
- Location: tests\browser\people-tower-touch.spec.mjs:286:5

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 0.11372549019607842
Received: 0.11374095989480605

Expected precision:    6
Expected difference: < 0.0000005
Received difference:   0.000015469698727635373

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
                    - generic:
                      - generic: NUCLEUS / SJEC
                      - generic: 02 / 15
                    - generic:
                      - paragraph: Vice President
                      - generic:
                        - generic: Dinol
                        - generic: Castelino
                    - generic:
                      - generic: The people / Nucleus
                      - generic: Keep scrolling ↗
          - generic [aria-hidden]:
            - paragraph:
              - text: The
              - emphasis: whole team.
            - generic: Keep throwing, or scroll back to revisit.
          - paragraph: Click to pull. Grab, drag and release to throw. Scroll to meet the team.
          - generic [ref=e24]:
            - generic [ref=e25]:
              - generic [ref=e26]: Jump to a member
              - combobox "Jump to a member" [active] [ref=e27]:
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
            - button "Rebuild tower" [ref=e28] [cursor=pointer]
```

# Test source

```ts
  199 |       await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress'))))
  200 |         .toBeCloseTo(memberProgress(flung.index + 1, site.team.length), 6);
  201 |       await seekStart();
  202 |       await expect.poll(() => page.evaluate(({ index, before }) => {
  203 |         const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  204 |         const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  205 |         return Math.max(...matrix.elements.map((value, axis) => Math.abs(value - before[axis])));
  206 |       }, { index: flung.index, before: handoff.before })).toBeLessThan(.05);
  207 |     });
  208 | 
  209 |     test('the viewport stays fixed at both timeline ends, survives rotation, and unlocks on exit', async ({ page }) => {
  210 |       await openTower(page);
  211 |       const timeline = () => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')));
  212 |       const coverage = async () => {
  213 |         const bounds = await page.locator('.people-tower__stage').evaluate(el => ({ top: el.getBoundingClientRect().top,
  214 |           width: el.clientWidth, height: el.clientHeight, viewportWidth: innerWidth, viewportHeight: innerHeight,
  215 |           pageWidth: document.documentElement.scrollWidth, scroll: scrollY }));
  216 |         expect(bounds).toEqual({ top: 0, width: bounds.viewportWidth, height: bounds.viewportHeight,
  217 |           viewportWidth: bounds.viewportWidth, viewportHeight: bounds.viewportHeight, pageWidth: bounds.viewportWidth, scroll: 0 });
  218 |       };
  219 |       await coverage();
  220 |       await page.getByLabel('Jump to a member').selectOption('1');
  221 |       await expect.poll(timeline).toBeCloseTo(memberProgress(1, site.team.length), 6);
  222 |       await page.mouse.move(viewport.width / 2, viewport.height / 2);
  223 |       await page.mouse.wheel(0, 300);
  224 |       await expect.poll(timeline).toBeGreaterThan(memberProgress(1, site.team.length) + .01);
  225 |       await coverage();
  226 |       await page.mouse.wheel(0, -300);
  227 |       await expect.poll(timeline).toBeCloseTo(memberProgress(1, site.team.length), 6);
  228 |       await page.locator('#main-content').focus();
  229 |       await page.keyboard.press('End');
  230 |       await expect.poll(timeline).toBe(1);
  231 |       await page.mouse.wheel(0, 2000);
  232 |       await coverage();
  233 |       expect(await timeline()).toBe(1);
  234 |       await page.keyboard.press('Home');
  235 |       await expect.poll(timeline).toBe(0);
  236 |       await page.mouse.wheel(0, -2000);
  237 |       await coverage();
  238 |       expect(await timeline()).toBe(0);
  239 | 
  240 |       await page.getByLabel('Jump to a member').selectOption('3');
  241 |       await expect.poll(timeline).toBeCloseTo(memberProgress(3, site.team.length), 6);
  242 |       await page.setViewportSize({ width: viewport.height, height: viewport.width });
  243 |       await coverage();
  244 |       await expect.poll(timeline).toBeCloseTo(memberProgress(3, site.team.length), 6);
  245 |       await expect.poll(() => page.locator('.tower-profile').evaluate(profile => {
  246 |         const box = profile.getBoundingClientRect(), hud = document.querySelector('.people-tower__hud').getBoundingClientRect();
  247 |         return box.left >= 0 && box.right <= innerWidth && box.top >= 70 && box.bottom < hud.top;
  248 |       })).toBe(true);
  249 |       await page.getByRole('button', { name: 'Rebuild tower' }).tap();
  250 |       await expect.poll(timeline).toBe(0);
  251 |       await page.emulateMedia({ reducedMotion: 'reduce' });
  252 |       await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'still');
  253 |       await expect(page.locator('.people-tower__world canvas')).toHaveCount(0);
  254 |       await page.getByRole('button', { name: 'Back to the team', exact: true }).tap();
  255 |       await expect(page.locator('html')).not.toHaveClass(/people-tower-open|people-tower-playing/);
  256 |       await expect(page.locator('body')).toHaveCSS('position', 'static');
  257 |       await page.mouse.wheel(0, 500);
  258 |       await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  259 |     });
  260 |   });
  261 | }
  262 | 
  263 | test('desktop retains click-to-pull and drag controls', async ({ page }) => {
  264 |   await page.setViewportSize({ width: 1280, height: 800 });
  265 |   await openTower(page);
  266 |   await expect(page.locator('.people-tower__hint-mouse')).toBeVisible();
  267 |   await expect(page.locator('.people-tower__hint-touch')).toBeHidden();
  268 |   const initial = await blockPoint(page);
  269 |   await page.mouse.click(initial.x, initial.y);
  270 |   await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  271 |   await page.getByRole('button', { name: 'Rebuild tower' }).click();
  272 |   await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  273 |   const dragged = await blockPoint(page);
  274 |   await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  275 |   await page.mouse.move(dragged.x + 160, dragged.y - 30, { steps: 10 });
  276 |   await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  277 |   await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  278 |   await page.mouse.up();
  279 |   await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  280 | });
  281 | 
  282 | for (const mobile of [false, true]) {
  283 |   test.describe(mobile ? 'phone persistent throws' : 'desktop persistent throws', () => {
  284 |     test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
  285 | 
  286 |     test('one portrait, a grabbable profile, preserved reverse poses, and play after the finale', async ({ page }, info) => {
  287 |       const errors = []; page.on('pageerror', error => errors.push(error.message));
  288 |       await openTower(page);
  289 |       const world = page.locator('.people-tower__world');
  290 |       const matrixAt = index => page.evaluate(index => {
  291 |         const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  292 |         return Array.from(blocks.instanceMatrix.array.slice(index * 16, index * 16 + 16));
  293 |       }, index);
  294 |       const difference = (a, b) => Math.max(...a.map((value, i) => Math.abs(value - b[i])));
  295 |       const showMember = async index => {
  296 |         await page.getByLabel('Jump to a member').selectOption(String(index));
  297 |         await expect(world).toHaveAttribute('data-active-member', String(index));
  298 |         await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress'))))
> 299 |           .toBeCloseTo(memberProgress(index, site.team.length), 6);
      |            ^ Error: expect(received).toBeCloseTo(expected, precision)
  300 |         await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  301 |       };
  302 |       const seek = async progress => {
  303 |         await page.locator('.people-tower').evaluate((section, { progress, count }) => {
  304 |           const stage = section.querySelector('.people-tower__stage');
  305 |           if (matchMedia('(max-width: 760px), (pointer: coarse)').matches) {
  306 |             const current = Number(section.style.getPropertyValue('--tower-progress'));
  307 |             stage.dispatchEvent(new WheelEvent('wheel', { deltaY: (progress - current) * stage.clientHeight * (count * .55 + .2), bubbles: true, cancelable: true }));
  308 |           } else {
  309 |             const start = section.getBoundingClientRect().top + scrollY;
  310 |             scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  311 |           }
  312 |         }, { progress, count: site.team.length });
  313 |         await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeCloseTo(progress, 4);
  314 |       };
  315 |       const cdp = mobile ? await page.context().newCDPSession(page) : null;
  316 |       const throwAt = async point => {
  317 |         if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  318 |         else { await page.mouse.move(point.x, point.y); await page.mouse.down(); }
  319 |         await expect(world).toHaveAttribute('data-dragging', 'true');
  320 |         for (let step = 1; step <= 10; step++) {
  321 |           const target = { x: point.x + step * 6, y: point.y - step * 6 };
  322 |           if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [target] });
  323 |           else await page.mouse.move(target.x, target.y);
  324 |           await page.evaluate(() => new Promise(requestAnimationFrame));
  325 |         }
  326 |         if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  327 |         else await page.mouse.up();
  328 |         await expect(world).not.toHaveAttribute('data-dragging');
  329 |       };
  330 |       const original = await matrixAt(1);
  331 |       await expect(page.locator('.people-tower__hud button')).toHaveCount(1);
  332 |       await expect(page.locator('.people-tower__hud select')).toHaveCount(1);
  333 |       await showMember(1);
  334 |       const profile = page.locator('.tower-profile');
  335 |       await expect(profile).toHaveCSS('opacity', '1');
  336 |       await expect(profile.locator('img')).toHaveCount(1);
  337 |       await expect(page.locator('.tower-profile__photo-bg')).toHaveCount(0);
  338 |       await expect(profile).toHaveCSS('backdrop-filter', 'blur(12px)');
  339 |       await page.screenshot({ path: info.outputPath('single-portrait-banner.png') });
  340 |       const box = await profile.boundingBox();
  341 |       await throwAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  342 |       await expect(profile).toHaveCSS('opacity', '0');
  343 |       await expect.poll(async () => difference(original, await matrixAt(1))).toBeGreaterThan(1);
  344 |       await expect.poll(async () => {
  345 |         const before = await matrixAt(1);
  346 |         await page.waitForTimeout(150);
  347 |         return difference(before, await matrixAt(1));
  348 |       }, { timeout: 10000 }).toBeLessThan(.001);
  349 |       const flung = await matrixAt(1);
  350 |       await info.attach('profile-throw', { body: JSON.stringify({ original, flung, state: await world.evaluate(el => ({
  351 |         active: el.dataset.activeMember, progress: el.closest('.people-tower').style.getPropertyValue('--tower-progress'),
  352 |       })) }), contentType: 'application/json' });
  353 |       expect(difference(flung, original)).toBeGreaterThan(1);
  354 |       await showMember(2);
  355 |       await showMember(0);
  356 |       expect(difference(flung, await matrixAt(1))).toBeLessThan(.05);
  357 |       await seek(0);
  358 |       expect(difference(flung, await matrixAt(1))).toBeLessThan(.05);
  359 |       await seek(1);
  360 |       await expect.poll(async () => (await matrixAt(12))[0]).not.toBe(0);
  361 |       await page.waitForTimeout(2300); // Wait for the authored layer returns.
  362 |       expect(difference(flung, await matrixAt(1))).toBeLessThan(.05);
  363 |       const finished = await blockPoint(page, 12);
  364 |       await throwAt({ x: finished.x, y: finished.y });
  365 |       await expect.poll(() => displacement(page, finished)).toBeGreaterThan(.5);
  366 |       await page.screenshot({ path: info.outputPath('play-after-finale.png') });
  367 |       await page.getByRole('button', { name: 'Rebuild tower' }).click();
  368 |       await expect.poll(async () => difference(original, await matrixAt(1))).toBeLessThan(.01);
  369 |       expect(errors).toEqual([]);
  370 |       await cdp?.detach();
  371 |     });
  372 |   });
  373 | }
  374 | 
```