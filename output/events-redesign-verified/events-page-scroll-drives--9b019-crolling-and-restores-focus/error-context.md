# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: events-page.spec.mjs >> scroll drives a curved page turn, locks background scrolling and restores focus
- Location: tests\browser\events-page.spec.mjs:78:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  getByRole('button', { name: 'Open Inauguration event book', exact: true }).locator('.flip-card__body')
Expected: "matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)"
Received: "none"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" getByRole('button', { name: 'Open Inauguration event book', exact: true }).locator('.flip-card__body') with timeout 5000ms
  - waiting for getByRole('button', { name: 'Open Inauguration event book', exact: true }).locator('.flip-card__body')
    2 × locator resolved to <span aria-hidden="true" class="flip-card__body">…</span>
      - unexpected value "matrix(1, 0, 0, 1, 0, 0)"
    - locator resolved to <span aria-hidden="true" class="flip-card__body">…</span>
    - unexpected value "matrix3d(0.68302, 0, -0.7304, 0, 0, 1, 0, 0, 0.7304, 0, 0.68302, 0, 0, 0, 0, 1)"
    - locator resolved to <span aria-hidden="true" class="flip-card__body">…</span>
    - unexpected value "matrix3d(0.979465, 0, -0.201616, 0, 0, 1, 0, 0, 0.201616, 0, 0.979465, 0, 0, 0, 0, 1)"
    10 × locator resolved to <span aria-hidden="true" class="flip-card__body">…</span>
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
    - region "Nucleus events" [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - paragraph [ref=e15]: Nucleus / The archive
          - generic [ref=e17]:
            - heading "Events." [level=1] [ref=e18]
            - paragraph [ref=e19]: Small sparks. Lasting connections.Open a chapter of our journey.
          - generic [ref=e20]:
            - generic [ref=e21]: FIELD NOTES / SJEC
            - generic [ref=e22]: 07 CHAPTERS & COUNTING
        - generic [ref=e23]:
          - article [ref=e24]:
            - generic [ref=e25]: STATION 01
            - button "Open Inauguration event book" [ref=e29] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: Inauguration
                  - generic:
                    - generic:
                      - strong: Inauguration
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - article [ref=e30]:
            - generic [ref=e31]: STATION 02
            - button "Open Dev event book" [ref=e35] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: Dev
                  - generic:
                    - generic:
                      - strong: Dev
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - article [ref=e36]:
            - generic [ref=e37]: STATION 03
            - button "Open Khoj event book" [ref=e41] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: Khoj
                  - generic:
                    - generic:
                      - strong: Khoj
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - article [ref=e42]:
            - generic [ref=e43]: STATION 04
            - button "Open LinkedIn event book" [ref=e47] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: LinkedIn
                  - generic:
                    - generic:
                      - strong: LinkedIn
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - article [ref=e48]:
            - generic [ref=e49]: STATION 05
            - button "Open n8n event book" [ref=e53] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: n8n
                  - generic:
                    - generic:
                      - strong: n8n
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - article [ref=e54]:
            - generic [ref=e55]: STATION 06
            - button "Open Noesis event book" [ref=e59] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: Noesis
                  - generic:
                    - generic:
                      - strong: Noesis
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - article [ref=e60]:
            - generic [ref=e61]: STATION 07
            - button "Open Unlocked event book" [ref=e65] [cursor=pointer]:
              - generic [aria-hidden]:
                - generic:
                  - generic: Unlocked
                  - generic:
                    - generic:
                      - strong: Unlocked
                    - generic: Date to be added · Workshop
                - generic: Hover Me
          - button "Ride Immersive Experience" [ref=e67] [cursor=pointer]
          - button "Ride Immersive Experience" [ref=e74] [cursor=pointer]
        - generic [ref=e80]:
          - generic [ref=e81]: Hover to discover. Click to relive.
          - generic [ref=e82]: Made of many minds.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import AxeBuilder from '@axe-core/playwright';
  4   | 
  5   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  6   | const folders = ['inauguration', 'dev', 'khoj', 'linkedin', 'n8n', 'noesis', 'unlocked'];
  7   | const titles = ['Inauguration', 'Dev', 'Khoj', 'LinkedIn', 'n8n', 'Noesis', 'Unlocked'];
  8   | const counts = [12, 2, 4, 1, 4, 7, 6];
  9   | 
  10  | async function open(page) {
  11  |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  12  |   await page.goto('/events');
  13  |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15000 });
  14  | }
  15  | 
  16  | for (const [width, columns] of [[1440, 3], [820, 2], [390, 1]]) {
  17  |   test(`Events grid has ${columns} columns, working images and two portals at ${width}px`, async ({ page }, info) => {
  18  |     await page.setViewportSize({ width, height:900 });
  19  |     await open(page);
  20  |     await expect(page).toHaveTitle(/Events/);
  21  |     const cards = page.locator('.event-flip-card');
  22  |     await expect(cards).toHaveCount(7);
  23  |     expect(await cards.evaluateAll(elements => elements.map(element => element.dataset.workshop))).toEqual(folders);
  24  |     const boxes = await cards.evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x:box.x, y:box.y, width:box.width, height:box.height }; }));
  25  |     expect(new Set(boxes.map(box => box.x)).size).toBe(columns);
  26  |     for (const box of boxes) { expect(box.width).toBe(190); expect(box.height).toBe(254); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width); }
  27  |     for (let index = 0; index < 7; index++) {
  28  |       await cards.nth(index).scrollIntoViewIfNeeded();
  29  |       const photo = cards.nth(index).locator('img');
  30  |       await expect(photo).toHaveAttribute('src', new RegExp(`/workshops/${folders[index]}/.*1\\.avif`));
  31  |       await expect.poll(() => photo.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  32  |     }
  33  |     await expect(page.getByRole('button', { name:'Ride Immersive Experience', exact:true })).toHaveCount(2);
  34  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  35  |     await page.evaluate(() => scrollTo(0, 0));
  36  |     await page.screenshot({ path:info.outputPath('events-grid.png'), fullPage:true });
  37  |   });
  38  | }
  39  | 
  40  | test('every card opens its own sequential, edge-to-edge book and the last turn dismisses it', async ({ page }, info) => {
  41  |   await page.emulateMedia({ reducedMotion:'reduce' });
  42  |   await open(page);
  43  |   for (let index = 0; index < 7; index++) {
  44  |     const card = page.getByRole('button', { name:`Open ${titles[index]} event book`, exact:true });
  45  |     await card.click();
  46  |     const dialog = page.getByRole('dialog', { name:titles[index], exact:true }), book = dialog.locator('.station-book');
  47  |     await expect(book).toHaveAttribute('data-scroll-engine', 'lenis');
  48  |     await expect(book).toHaveAttribute('data-workshop', folders[index]);
  49  |     await expect(book.locator('.station-book__story')).toContainText('Key highlights');
  50  |     const cover = book.locator('.station-book__cover-art img');
  51  |     await expect(cover).toHaveAttribute('src', new RegExp(`/workshops/${folders[index]}/.*1\\.avif`));
  52  |     await expect(cover).toHaveCSS('object-fit', 'cover');
  53  |     if (index === 0) await page.screenshot({ path:info.outputPath('book-editorial.png') });
  54  |     const sources = [await cover.getAttribute('src')];
  55  |     const spreads = 1 + Math.ceil((counts[index] - 1) / 2);
  56  |     for (let spread = 2; spread <= spreads; spread++) {
  57  |       await dialog.getByRole('button', { name:'Next book page', exact:true }).click();
  58  |       await expect(book).toHaveAttribute('data-book-page', String(spread));
  59  |       const pages = book.locator('.station-book__spread');
  60  |       expect(await pages.innerText()).toBe('');
  61  |       sources.push(...await pages.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src'))));
  62  |       for (const image of await pages.locator('img').all()) {
  63  |         await expect(image).toHaveCSS('object-fit', 'cover');
  64  |         await expect.poll(() => image.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  65  |       }
  66  |       if (index === 0 && spread === 2) await page.screenshot({ path:info.outputPath('book-photo-spread.png') });
  67  |     }
  68  |     expect(sources).toHaveLength(counts[index]);
  69  |     expect(new Set(sources).size).toBe(counts[index]);
  70  |     await book.getByRole('region', { name:`${titles[index]} event book`, exact:true }).focus();
  71  |     await page.keyboard.press('ArrowRight');
  72  |     await expect(dialog).toHaveCount(0);
  73  |     await expect(card).toBeFocused();
  74  |     expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  75  |   }
  76  | });
  77  | 
  78  | test('scroll drives a curved page turn, locks background scrolling and restores focus', async ({ page }, info) => {
  79  |   await open(page);
  80  |   const card = page.getByRole('button', { name:'Open Inauguration event book', exact:true });
  81  |   await card.hover();
> 82  |   await expect(card.locator('.flip-card__body')).toHaveCSS('transform', 'matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)');
      |                                                  ^ Error: expect(locator).toHaveCSS(expected) failed
  83  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  84  |   await card.click();
  85  |   const scroll = await page.evaluate(() => scrollY);
  86  |   await page.locator('.station-book__page--right').hover();
  87  |   await page.mouse.wheel(0, 200);
  88  |   await expect(page.locator('.station-book')).toHaveAttribute('data-book-turning', 'true');
  89  |   await expect(page.locator('.station-book__strip')).toHaveCount(8);
  90  |   await page.screenshot({ path:info.outputPath('book-mid-turn.png') });
  91  |   expect(await page.evaluate(() => scrollY)).toBe(scroll);
  92  |   await page.keyboard.press('Escape');
  93  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  94  |   await expect(card).toBeFocused();
  95  | });
  96  | 
  97  | test('both portals require confirmation, animate into the ride and return focus', async ({ page }, info) => {
  98  |   const errors = [], requests = [];
  99  |   page.on('pageerror', error => errors.push(error.message));
  100 |   page.on('request', request => { if (/LogoWorld|event-world/.test(request.url())) requests.push(request.url()); });
  101 |   await open(page);
  102 |   expect(requests).toEqual([]);
  103 |   for (let index = 0; index < 2; index++) {
  104 |     const trigger = page.getByRole('button', { name:'Ride Immersive Experience', exact:true }).nth(index);
  105 |     await trigger.click();
  106 |     await expect(page.getByRole('dialog')).toContainText('Do you want to hop into the Nucleus Ride?');
  107 |     await page.getByRole('button', { name:'Maybe Later', exact:true }).click();
  108 |     await expect(trigger).toBeFocused();
  109 |     await expect(page.locator('.nx-world')).toHaveCount(0);
  110 |   }
  111 |   expect(requests).toEqual([]);
  112 |   await page.getByRole('button', { name:'Ride Immersive Experience', exact:true }).last().click();
  113 |   await page.screenshot({ path:info.outputPath('portal-invitation.png') });
  114 |   await page.getByRole('button', { name:"Yes, Let's Go" }).click();
  115 |   await expect(page.getByRole('status', { name:'Entering the Nucleus Ride' })).toBeVisible();
  116 |   await expect(page.locator('.events-page')).toHaveAttribute('data-event-mode', 'immersive');
  117 |   await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout:30000 });
  118 |   await page.getByRole('button', { name:'Back to Events', exact:true }).click();
  119 |   await expect(page.getByRole('button', { name:'Ride Immersive Experience', exact:true }).last()).toBeFocused();
  120 |   await expect(page.locator('.nx-world')).toHaveCount(0);
  121 |   expect(errors).toEqual([]);
  122 | });
  123 | 
  124 | test('grid, invitation and book remain accessible on a small phone', async ({ page }) => {
  125 |   await page.setViewportSize({ width:320, height:568 });
  126 |   await page.emulateMedia({ reducedMotion:'reduce' });
  127 |   await open(page);
  128 |   expect((await new AxeBuilder({ page }).include('.events-page').analyze()).violations).toEqual([]);
  129 |   await page.getByRole('button', { name:'Ride Immersive Experience', exact:true }).first().click();
  130 |   expect((await new AxeBuilder({ page }).include('.events-portal-dialog').analyze()).violations).toEqual([]);
  131 |   await page.keyboard.press('Escape');
  132 |   await page.getByRole('button', { name:'Open Inauguration event book', exact:true }).click();
  133 |   const dialog = page.getByRole('dialog'), box = await dialog.boundingBox();
  134 |   expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
  135 |   expect(box.x + box.width).toBeLessThanOrEqual(320); expect(box.y + box.height).toBeLessThanOrEqual(568);
  136 |   expect((await new AxeBuilder({ page }).include('.nx-book-dialog').analyze()).violations).toEqual([]);
  137 | });
  138 | 
```