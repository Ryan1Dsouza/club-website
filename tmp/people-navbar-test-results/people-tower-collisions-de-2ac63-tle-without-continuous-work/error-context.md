# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-collisions.spec.mjs >> desktop tower >> scroll poses collide, reverse cleanly and settle without continuous work
- Location: tests\browser\people-tower-collisions.spec.mjs:12:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

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
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: NUCLEUS / SJEC
            - generic [ref=e21]: 01 / 15
          - generic [ref=e22]: PK
          - generic [ref=e23]: +
          - generic [ref=e24]:
            - paragraph [ref=e25]: President
            - generic [ref=e26]:
              - generic [ref=e27]: Poorvik
              - generic [ref=e28]: Kuthyala
          - generic [ref=e29]:
            - generic [ref=e30]: The people / Nucleus
            - generic [ref=e31]: Keep scrolling ↗
        - generic [ref=e32]: 02 / The people
        - generic [aria-hidden]:
          - paragraph:
            - text: The
            - emphasis: whole team.
          - generic: Meet everyone
        - paragraph: Click a block to pull it out. Drag to play. Scroll to meet the team.
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]: "01"
            - generic [ref=e37]: / 15
          - generic [ref=e38]:
            - generic [ref=e39]: Jump to a member
            - combobox "Jump to a member" [ref=e40]:
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
          - button "Rebuild tower" [ref=e41] [cursor=pointer]
