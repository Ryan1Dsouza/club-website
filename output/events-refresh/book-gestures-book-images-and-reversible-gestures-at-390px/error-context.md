# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-gestures.spec.mjs >> book images and reversible gestures at 390px
- Location: tests\browser\book-gestures.spec.mjs:18:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.station-book')
Expected: "12"
Received: "8"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" locator('.station-book') with timeout 5000ms
  - waiting for locator('.station-book')
    13 × locator resolved to <div data-book-page="8" class="station-book" data-layout="report" data-station-number="01" data-book-turning="true" data-book-closing="false" data-scroll-engine="lenis" data-book-progress="7.060" data-workshop="inauguration">…</div>
       - unexpected value "8"

```

```yaml
- banner: NUCLEUS STATION / 01
- heading "Inauguration" [level=2]
- region "Inauguration event book":
  - figure
- contentinfo:
  - button "Previous book page"
  - status: Page 8 / 12
  - button "Next book page"
  - paragraph
  - button "Back to Events"
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
  11 |     if (i === (to.y > from.y ? 11 : 6)) await onPull?.();
  12 |   }
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
  28 |       await page.locator('.nx-book-dialog').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
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
  61 |       if (viewport.width === 390) {
  62 |         await page.emulateMedia({reducedMotion:'reduce'});
  63 |         for (let pageNumber=2;pageNumber<=12;pageNumber++) {
  64 |           await page.getByRole('button',{name:'Next book page',exact:true}).click();
  65 |           await expect(book).toHaveAttribute('data-book-page',String(pageNumber));
  66 |         }
  67 |         const lastPhoto=await spread.locator('img').getAttribute('src');
  68 |         await page.setViewportSize({width:1440,height:900});
  69 |         await expect(book).toHaveAttribute('data-layout','spread');
  70 |         await expect(book).toHaveAttribute('data-book-page','7');
  71 |         await expect(spread.locator('img')).toHaveAttribute('src',lastPhoto);
  72 |         await page.setViewportSize(viewport);
> 73 |         await expect(book).toHaveAttribute('data-book-page','12');
     |                            ^ Error: expect(locator).toHaveAttribute(expected) failed
  74 |         await page.getByRole('button',{name:'Close book after last page'}).click();
  75 |         await expect(book).toHaveCount(0);
  76 |       }
  77 |       expect(errors).toEqual([]);
  78 |     } finally { await context.close(); }
  79 |   });
  80 | }
  81 | 
```