# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-gestures.spec.mjs >> book images and reversible gestures at 320px
- Location: tests\browser\book-gestures.spec.mjs:18:3

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.nx-book-dialog')
Expected: "none"
Received: "matrix(1, 0, 0, 1, 0, 0)"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" locator('.nx-book-dialog') with timeout 5000ms
  - waiting for locator('.nx-book-dialog')
    - locator resolved to <dialog open="" aria-label="Inauguration" data-lenis-prevent="true" class="nx-dialog nx-book-dialog">…</dialog>
    - unexpected value "matrix(0.97, 0, 0, 0.97, 0, 20)"
    - locator resolved to <dialog open="" aria-label="Inauguration" data-lenis-prevent="true" class="nx-dialog nx-book-dialog">…</dialog>
    - unexpected value "matrix(0.987314, 0, 0, 0.987314, 0, 8.4574)"
    - locator resolved to <dialog open="" aria-label="Inauguration" data-lenis-prevent="true" class="nx-dialog nx-book-dialog">…</dialog>
    - unexpected value "matrix(0.9952, 0, 0, 0.9952, 0, 3.2)"
    - locator resolved to <dialog open="" aria-label="Inauguration" data-lenis-prevent="true" class="nx-dialog nx-book-dialog">…</dialog>
    - unexpected value "matrix(0.999504, 0, 0, 0.999504, 0, 0.330413)"
    9 × locator resolved to <dialog open="" aria-label="Inauguration" data-lenis-prevent="true" class="nx-dialog nx-book-dialog">…</dialog>
      - unexpected value "matrix(1, 0, 0, 1, 0, 0)"

```

```yaml
- dialog "Inauguration":
  - button "Close event"
  - banner: NUCLEUS STATION / 01
  - heading "Inauguration" [level=2]
  - region "Inauguration event book"
  - contentinfo
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { readFile } from 'node:fs/promises';
  3  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  4  | 
  5  | async function swipe(page, from, to, onPull) {
  6  |   const cdp = await page.context().newCDPSession(page);
  7  |   await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[from] });
  8  |   for (let i = 1; i <= 12; i++) {
  9  |     await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:from.x + (to.x-from.x)*i/12, y:from.y + (to.y-from.y)*i/12 }] });
  10 |     await page.waitForTimeout(16);
  11 |   }
  12 |   await onPull?.();
  13 |   await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
  14 |   await cdp.detach();
  15 | }
  16 | 
  17 | for (const viewport of [{width:390,height:844},{width:320,height:568},{width:1440,height:900}]) {
  18 |   test(`book images and reversible gestures at ${viewport.width}px`, async ({ browser }, info) => {
  19 |     const mobile = viewport.width < 620;
  20 |     const context = await browser.newContext({ viewport, isMobile:mobile, hasTouch:mobile });
  21 |     const page = await context.newPage(), errors=[];
  22 |     page.on('pageerror', error => errors.push(error.message));
  23 |     try {
  24 |       await page.route('**/api/site', route => route.fulfill({ json:site }));
  25 |       await page.goto('/events');
  26 |       await expect(page.locator('[data-loading-screen]')).toHaveCount(0, {timeout:20000});
  27 |       await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
> 28 |       await expect(page.locator('.nx-book-dialog')).toHaveCSS('transform','none');
     |                                                     ^ Error: expect(locator).toHaveCSS(expected) failed
  29 |       const book = page.locator('.station-book'), spread = book.locator('.station-book__spread'), surface = book.locator('.station-book__surface');
  30 |       await expect(book).toHaveAttribute('data-layout', mobile ? 'report' : 'spread');
  31 |       await expect(spread.locator('img')).toHaveCount(1);
  32 |       await expect(spread.locator('img')).toHaveCSS('object-fit','contain');
  33 |       await spread.locator('img').evaluate(img => img.decode());
  34 |       if (mobile) {
  35 |         const story = await spread.locator('.station-book__story').boundingBox(), photo = await spread.locator('figure').boundingBox();
  36 |         expect(photo.y).toBeGreaterThanOrEqual(story.y + story.height - 1);
  37 |         expect(photo.width).toBeGreaterThan(viewport.width - 40);
  38 |         expect(photo.height).toBeGreaterThan((await surface.boundingBox()).height * .5);
  39 |       }
  40 |       await page.screenshot({path:info.outputPath('opening.png')});
  41 |       const box = await surface.boundingBox(), x=box.x+box.width*.8;
  42 |       if (mobile) {
  43 |         await swipe(page,{x,y:box.y+box.height*.88},{x,y:box.y+box.height*.48},async()=>{
  44 |           await expect(book).toHaveAttribute('data-book-turning','true');
  45 |           const strips=await book.locator('.station-book__strip').evaluateAll(items=>items.map(item=>item.offsetHeight));
  46 |           expect(Math.max(...strips)-Math.min(...strips)).toBeLessThanOrEqual(1);
  47 |           await page.screenshot({path:info.outputPath('pull-up.png')});
  48 |         });
  49 |       } else { await page.mouse.move(x,box.y+box.height*.7); await page.mouse.wheel(0,280); }
  50 |       await expect(book).toHaveAttribute('data-book-progress','1.000');
  51 |       await expect(spread.locator('img')).toHaveCount(mobile?1:2);
  52 |       expect(await spread.innerText()).toBe('');
  53 |       await page.screenshot({path:info.outputPath('photos.png')});
  54 |       if(mobile) await swipe(page,{x,y:box.y+box.height*.25},{x,y:box.y+box.height*.65},async()=>{
  55 |         await expect(book).toHaveAttribute('data-book-turning','true');
  56 |         await page.screenshot({path:info.outputPath('pull-back.png')});
  57 |       });
  58 |       else await page.mouse.wheel(0,-280);
  59 |       await expect(book).toHaveAttribute('data-book-progress','0.000');
  60 |       await expect(spread.locator('.station-book__story')).toBeVisible();
  61 |       expect(errors).toEqual([]);
  62 |     } finally { await context.close(); }
  63 |   });
  64 | }
  65 | 
```