```

# Test source

```ts
  26  |           renderer.render = (scene, camera) => {
  27  |             const audit = window.__towerAudit, now = performance.now();
  28  |             if (audit.measuring) {
  29  |               if (lastFrame) audit.frameMs.push(now - lastFrame);
  30  |               lastFrame = now;
  31  |             } else lastFrame = 0;
  32  |             if (!audit.gpu) {
  33  |               const gl = renderer.getContext(), extension = gl.getExtension('WEBGL_debug_renderer_info');
  34  |               audit.gpu = extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable';
  35  |             }
  36  |             const blocks = scene.children.find(object => object.isInstancedMesh && object.castShadow);
  37  |             const active = Number(renderer.domElement.parentElement.dataset.activeMember);
  38  |             if (blocks && active >= 0) {
  39  |               const bounds = [];
  40  |               for (let i = 0; i < blocks.count; i++) {
  41  |                 const e = blocks.instanceMatrix.array.subarray(i * 16, i * 16 + 16);
  42  |                 const half = [0, 1, 2].map(axis => (Math.abs(e[axis]) + Math.abs(e[axis + 4]) + Math.abs(e[axis + 8])) / 2);
  43  |                 bounds.push({ min: half.map((h, axis) => e[12 + axis] - h), max: half.map((h, axis) => e[12 + axis] + h), visible: half.some(h => h > .00001) });
  44  |               }
  45  |               const a = bounds[active], floor = scene.getObjectByName('timber-tabletop').position.y;
  46  |               if (a?.visible) {
  47  |                 if (!audit.active.includes(active)) audit.active.push(active);
  48  |                 if (a.min[1] < floor - .003) audit.violations.push({ active, floor: a.min[1] - floor });
  49  |                 const aboveBoard = a.min[0] < 2.75 && a.max[0] > -2.75 && a.min[2] < 2.75 && a.max[2] > -2.75;
  50  |                 if (aboveBoard && a.min[1] < floor + .28 - .003) audit.violations.push({ active, board: a.min[1] - floor - .28 });
  51  |                 bounds.forEach((b, index) => {
  52  |                   if (index === active || !b.visible) return;
  53  |                   const depth = Math.min(...[0, 1, 2].map(axis => Math.min(a.max[axis], b.max[axis]) - Math.max(a.min[axis], b.min[axis])));
  54  |                   if (depth > .003) audit.violations.push({ active, other: index, depth });
  55  |                 });
  56  |               }
  57  |             }
  58  |             const start = performance.now(); render(scene, camera);
  59  |             audit.renderMs.push(performance.now() - start); audit.frames++;
  60  |             audit.draws = Math.max(audit.draws, renderer.info.render.calls);
  61  |           };
  62  |         } };
  63  |       }, mobile);
  64  |       const errors = []; page.on('pageerror', error => errors.push(error.message));
  65  |       await page.goto('/team');
  66  |       await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15_000 });
  67  |       await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  68  |       await expect(page.locator('html')).not.toHaveClass(/lenis/);
  69  | 
  70  |       // Real wheel/touch input must scroll without dragging the stack or being cancelled.
  71  |       if (mobile) {
  72  |         const cdp = await page.context().newCDPSession(page);
  73  |         await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 670 }] });
  74  |         for (let y = 650; y >= 270; y -= 20) {
  75  |           await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
  76  |           await page.evaluate(() => new Promise(requestAnimationFrame));
  77  |         }
  78  |         await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  79  |         await cdp.detach();
  80  |       } else {
  81  |         await page.mouse.move(700, 500); await page.mouse.wheel(0, 400);
  82  |       }
  83  |       await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  84  |       await expect(page.locator('.people-tower__world')).not.toHaveAttribute('data-dragging');
  85  | 
  86  |       // Sample every rendered pose along continuous forward/backward scrolling,
  87  |       // then stress skipped members and reversals using abrupt destination changes.
  88  |       await page.evaluate(async () => {
  89  |         const section = document.querySelector('.people-tower'), stage = section.querySelector('.people-tower__stage');
  90  |         const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
  91  |         const range = section.offsetHeight - stage.offsetHeight;
  92  |         window.__towerAudit.measuring = true;
  93  |         for (const [from, to] of [[0, 1], [1, 0]]) {
  94  |           const began = performance.now();
  95  |           await new Promise(resolve => {
  96  |             function tick(now) {
  97  |               const t = Math.min(1, (now - began) / 6500);
  98  |               scrollTo({ top: start + (from + (to - from) * t) * range, behavior: 'instant' });
  99  |               if (t < 1) requestAnimationFrame(tick); else resolve();
  100 |             }
  101 |             requestAnimationFrame(tick);
  102 |           });
  103 |         }
  104 |         window.__towerAudit.measuring = false;
  105 |         for (const progress of [.9, .15, .65, .01, .98, .35]) {
  106 |           scrollTo({ top: start + progress * range, behavior: 'instant' });
  107 |           await new Promise(resolve => setTimeout(resolve, 130));
  108 |         }
  109 |       });
  110 |       const destination = memberProgress(0, site.team.length);
  111 |       await page.locator('.people-tower').evaluate((section, progress) => {
  112 |         const stage = section.querySelector('.people-tower__stage');
  113 |         const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
  114 |         scrollTo({ top: start + progress * (section.offsetHeight - stage.offsetHeight), behavior: 'instant' });
  115 |       }, destination);
  116 |       await expect(page.locator('.tower-profile')).toHaveCSS('opacity', '1');
  117 |       await expect.poll(() => page.locator('.people-tower').evaluate(section => {
  118 |         const stage = section.querySelector('.people-tower__stage');
  119 |         const start = section.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
  120 |         return Math.abs(Number(section.style.getPropertyValue('--tower-progress')) - (scrollY - start) / (section.offsetHeight - stage.offsetHeight));
  121 |       })).toBeLessThan(.000001);
  122 |       await expect.poll(async () => {
  123 |         const before = await page.evaluate(() => window.__towerAudit.frames);
  124 |         await page.waitForTimeout(250);
  125 |         return await page.evaluate(() => window.__towerAudit.frames) === before;
> 126 |       }).toBe(true);
      |          ^ Error: expect(received).toBe(expected) // Object.is equality
  127 |       const metrics = await page.evaluate(() => {
  128 |         const audit = window.__towerAudit;
  129 |         const percentile = (values, p) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * p)];
  130 |         return { violations: audit.violations.slice(0, 10), frames: audit.frames, members: audit.active.length, draws: audit.draws, gpu: audit.gpu,
  131 |           renderMedianMs: percentile(audit.renderMs, .5), renderP95Ms: percentile(audit.renderMs, .95), frameMedianMs: percentile(audit.frameMs, .5), frameP95Ms: percentile(audit.frameMs, .95) };
  132 |       });
  133 |       await info.attach('scroll-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
  134 |       expect(metrics.violations).toEqual([]);
  135 |       expect(metrics.members).toBe(site.team.length); expect(metrics.draws).toBeLessThanOrEqual(8);
  136 |       expect(errors).toEqual([]);
  137 |       await page.screenshot({ path: info.outputPath('settled-profile.png') });
  138 |     });
  139 |   });
  140 | }
  141 | 
```