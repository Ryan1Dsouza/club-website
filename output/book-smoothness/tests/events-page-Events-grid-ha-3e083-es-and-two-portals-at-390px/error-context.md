# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: events-page.spec.mjs >> Events grid has 1 columns, working images and two portals at 390px
- Location: tests\browser\events-page.spec.mjs:18:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.event-card')
Expected: 7
Received: 8
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('.event-card') with timeout 5000ms
  - waiting for locator('.event-card')
    14 × locator resolved to 8 elements
       - unexpected value "8"

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
        - generic [aria-hidden]:
          - img:
            - generic: NUCLEUS / JUNCTION 01
        - generic [ref=e14]:
          - paragraph [ref=e15]: THE NUCLEUS ARCHIVE / 08 CHAPTERS
          - heading "Events." [level=1] [ref=e16]
          - paragraph [ref=e17]: Good ideas bring us together. These are the moments that stay.
        - generic [ref=e18]:
          - article [ref=e19]:
            - button "Open Inauguration event book" [ref=e20] [cursor=pointer]:
              - generic [ref=e21]:
                - generic [ref=e22]: FIELD NOTES / 01
                - generic [ref=e23]: Open the story
              - generic [ref=e27]:
                - generic [ref=e28]:
                  - text: Workshop
                  - generic [ref=e29]: 12 photographs
                - generic [ref=e30]: Inauguration
                - generic [ref=e34]:
                  - generic [ref=e35]: From the Nucleus archive
                  - generic [ref=e36]: "01"
          - article [ref=e37]:
            - button "Open Dev event book" [ref=e38] [cursor=pointer]:
              - generic [ref=e39]:
                - generic [ref=e40]: FIELD NOTES / 02
                - generic [ref=e41]: Open the story
              - generic [ref=e45]:
                - generic [ref=e46]:
                  - text: Workshop
                  - generic [ref=e47]: 02 photographs
                - generic [ref=e48]: Dev
                - generic [ref=e52]:
                  - generic [ref=e53]: From the Nucleus archive
                  - generic [ref=e54]: "02"
          - article [ref=e55]:
            - button "Open Khoj event book" [ref=e56] [cursor=pointer]:
              - generic [ref=e57]:
                - generic [ref=e58]: FIELD NOTES / 03
                - generic [ref=e59]: Open the story
              - generic [ref=e63]:
                - generic [ref=e64]:
                  - text: Workshop
                  - generic [ref=e65]: 04 photographs
                - generic [ref=e66]: Khoj
                - generic [ref=e70]:
                  - generic [ref=e71]: From the Nucleus archive
                  - generic [ref=e72]: "03"
          - article [ref=e73]:
            - button "Open LinkedIn event book" [ref=e74] [cursor=pointer]:
              - generic [ref=e75]:
                - generic [ref=e76]: FIELD NOTES / 04
                - generic [ref=e77]: Open the story
              - generic [ref=e81]:
                - generic [ref=e82]:
                  - text: Workshop
                  - generic [ref=e83]: 09 photographs
                - generic [ref=e84]: LinkedIn
                - generic [ref=e88]:
                  - generic [ref=e89]: From the Nucleus archive
                  - generic [ref=e90]: "04"
          - article [ref=e91]:
            - button "Open n8n event book" [ref=e92] [cursor=pointer]:
              - generic [ref=e93]:
                - generic [ref=e94]: FIELD NOTES / 05
                - generic [ref=e95]: Open the story
              - generic [ref=e99]:
                - generic [ref=e100]:
                  - text: Workshop
                  - generic [ref=e101]: 04 photographs
                - generic [ref=e102]: n8n
                - generic [ref=e106]:
                  - generic [ref=e107]: From the Nucleus archive
                  - generic [ref=e108]: "05"
          - article [ref=e109]:
            - button "Open Noesis event book" [ref=e110] [cursor=pointer]:
              - generic [ref=e111]:
                - generic [ref=e112]: FIELD NOTES / 06
                - generic [ref=e113]: Open the story
              - generic [ref=e117]:
                - generic [ref=e118]:
                  - text: Workshop
                  - generic [ref=e119]: 07 photographs
                - generic [ref=e120]: Noesis
                - generic [ref=e124]:
                  - generic [ref=e125]: From the Nucleus archive
                  - generic [ref=e126]: "06"
          - article [ref=e127]:
            - button "Open Unlocked event book" [ref=e128] [cursor=pointer]:
              - generic [ref=e129]:
                - generic [ref=e130]: FIELD NOTES / 07
                - generic [ref=e131]: Open the story
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - text: Workshop
                  - generic [ref=e137]: 06 photographs
                - generic [ref=e138]: Unlocked
                - generic [ref=e142]:
                  - generic [ref=e143]: From the Nucleus archive
                  - generic [ref=e144]: "07"
          - article [ref=e145]:
            - button "Open Coding event book" [ref=e146] [cursor=pointer]:
              - generic [ref=e147]:
                - generic [ref=e148]: FIELD NOTES / 08
                - generic [ref=e149]: Open the story
              - generic [ref=e153]:
                - generic [ref=e154]:
                  - text: Workshop
                  - generic [ref=e155]: 11 photographs
                - generic [ref=e156]: Coding
                - generic [ref=e160]:
                  - generic [ref=e161]: From the Nucleus archive
                  - generic [ref=e162]: "08"
          - button "The Nucleus Ride" [ref=e164] [cursor=pointer]
        - generic [ref=e167]:
          - generic [ref=e168]: Open a story. Relive a moment.
          - generic [ref=e169]: Made of many minds.
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
  10  | async function open(page, data = site) {
  11  |   await page.route('**/api/site', route => route.fulfill({ json: data }));
  12  |   await page.goto('/events');
  13  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout:15000 });
  14  |   await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15000 });
  15  | }
  16  | 
  17  | for (const [width, columns] of [[2560, 3], [1440, 3], [820, 2], [390, 1]]) {
  18  |   test(`Events grid has ${columns} columns, working images and two portals at ${width}px`, async ({ page }, info) => {
  19  |     await page.setViewportSize({ width, height:900 });
  20  |     await open(page, width === 2560 ? { ...site, events:[] } : site);
  21  |     await expect(page).toHaveTitle(/Events/);
  22  |     const cards = page.locator('.event-card');
> 23  |     await expect(cards).toHaveCount(7);
      |                         ^ Error: expect(locator).toHaveCount(expected) failed
  24  |     expect(await cards.evaluateAll(elements => elements.map(element => element.dataset.workshop))).toEqual(folders);
  25  |     const boxes = await cards.evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x:box.x, y:box.y, width:box.width, height:box.height }; }));
  26  |     expect(new Set(boxes.map(box => box.x)).size).toBe(columns);
  27  |     for (const box of boxes) { expect(box.width).toBeGreaterThan(250); expect(box.height).toBeGreaterThan(300); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width); }
  28  |     if (columns > 1) expect(boxes[1].x - boxes[0].x - boxes[0].width).toBeLessThanOrEqual(81);
  29  |     if (columns === 3) expect((await page.locator('.events-archive').boundingBox()).width).toBeLessThanOrEqual(1440);
  30  |     for (let index = 0; index < 7; index++) {
  31  |       await cards.nth(index).scrollIntoViewIfNeeded();
  32  |       const photo = cards.nth(index).locator('img');
  33  |       await expect(photo).toHaveAttribute('src', new RegExp(`/workshops/${folders[index]}/.*1\\.avif`));
  34  |       await expect.poll(() => photo.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  35  |     }
  36  |     await expect(page.locator('.events-portal')).toHaveCount(2);
  37  |     await expect(page.getByRole('button', { name:'The Nucleus Ride', exact:true })).toHaveCount(columns === 3 ? 2 : 1);
  38  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  39  |     await page.evaluate(() => scrollTo(0, 0));
  40  |     await page.screenshot({ path:info.outputPath('events-grid.png'), fullPage:true });
  41  |   });
  42  | }
  43  | 
  44  | test('every card opens its own sequential, edge-to-edge book and the last turn dismisses it', async ({ page }, info) => {
  45  |   await page.emulateMedia({ reducedMotion:'reduce' });
  46  |   await open(page);
  47  |   for (let index = 0; index < 7; index++) {
  48  |     const card = page.getByRole('button', { name:`Open ${titles[index]} event book`, exact:true });
  49  |     await card.click();
  50  |     const dialog = page.getByRole('dialog', { name:titles[index], exact:true }), book = dialog.locator('.station-book');
  51  |     await expect(book).toHaveAttribute('data-scroll-engine', 'lenis');
  52  |     await expect(book).toHaveAttribute('data-workshop', folders[index]);
  53  |     await expect(book.locator('.station-book__story')).toContainText('Key highlights');
  54  |     const cover = book.locator('.station-book__cover-art img');
  55  |     await expect(cover).toHaveAttribute('src', new RegExp(`/workshops/${folders[index]}/.*1\\.avif`));
  56  |     await expect(cover).toHaveCSS('object-fit', 'contain');
  57  |     if (index === 0) await page.screenshot({ path:info.outputPath('book-editorial.png') });
  58  |     const sources = [await cover.getAttribute('src')];
  59  |     const spreads = 1 + Math.ceil((counts[index] - 1) / 2);
  60  |     for (let spread = 2; spread <= spreads; spread++) {
  61  |       await dialog.getByRole('button', { name:'Next book page', exact:true }).click();
  62  |       await expect(book).toHaveAttribute('data-book-page', String(spread));
  63  |       const pages = book.locator('.station-book__spread');
  64  |       expect(await pages.innerText()).toBe('');
  65  |       sources.push(...await pages.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src'))));
  66  |       for (const image of await pages.locator('img').all()) {
  67  |         await expect(image).toHaveCSS('object-fit', 'contain');
  68  |         await expect.poll(() => image.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  69  |         await image.evaluate(image => image.decode());
  70  |         expect((await image.boundingBox()).height).toBeGreaterThan(100);
  71  |       }
  72  |       if (index === 0 && spread === 2) await page.screenshot({ path:info.outputPath('book-photo-spread.png') });
  73  |     }
  74  |     expect(sources).toHaveLength(counts[index]);
  75  |     expect(new Set(sources).size).toBe(counts[index]);
  76  |     await book.getByRole('region', { name:`${titles[index]} event book`, exact:true }).focus();
  77  |     await page.keyboard.press('ArrowRight');
  78  |     await expect(dialog).toHaveCount(0);
  79  |     await expect(card).toBeFocused();
  80  |     expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  81  |   }
  82  | });
  83  | 
  84  | test('scroll drives a curved page turn, locks background scrolling and restores focus', async ({ page }, info) => {
  85  |   await open(page);
  86  |   const card = page.getByRole('button', { name:'Open Inauguration event book', exact:true });
  87  |   await card.focus();
  88  |   await expect(card).toHaveCSS('outline-style', 'solid');
  89  |   await card.hover();
  90  |   await expect(card.locator('.event-card__view')).toHaveCSS('opacity', '1');
  91  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  92  |   await card.click();
  93  |   const scroll = await page.evaluate(() => scrollY);
  94  |   await page.locator('.station-book__page--right').hover();
  95  |   await page.mouse.wheel(0, 200);
  96  |   await expect(page.locator('.station-book')).toHaveAttribute('data-book-turning', 'true');
  97  |   await expect(page.locator('.station-book__strip')).toHaveCount(8);
  98  |   await page.screenshot({ path:info.outputPath('book-mid-turn.png') });
  99  |   expect(await page.evaluate(() => scrollY)).toBe(scroll);
  100 |   await page.keyboard.press('Escape');
  101 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  102 |   await expect(card).toBeFocused();
  103 |   await expect(card).toBeFocused();
  104 | });
  105 | 
  106 | test('both portals require confirmation, animate into the ride and return focus', async ({ page }, info) => {
  107 |   const errors = [], requests = [];
  108 |   page.on('pageerror', error => errors.push(error.message));
  109 |   page.on('request', request => { if (/LogoWorld|event-world/.test(request.url())) requests.push(request.url()); });
  110 |   await open(page);
  111 |   expect(requests).toEqual([]);
  112 |   for (let index = 0; index < 2; index++) {
  113 |     const trigger = page.getByRole('button', { name:'The Nucleus Ride', exact:true }).nth(index);
  114 |     await trigger.click();
  115 |     await expect(page.getByRole('dialog')).toContainText('Do you want to hop into the Nucleus Ride?');
  116 |     await page.getByRole('button', { name:'Maybe Later', exact:true }).click();
  117 |     await expect(trigger).toBeFocused();
  118 |     await expect(page.locator('.nx-world')).toHaveCount(0);
  119 |   }
  120 |   expect(requests).toEqual([]);
  121 |   await page.getByRole('button', { name:'The Nucleus Ride', exact:true }).last().click();
  122 |   await page.screenshot({ path:info.outputPath('portal-invitation.png') });
  123 |   await page.getByRole('button', { name:"Yes, Let's Go" }).click();
```