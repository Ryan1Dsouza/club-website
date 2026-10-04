# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> desktop retains click-to-pull and drag controls
- Location: tests\browser\people-tower-touch.spec.mjs:165:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 1
Received:   0

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
  - main [active] [ref=e11]:
    - region [ref=e12]:
      - heading "The people behind Nucleus" [level=1] [ref=e13]
      - generic [ref=e15]:
        - generic [ref=e18]:
          - generic [ref=e19]: NUCLEUS / SJEC
          - generic [ref=e22]: +
          - paragraph [ref=e24]
          - generic [ref=e28]:
            - generic [ref=e29]: The people / Nucleus
            - generic [ref=e30]: Keep scrolling ↗
        - generic [ref=e31]: 02 / The people
        - generic [aria-hidden]:
          - paragraph:
            - text: The
            - emphasis: whole team.
          - generic: Meet everyone
        - paragraph: Click a block to pull it out. Drag to play. Scroll to meet the team.
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]: —
            - generic [ref=e36]: / 15
          - generic [ref=e37]:
            - generic [ref=e38]: Jump to a member
            - combobox "Jump to a member" [ref=e39]:
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
          - button "Rebuild tower" [ref=e40] [cursor=pointer]
```

# Test source

```ts
  72  |       await expect(world).toHaveAttribute('data-dragging', 'true');
  73  |       await touch('touchEnd');
  74  |       await expect(world).not.toHaveAttribute('data-dragging');
  75  |       await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
  76  |       expect(await page.locator('.site-shell').evaluate(element => element.scrollTop)).toBe(0);
  77  |       await rebuild();
  78  | 
  79  |       const dragged = await blockPoint(page);
  80  |       await touch('touchStart', dragged);
  81  |       for (let step = 1; step <= 10; step++) {
  82  |         await touch('touchMove', { x: dragged.x + step * 10, y: dragged.y });
  83  |         await page.evaluate(() => new Promise(requestAnimationFrame));
  84  |       }
  85  |       await expect(world).toHaveAttribute('data-dragging', 'true');
  86  |       await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  87  |       expect(await page.locator('.site-shell').evaluate(element => element.scrollTop)).toBe(0);
  88  |       await page.screenshot({ path: info.outputPath('touch-drag.png') });
  89  |       await touch('touchEnd');
  90  |       await expect(world).not.toHaveAttribute('data-dragging');
  91  |       await rebuild();
  92  | 
  93  |       await touch('touchStart', await blockPoint(page));
  94  |       await expect(world).toHaveAttribute('data-dragging', 'true');
  95  |       await touch('touchCancel');
  96  |       await expect(world).not.toHaveAttribute('data-dragging');
  97  |       await rebuild();
  98  | 
  99  |       const swiped = await blockPoint(page);
  100 |       await touch('touchStart', swiped);
  101 |       for (let step = 1; step <= 10; step++) {
  102 |         await touch('touchMove', { x: swiped.x, y: swiped.y - step * 15 });
  103 |         await page.evaluate(() => new Promise(requestAnimationFrame));
  104 |       }
  105 |       await touch('touchEnd');
  106 |       await expect.poll(() => page.locator('.site-shell').evaluate(element => element.scrollTop)).toBeGreaterThan(80);
  107 |       await expect(world).not.toHaveAttribute('data-dragging');
  108 |       expect(errors).toEqual([]);
  109 |       await cdp.detach();
  110 |     });
  111 | 
  112 |     test('scrolling reveals a flung block from its visible position and tilt', async ({ page }, info) => {
  113 |       await openTower(page);
  114 |       const flung = await blockPoint(page, 0);
  115 |       await page.touchscreen.tap(flung.x, flung.y);
  116 |       await expect.poll(() => displacement(page, flung)).toBeGreaterThan(2);
  117 |       // Compare actual rendered instance matrices across the exact handoff frame.
  118 |       await page.evaluate(index => {
  119 |         const { renderer } = window.__towerTouchView, render = renderer.render.bind(renderer);
  120 |         window.__handoff = { before: null, first: null };
  121 |         renderer.render = (scene, camera) => {
  122 |           const audit = window.__handoff;
  123 |           if (!audit.first) {
  124 |             const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  125 |             const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  126 |             if (Number(renderer.domElement.parentElement.dataset.activeMember) === index) audit.first = matrix.toArray();
  127 |             else audit.before = matrix.toArray();
  128 |           }
  129 |           render(scene, camera);
  130 |         };
  131 |       }, flung.index);
  132 |       await page.evaluate(() => new Promise(requestAnimationFrame));
  133 |       const seekStart = () => page.locator('.people-tower').evaluate((section, progress) => {
  134 |         const stage = section.querySelector('.people-tower__stage');
  135 |         const shell = section.closest('.site-shell');
  136 |         const start = section.getBoundingClientRect().top + shell.scrollTop - (parseFloat(getComputedStyle(stage).top) || 0);
  137 |         shell.scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  138 |       }, (TOWER_INTRO + flung.index + .003) / (TOWER_INTRO + site.team.length + TOWER_OUTRO));
  139 |       await seekStart();
  140 |       await expect.poll(() => page.evaluate(() => window.__handoff.first)).not.toBeNull();
  141 |       const handoff = await page.evaluate(() => window.__handoff);
  142 |       expect(handoff.before).not.toBeNull();
  143 |       expect(Math.hypot(...handoff.before.slice(12, 15).map((value, axis) => value - flung.position[axis]))).toBeGreaterThan(2);
  144 |       expect(Math.max(...handoff.first.map((value, axis) => Math.abs(value - handoff.before[axis])))).toBeLessThan(.05);
  145 |       await info.attach('visible-handoff', { body: JSON.stringify(handoff), contentType: 'application/json' });
  146 |       await page.screenshot({ path: info.outputPath('flung-reveal-start.png') });
  147 | 
  148 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index));
  149 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  150 |       await page.screenshot({ path: info.outputPath('flung-reveal-profile.png') });
  151 |       // Cross a member boundary before reversing: a queued tower return must
  152 |       // not replace the source of this member's already established flight.
  153 |       await page.getByLabel('Jump to a member').selectOption(String(flung.index + 1));
  154 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  155 |       await seekStart();
  156 |       await expect.poll(() => page.evaluate(({ index, before }) => {
  157 |         const blocks = window.__towerTouchView.scene.children.find(object => object.isInstancedMesh && object.castShadow);
  158 |         const matrix = blocks.matrix.clone(); blocks.getMatrixAt(index, matrix);
  159 |         return Math.max(...matrix.elements.map((value, axis) => Math.abs(value - before[axis])));
  160 |       }, { index: flung.index, before: handoff.before })).toBeLessThan(.05);
  161 |     });
  162 |   });
  163 | }
  164 | 
  165 | test('desktop retains click-to-pull and drag controls', async ({ page }) => {
  166 |   await page.setViewportSize({ width: 1280, height: 800 });
  167 |   await openTower(page);
  168 |   await expect(page.locator('.people-tower__hint-mouse')).toBeVisible();
  169 |   await expect(page.locator('.people-tower__hint-touch')).toBeHidden();
  170 |   const initial = await blockPoint(page);
  171 |   await page.mouse.click(initial.x, initial.y);
> 172 |   await expect.poll(() => displacement(page, initial)).toBeGreaterThan(1);
      |                                                        ^ Error: expect(received).toBeGreaterThan(expected)
  173 |   await page.getByRole('button', { name: 'Rebuild tower' }).click();
  174 |   await expect.poll(() => displacement(page, initial)).toBeLessThan(.01);
  175 |   const dragged = await blockPoint(page);
  176 |   await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  177 |   await page.mouse.move(dragged.x + 160, dragged.y - 30, { steps: 10 });
  178 |   await expect(page.locator('.people-tower__world')).toHaveAttribute('data-dragging', 'true');
  179 |   await expect.poll(() => displacement(page, dragged)).toBeGreaterThan(.5);
  180 |   await page.mouse.up();
  181 |   await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  182 | });
  183 | 
```