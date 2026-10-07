# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> phone persistent throws >> one portrait, a grabbable profile, preserved reverse poses, and play after the finale
- Location: tests\browser\people-tower-touch.spec.mjs:286:5

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 0.05
Received:   4.764077425003052
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
                      - generic: 01 / 15
                    - generic:
                      - paragraph: President
                      - generic:
                        - generic: Poorvik
                        - generic: Kuthyala
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
              - combobox "Jump to a member" [active] [ref=e27]:
                - option "Meet the members" [disabled]
                - option "Poorvik Kuthyala" [selected]
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
            - button "Rebuild tower" [ref=e28] [cursor=pointer]
```

# Test source

```ts
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
  295 |       const seek = async progress => {
  296 |         await page.locator('.people-tower').evaluate((section, { progress, count }) => {
  297 |           const stage = section.querySelector('.people-tower__stage');
  298 |           if (matchMedia('(max-width: 760px), (pointer: coarse)').matches) {
  299 |             const current = Number(section.style.getPropertyValue('--tower-progress'));
  300 |             stage.dispatchEvent(new WheelEvent('wheel', { deltaY: (progress - current) * stage.clientHeight * (count * .55 + .2), bubbles: true, cancelable: true }));
  301 |           } else {
  302 |             const start = section.getBoundingClientRect().top + scrollY;
  303 |             scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  304 |           }
  305 |         }, { progress, count: site.team.length });
  306 |         await expect.poll(() => page.locator('.people-tower').evaluate(el => Number(el.style.getPropertyValue('--tower-progress')))).toBeCloseTo(progress, 4);
  307 |       };
  308 |       const cdp = mobile ? await page.context().newCDPSession(page) : null;
  309 |       const throwAt = async point => {
  310 |         if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  311 |         else { await page.mouse.move(point.x, point.y); await page.mouse.down(); }
  312 |         await expect(world).toHaveAttribute('data-dragging', 'true');
  313 |         for (let step = 1; step <= 10; step++) {
  314 |           const target = { x: point.x + step * 6, y: point.y - step * 6 };
  315 |           if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [target] });
  316 |           else await page.mouse.move(target.x, target.y);
  317 |           await page.evaluate(() => new Promise(requestAnimationFrame));
  318 |         }
  319 |         if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  320 |         else await page.mouse.up();
  321 |         await expect(world).not.toHaveAttribute('data-dragging');
  322 |       };
  323 |       const original = await matrixAt(1);
  324 |       await expect(page.locator('.people-tower__hud button')).toHaveCount(1);
  325 |       await expect(page.locator('.people-tower__hud select')).toHaveCount(1);
  326 |       await page.getByLabel('Jump to a member').selectOption('1');
  327 |       const profile = page.locator('.tower-profile');
  328 |       await expect(profile).toHaveCSS('opacity', '1');
  329 |       await expect(profile.locator('img')).toHaveCount(1);
  330 |       await expect(page.locator('.tower-profile__photo-bg')).toHaveCount(0);
  331 |       await expect(profile).toHaveCSS('backdrop-filter', 'blur(12px)');
  332 |       await page.screenshot({ path: info.outputPath('single-portrait-banner.png') });
  333 |       const box = await profile.boundingBox();
  334 |       await throwAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  335 |       await expect(profile).toHaveCSS('opacity', '0');
  336 |       await expect.poll(async () => {
  337 |         const before = await matrixAt(1);
  338 |         await page.waitForTimeout(150);
  339 |         return difference(before, await matrixAt(1));
  340 |       }, { timeout: 10000 }).toBeLessThan(.001);
  341 |       const flung = await matrixAt(1);
  342 |       await info.attach('profile-throw', { body: JSON.stringify({ original, flung, state: await world.evaluate(el => ({
  343 |         active: el.dataset.activeMember, progress: el.closest('.people-tower').style.getPropertyValue('--tower-progress'),
  344 |       })) }), contentType: 'application/json' });
  345 |       expect(difference(flung, original)).toBeGreaterThan(1);
  346 |       await page.getByLabel('Jump to a member').selectOption('2');
  347 |       await expect(profile).toHaveCSS('opacity', '1');
  348 |       await page.getByLabel('Jump to a member').selectOption('0');
  349 |       await expect(profile).toHaveCSS('opacity', '1');
> 350 |       expect(difference(flung, await matrixAt(1))).toBeLessThan(.05);
      |                                                    ^ Error: expect(received).toBeLessThan(expected)
  351 |       await seek(0);
  352 |       expect(difference(flung, await matrixAt(1))).toBeLessThan(.05);
  353 |       await seek(1);
  354 |       await expect.poll(async () => (await matrixAt(12))[0]).not.toBe(0);
  355 |       await page.waitForTimeout(2300); // Wait for the authored layer returns.
  356 |       expect(difference(flung, await matrixAt(1))).toBeLessThan(.05);
  357 |       const finished = await blockPoint(page, 12);
  358 |       await throwAt({ x: finished.x, y: finished.y });
  359 |       await expect.poll(() => displacement(page, finished)).toBeGreaterThan(.5);
  360 |       await page.screenshot({ path: info.outputPath('play-after-finale.png') });
  361 |       await page.getByRole('button', { name: 'Rebuild tower' }).click();
  362 |       await expect.poll(async () => difference(original, await matrixAt(1))).toBeLessThan(.01);
  363 |       expect(errors).toEqual([]);
  364 |       await cdp?.detach();
  365 |     });
  366 |   });
  367 | }
  368 | 
```