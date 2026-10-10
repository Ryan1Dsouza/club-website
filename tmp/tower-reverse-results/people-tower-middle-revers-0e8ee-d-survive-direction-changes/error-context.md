# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-middle-reverse.spec.mjs >> touch viewport >> middle reversals fold each banner into its own plank and survive direction changes
- Location: tests\browser\people-tower-middle-reverse.spec.mjs:52:5

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 0.8986928104575163
Received: 0

Expected precision:    5
Expected difference: < 0.000005
Received difference:   0.8986928104575163

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
          - button "Website sound" [pressed] [ref=e7] [cursor=pointer]
          - button "Open menu" [ref=e12] [cursor=pointer]
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
                - listitem:
                  - link:
                    - /url: /recruitment
                    - generic [aria-hidden]:
                      - generic: R
                      - generic: e
                      - generic: c
                      - generic: r
                      - generic: u
                      - generic: i
                      - generic: t
                      - generic: m
                      - generic: e
                      - generic: "n"
                      - generic: t
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
                - button: Join Nucleus
  - main [ref=e16]:
    - generic [ref=e17]:
      - heading "The people behind Nucleus" [level=1] [ref=e18]
      - button "Back to the team" [ref=e20] [cursor=pointer]
      - region "Interactive team tower" [ref=e24]:
        - generic [ref=e26]:
          - generic [aria-hidden] [ref=e27]:
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
          - generic [ref=e29]:
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
                - option "Nikhitha Dsouza"
                - option "Salim Pallikal"
                - option "Aisahath Saniya"
            - button "Rebuild tower" [ref=e33] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import { TOWER_INTRO, TOWER_OUTRO, sortTowerMembers, towerSlots } from '../../src/lib/people-tower-motion.ts';
  4   | 
  5   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  6   | const members = sortTowerMembers(site.team.filter(member => member.status !== 'alumni'));
  7   | const slots = towerSlots(members.map(member => member.id));
  8   | const duration = TOWER_INTRO + members.length + TOWER_OUTRO;
  9   | const memberTime = (index, local = .6) => (TOWER_INTRO + index + local) / duration;
  10  | 
  11  | async function seek(page, progress, settle = true) {
  12  |   const actual = await page.locator('.people-tower').evaluate((section, progress) => {
  13  |     const stage = section.querySelector('.people-tower__stage');
  14  |     if (matchMedia('(max-width: 760px), (pointer: coarse)').matches) {
  15  |       const current = Number(section.style.getPropertyValue('--tower-progress'));
  16  |       const count = section.querySelector('select').options.length - 1;
  17  |       const range = section.querySelector('.people-tower__world').clientHeight * (count * .55 + .2);
  18  |       stage.dispatchEvent(new WheelEvent('wheel', {
  19  |         deltaY: progress === 0 ? -range * 2 : (progress - current) * range, bubbles: true, cancelable: true,
  20  |       }));
  21  |       return progress;
  22  |     }
  23  |     const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
  24  |     const range = section.offsetHeight - stage.offsetHeight;
  25  |     scrollTo({ top: start + progress * range, behavior: 'instant' });
  26  |     return Math.max(0, Math.min(1, (scrollY - start) / range));
  27  |   }, progress);
  28  |   if (settle) await expect.poll(() => page.locator('.people-tower').evaluate(section =>
> 29  |     Number(section.style.getPropertyValue('--tower-progress')))).toBeCloseTo(actual, 5);
      |                                                                  ^ Error: expect(received).toBeCloseTo(expected, precision)
  30  | }
  31  | 
  32  | async function expectStack(page, firstVisible) {
  33  |   const expected = slots.map((slot, index) => index < firstVisible ? null : slot.position.map(Math.fround));
  34  |   await expect.poll(() => page.evaluate(() => window.__middleReverseFrames.at(-1)?.blocks.map(block =>
  35  |     block.scale[0] < .01 ? null : block.position)), { message: 'every returned plank lands in its original slot' }).toEqual(expected);
  36  | }
  37  | 
  38  | async function expectForwardStack(page) {
  39  |   await expect.poll(() => page.evaluate(slots => {
  40  |     const frame = window.__middleReverseFrames.at(-1);
  41  |     return frame?.blocks.every((block, index) => index === frame.active || (index < frame.active
  42  |       ? block.scale[0] < .01
  43  |       : block.scale[0] > .01 && block.position.every((value, axis) => value === Math.fround(slots[index].position[axis]))));
  44  |   }, slots), { message: 'resuming forward leaves no other plank stranded between its return and its slot' }).toBe(true);
  45  | }
  46  | 
  47  | for (const mobile of [false, true]) {
  48  |   test.describe(mobile ? 'touch viewport' : 'desktop viewport', () => {
  49  |     test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
  50  |       isMobile: mobile, hasTouch: mobile });
  51  | 
  52  |     test('middle reversals fold each banner into its own plank and survive direction changes', async ({ page }, info) => {
  53  |       test.setTimeout(120_000);
  54  |       const errors = [];
  55  |       page.on('pageerror', error => errors.push(error.message));
  56  |       await page.route('**/api/site', route => route.fulfill({ json: site }));
  57  |       await page.addInitScript(() => {
  58  |         window.__middleReverseFrames = [];
  59  |         window.__THREE_DEVTOOLS__ = { dispatchEvent({ detail: renderer }) {
  60  |           if (!renderer?.isWebGLRenderer) return;
  61  |           const render = renderer.render.bind(renderer);
  62  |           renderer.render = (scene, camera) => {
  63  |             const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  64  |             const section = document.querySelector('.people-tower');
  65  |             if (blocks && section) {
  66  |               const frames = window.__middleReverseFrames;
  67  |               frames.push({ progress: Number(section.style.getPropertyValue('--tower-progress')),
  68  |                 active: Number(renderer.domElement.parentElement.dataset.activeMember),
  69  |                 blocks: Array.from({ length: blocks.count }, (_, index) => {
  70  |                   const m = blocks.instanceMatrix.array.subarray(index * 16, index * 16 + 16);
  71  |                   return { position: [...m.slice(12, 15)], scale: [0, 4, 8].map(i => Math.hypot(m[i], m[i + 1], m[i + 2])) };
  72  |                 }) });
  73  |               if (frames.length > 1000) frames.shift();
  74  |             }
  75  |             return render(scene, camera);
  76  |           };
  77  |         } };
  78  |       });
  79  |       await page.goto('/team');
  80  |       await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 30_000 });
  81  |       await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
  82  |       await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready', { timeout: 30_000 });
  83  | 
  84  |       // Every banner owns one plank in both directions; reversing must not
  85  |       // restore its neighbours early or leave a second copy in the tower.
  86  |       for (const index of [7, 4, 1, 13]) {
  87  |         await page.getByRole('button', { name: 'Rebuild tower', exact: true }).click();
  88  |         await seek(page, memberTime(index, .2));
  89  |         const forwardFlight = await page.evaluate(index => window.__middleReverseFrames.at(-1).blocks[index], index);
  90  |         await seek(page, memberTime(index));
  91  |         await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  92  |         if (index === 7) await page.screenshot({ path: info.outputPath('middle-forward.png') });
  93  |         await seek(page, memberTime(index, .45));
  94  |         if (index === 7) await page.screenshot({ path: info.outputPath('middle-reverse.png') });
  95  |         await expectStack(page, index + 1);
  96  |         await expect(page.locator('.tower-profile__role')).toHaveText(members[index].role);
  97  |         await seek(page, memberTime(index, .2));
  98  |         await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '0');
  99  |         await expectForwardStack(page);
  100 |         const flying = await page.evaluate(index => window.__middleReverseFrames.at(-1).blocks[index], index);
  101 |         expect(flying.scale[0]).toBeGreaterThan(.01);
  102 |         expect(Math.hypot(...flying.position.map((value, axis) => value - slots[index].position[axis]))).toBeGreaterThan(.3);
  103 |         expect(Math.hypot(...flying.position.map((value, axis) => value - forwardFlight.position[axis]))).toBeLessThan(.01);
  104 |         if (index === 7) await page.screenshot({ path: info.outputPath('middle-folded-return.png') });
  105 |         await seek(page, memberTime(index, .005));
  106 |         const landing = await page.evaluate(index => window.__middleReverseFrames.at(-1).blocks[index], index);
  107 |         expect(Math.hypot(...landing.position.map((value, axis) => value - slots[index].position[axis]))).toBeLessThan(.01);
  108 | 
  109 |         // Cross a member boundary, then reverse all the way to the beginning.
  110 |         await seek(page, memberTime(index - 1));
  111 |         await expectStack(page, index);
  112 |         await seek(page, 0);
  113 |         await expectStack(page, 0);
  114 |       }
  115 | 
  116 |       // Interrupt the pull, flight, unfolding, hold and exit in both directions.
  117 |       // Reversing forward during the 350ms return must not freeze a plank aloft.
  118 |       for (const local of [.07, .20, .36, .60, .90]) {
  119 |         await page.getByRole('button', { name: 'Rebuild tower', exact: true }).click();
  120 |         await seek(page, memberTime(7, local));
  121 |         await seek(page, memberTime(7, local - .04), false);
  122 |         await page.waitForTimeout(80);
  123 |         await page.mouse.move(mobile ? 195 : 640, mobile ? 450 : 500);
  124 |         await page.mouse.wheel(0, 60);
  125 |         await page.waitForTimeout(500);
  126 |         await expectForwardStack(page);
  127 |         await seek(page, 0);
  128 |         await expectStack(page, 0);
  129 |       }
```