# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ride-stations.spec.mjs >> seven matching stations are separate and boardable at 390x844
- Location: tests\browser\ride-stations.spec.mjs:12:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('.station-book')
Expected: "0.000"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" locator('.station-book') with timeout 5000ms
  - waiting for locator('.station-book')
    - locator resolved to <div data-book-page="1" class="station-book" data-workshop="khoj" data-station-number="03" data-book-turning="true" data-book-closing="false" data-book-progress="0.706" data-scroll-engine="lenis">…</div>
    - unexpected value "0.706"
    - locator resolved to <div data-book-page="1" class="station-book" data-workshop="khoj" data-station-number="03" data-book-turning="true" data-book-closing="false" data-book-progress="0.625" data-scroll-engine="lenis">…</div>
    - unexpected value "0.625"
    - locator resolved to <div data-book-page="1" class="station-book" data-workshop="khoj" data-station-number="03" data-book-turning="true" data-book-closing="false" data-book-progress="0.366" data-scroll-engine="lenis">…</div>
    - unexpected value "0.366"
    - locator resolved to <div data-book-page="1" class="station-book" data-workshop="khoj" data-station-number="03" data-book-turning="true" data-book-closing="false" data-book-progress="0.095" data-scroll-engine="lenis">…</div>
    - unexpected value "0.095"
    - locator resolved to <div data-book-page="1" class="station-book" data-workshop="khoj" data-station-number="03" data-book-turning="true" data-book-closing="false" data-book-progress="0.012" data-scroll-engine="lenis">…</div>
    - unexpected value "0.012"
    - waiting for "http://127.0.0.1:3010/events" navigation to finish...
    - navigated to "http://127.0.0.1:3010/events"

```

```yaml
- status: Connecting the dots…
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - navigation "Main navigation":
    - link "Nucleus home":
      - /url: /
      - text: Nucleus
    - button "Open menu"
