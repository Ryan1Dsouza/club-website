# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: morphing-navbar.spec.mjs >> keyboard focus stays in the full-screen menu and Escape restores the page
- Location: tests\browser\morphing-navbar.spec.mjs:103:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.morph-nav__links li').last()
Expected: "1"
Received: "0"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" locator('.morph-nav__links li').last() with timeout 5000ms
  - waiting for locator('.morph-nav__links li').last()
    14 × locator resolved to <li>…</li>
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
    - generic [ref=e13]:
      - text: Your next chapter
      - heading [level=1] [ref=e14]:
        - text: Stay
        - emphasis [ref=e15]: connected.
      - paragraph [ref=e16]: Recruitment is currently closed. Follow our community for the next intake and results updates.
      - link "Follow Nucleus" [ref=e17] [cursor=pointer]:
        - /url: https://www.instagram.com/nucleus_sjec/
      - link "Get in touch" [ref=e21] [cursor=pointer]:
        - /url: mailto:nucleussjec@gmail.com
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile, mkdir } from 'node:fs/promises';
  3   | 
  4   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5   | const destinations = [['Home', '/'], ['Experiences', '/events'], ['Our work', '/projects'], ['The people', '/team']];
  6   | await mkdir('output/navbar-match', { recursive: true });
  7   | 
  8   | test.beforeEach(async ({ page }) => {
  9   |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  10  | });
  11  | const menu = page => page.getByRole('navigation', { name: 'Main navigation' });
  12  | const toggle = page => page.locator('.morph-nav__toggle');
  13  | async function settledOpen(page) {
> 14  |   await expect(page.locator('.morph-nav__links li').last()).toHaveCSS('opacity', '1');
      |                                                             ^ Error: expect(locator).toHaveCSS(expected) failed
  15  |   await expect(page.locator('.morph-nav__overlay')).toHaveCSS('transform', 'none');
  16  | }
  17  | 
  18  | test('reference layout keeps a centered pill and reveals a full-screen menu in five bands', async ({ page }) => {
  19  |   const errors = [];
  20  |   page.on('pageerror', error => errors.push(error.message));
  21  |   await page.setViewportSize({ width: 1440, height: 900 });
  22  |   await page.goto('/');
  23  |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15000 });
  24  |   const pill = page.locator('.morph-nav__pill');
  25  |   const closed = await pill.boundingBox();
  26  |   expect(Math.abs(closed.x + closed.width / 2 - 720)).toBeLessThan(1);
  27  |   expect(closed.y).toBe(16);
  28  |   expect(closed.height).toBe(58);
  29  |   await page.screenshot({ path: 'output/navbar-match/desktop-closed.png' });
  30  |   await page.evaluate(() => {
  31  |     window.navFrames = [];
  32  |     const begin = performance.now();
  33  |     const sample = () => {
  34  |       window.navFrames.push({
  35  |         bands: [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x),
  36  |         text: Number(getComputedStyle(document.querySelector('.morph-nav__links li')).opacity),
  37  |       });
  38  |       if (performance.now() - begin < 2400) requestAnimationFrame(sample);
  39  |     };
  40  |     requestAnimationFrame(sample);
  41  |   });
  42  |   await toggle(page).click();
  43  |   await page.waitForTimeout(250);
  44  |   await page.screenshot({ path: 'output/navbar-match/desktop-opening.png' });
  45  |   await settledOpen(page);
  46  |   await expect(page.locator('.morph-nav__footer > div').last()).toHaveCSS('opacity', '1');
  47  |   expect(await pill.boundingBox()).toEqual(closed);
  48  |   const frames = await page.evaluate(() => window.navFrames);
  49  |   expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 && frame.bands[4] > frame.bands[0] + 100 && frame.text < .1)).toBe(true);
  50  |   const overlay = await page.locator('.morph-nav__overlay').boundingBox();
  51  |   expect(overlay).toEqual({ x: 0, y: 0, width: 1440, height: 900 });
  52  |   await expect(page.locator('.morph-nav__links .morph-nav__link')).toHaveCount(4);
  53  |   expect(await page.locator('.morph-nav__links').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(100);
  54  |   await expect(menu(page).getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  55  |   await page.screenshot({ path: 'output/navbar-match/desktop-open.png' });
  56  |   await menu(page).getByRole('link', { name: 'Our work', exact: true }).hover();
  57  |   await page.waitForTimeout(120);
  58  |   await page.screenshot({ path: 'output/navbar-match/desktop-hover.png' });
  59  |   await toggle(page).click();
  60  |   await expect(page.locator('.morph-nav__overlay')).toHaveAttribute('inert');
  61  |   await expect.poll(async () => Math.round((await page.locator('.morph-nav__overlay').boundingBox()).x)).toBe(1440);
  62  |   expect(errors).toEqual([]);
  63  | });
  64  | 
  65  | test('reopening replays the stagger after completed and interrupted closes', async ({ page }, testInfo) => {
  66  |   await page.emulateMedia({ reducedMotion: 'no-preference' });
  67  |   await page.setViewportSize({ width: 1440, height: 900 });
  68  |   await page.goto('/');
  69  |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15000 });
  70  | 
  71  |   for (const closeDelay of [null, 2000, 75, 300]) {
  72  |     if (closeDelay !== null) {
  73  |       await toggle(page).dispatchEvent('click');
  74  |       await page.waitForTimeout(closeDelay);
  75  |     }
  76  |     await page.evaluate(() => {
  77  |       window.reopenFrames = [];
  78  |       const sample = () => {
  79  |         const bands = [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x);
  80  |         window.reopenFrames.push({
  81  |           bands,
  82  |           lastBandOffset: bands[4] - document.querySelector('.morph-nav__overlay').getBoundingClientRect().x,
  83  |           text: Number(getComputedStyle(document.querySelector('.morph-nav__links li')).opacity),
  84  |         });
  85  |         window.reopenFrameId = requestAnimationFrame(sample);
  86  |       };
  87  |       window.reopenFrameId = requestAnimationFrame(sample);
  88  |     });
  89  |     await toggle(page).dispatchEvent('click');
  90  |     await settledOpen(page);
  91  |     const frames = await page.evaluate(() => {
  92  |       cancelAnimationFrame(window.reopenFrameId);
  93  |       return window.reopenFrames;
  94  |     });
  95  |     await testInfo.attach(`sweep-after-${closeDelay ?? 'initial'}-close`, { body: JSON.stringify(frames), contentType: 'application/json' });
  96  |     expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 &&
  97  |       frame.bands[4] > frame.bands[0] + 100 && frame.lastBandOffset > 1439 && frame.text < .1),
  98  |     closeDelay === null ? 'Expected a visible band stagger on first open' :
  99  |       `Expected a visible band stagger after a ${closeDelay} ms close`).toBe(true);
  100 |   }
  101 | });
  102 | 
  103 | test('keyboard focus stays in the full-screen menu and Escape restores the page', async ({ page }) => {
  104 |   await page.goto('/recruitment');
  105 |   await toggle(page).focus();
  106 |   await page.keyboard.press('Enter');
  107 |   await settledOpen(page);
  108 |   await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
  109 |   await expect(page.locator('main')).toHaveAttribute('inert');
  110 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  111 |   for (const [title] of destinations) {
  112 |     await page.keyboard.press('Tab');
  113 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  114 |   }
```