- main:
  - region "Nucleus events":
    - paragraph: Nucleus / The archive
    - heading "Events." [level=1]
    - paragraph: Small sparks. Lasting connections. Open a chapter of our journey.
    - text: FIELD NOTES / SJEC 07 CHAPTERS & COUNTING
    - article:
      - text: STATION 01
      - img
      - button "Open Inauguration event book"
    - article:
      - text: STATION 02
      - img
      - button "Open Dev event book"
    - article:
      - text: STATION 03
      - img
      - button "Open Khoj event book"
    - article:
      - text: STATION 04
      - img
      - button "Open LinkedIn event book"
    - article:
      - text: STATION 05
      - img
      - button "Open n8n event book"
    - article:
      - text: STATION 06
      - img
      - button "Open Noesis event book"
    - article:
      - text: STATION 07
      - img
      - button "Open Unlocked event book"
    - button "Ride Immersive Experience":
      - text: Ride Immersive Experience
      - img
    - button "Ride Immersive Experience":
      - text: Ride Immersive Experience
      - img
    - text: Hover to discover. Click to relive. Made of many minds.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { readFile } from 'node:fs/promises';
  3  | 
  4  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5  | const numbers = ['01', '02', '03', '04', '05', '06', '07'];
  6  | const distances = [211, 343, 595, 727, 1027, 1243, 1487];
  7  | const titles = ['Inauguration', 'Dev', 'Khoj', 'LinkedIn', 'n8n', 'Noesis', 'Unlocked'];
  8  | const primary = ['in1.avif', 'd1.avif', 'kh1.avif', 'linkdin1.avif', 'n8n1.avif', 'no1.avif', 'un1.avif'];
  9  | const counts = [12, 2, 4, 1, 4, 7, 6];
  10 | 
  11 | for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  12 |   test(`seven matching stations are separate and boardable at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
  13 |     test.setTimeout(120_000);
  14 |     const errors = [];
  15 |     page.on('pageerror', error => errors.push(error.message));
  16 |     await page.setViewportSize(viewport);
  17 |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  18 |     await page.goto('/events');
  19 |     await page.getByRole('button', { name: 'Ride Immersive Experience', exact: true }).first().click();
  20 |     await page.getByRole('button', { name: "Yes, Let's Go" }).click();
  21 |     await expect(page.locator('.nx-map-button')).toBeEnabled({ timeout: 30_000 });
  22 |     await expect(page.locator('[data-loading-screen]')).toHaveCount(0, { timeout: 15_000 });
  23 |     if (viewport.width <= 768) await page.getByRole('button', { name: 'Open holographic map' }).click();
  24 |     const world = page.locator('.nx-world'), markers = world.locator('[data-world-station]');
  25 |     await expect(markers).toHaveCount(7);
  26 |     await expect(markers.locator('span')).toHaveText(numbers);
  27 |     for (const marker of await markers.all()) {
  28 |       await expect(marker).toBeVisible();
  29 |       await expect(marker.locator('span')).toHaveCSS('width', '46px');
  30 |     }
  31 |     const groups = [markers];
  32 |     if (viewport.width > 768) groups.push(page.getByRole('navigation', { name: 'Ride route map' }).getByRole('button'));
  33 |     for (const group of groups) {
  34 |       const boxes = await group.evaluateAll(elements => elements.map(element => {
  35 |         const r = element.getBoundingClientRect();
  36 |         return { x: r.x + r.width / 2, y: r.y + r.height / 2, radius: r.width / 2 };
  37 |       }));
  38 |       expect(boxes).toHaveLength(7);
  39 |       for (const [i, box] of boxes.entries()) for (const other of boxes.slice(i + 1)) {
  40 |         expect(Math.hypot(box.x - other.x, box.y - other.y)).toBeGreaterThan(box.radius + other.radius);
  41 |       }
  42 |     }
  43 |     await page.screenshot({ path: info.outputPath('seven-station-map.png') });
  44 |     for (let index = 0; index < 7; index++) {
  45 |       await page.getByRole('button', { name: `Ride from station ${numbers[index]}: ${titles[index]}`, exact: true }).click();
  46 |       const book = page.locator('.station-book');
  47 |       await expect(world).toHaveAttribute('data-arrival-stage', 'panning');
  48 |       await expect(book).toHaveCount(0);
  49 |       await expect(page.getByRole('dialog', { name: titles[index], exact: true })).toBeVisible();
  50 |       await expect(world).toHaveAttribute('data-pan-progress', '1.000');
  51 |       await expect(world).toHaveAttribute('data-pan-angle', '-1.5708');
  52 |       await expect(book).toHaveAttribute('data-station-number', numbers[index]);
  53 |       await expect(book).toHaveAttribute('data-scroll-engine', 'lenis');
  54 |       await expect(world).toHaveAttribute('data-distance', distances[index].toFixed(2));
  55 |       const opening = book.locator('.station-book__cover-art img');
  56 |       await expect(opening).toHaveAttribute('src', new RegExp(primary[index].replace('.', '\\.')));
  57 |       await expect.poll(() => opening.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  58 |       await opening.evaluate(async image => { await image.decode(); });
  59 |       await book.evaluate(element => Promise.all(element.closest('dialog').getAnimations().map(animation => animation.finished)));
  60 |       const primarySource = await opening.getAttribute('src');
  61 |       if (index === 0) await page.screenshot({ path: info.outputPath('inauguration-first-spread.png') });
  62 |       const before = await world.getAttribute('data-distance');
  63 |       if (counts[index] > 1) {
  64 |         await book.locator('.station-book__page--right').hover();
  65 |         await page.mouse.wheel(0, 420);
  66 |         await expect(book).toHaveAttribute('data-book-turning', 'true');
  67 |         await expect(book.locator('.station-book__leaf')).toBeVisible();
  68 |         await expect(book).toHaveAttribute('data-book-page', '2');
  69 |         await expect(book).toHaveAttribute('data-book-turning', 'false');
  70 |         const gallery = book.locator('.station-book__spread');
  71 |         await expect(gallery.locator('img')).toHaveCount(Math.min(2, counts[index] - 1));
  72 |         await expect.poll(() => gallery.locator('img').evaluateAll(images => images.every(image => image.naturalWidth > 0))).toBe(true);
  73 |         expect(await gallery.innerText()).toBe('');
  74 |         expect(await gallery.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src')))).not.toContain(primarySource);
  75 |         if (index === 0) await page.screenshot({ path: info.outputPath('inauguration-photo-gallery.png') });
  76 |         await page.getByRole('button', { name: 'Previous book page' }).click();
> 77 |         await expect(book).toHaveAttribute('data-book-progress', '0.000');
     |                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  78 |       } else await expect(page.getByRole('button', { name: 'Close book after last page' })).toBeEnabled();
  79 |       await expect(world).toHaveAttribute('data-distance', before);
  80 |       await page.getByRole('button', { name: 'Continue ride', exact: true }).click();
  81 |       await expect(world).toHaveAttribute('data-drive-ready', 'true');
  82 |       await page.getByRole('button', { name: 'Open holographic map' }).click();
  83 |     }
  84 |     expect(errors).toEqual([]);
  85 |   });
  86 | }
  87 | 
```