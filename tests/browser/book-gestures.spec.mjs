import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function swipe(page, from, to, onPull) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[from] });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:from.x + (to.x-from.x)*i/12, y:from.y + (to.y-from.y)*i/12 }] });
    await page.waitForTimeout(16);
  }
  await onPull?.();
  await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
  await cdp.detach();
}

for (const viewport of [{width:390,height:844},{width:320,height:568},{width:1440,height:900}]) {
  test(`book images and reversible gestures at ${viewport.width}px`, async ({ browser }, info) => {
    const mobile = viewport.width < 620;
    const context = await browser.newContext({ viewport, isMobile:mobile, hasTouch:mobile });
    const page = await context.newPage(), errors=[];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.route('**/api/site', route => route.fulfill({ json:site }));
      await page.goto('/events');
      await expect(page.locator('[data-loading-screen]')).toHaveCount(0, {timeout:20000});
      await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
      await page.locator('.nx-book-dialog').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
      const book = page.locator('.station-book'), spread = book.locator('.station-book__spread'), surface = book.locator('.station-book__surface');
      await expect(book).toHaveAttribute('data-layout', mobile ? 'report' : 'spread');
      await expect(spread.locator('img')).toHaveCount(1);
      await expect(spread.locator('img')).toHaveCSS('object-fit','contain');
      await spread.locator('img').evaluate(img => img.decode());
      if (mobile) {
        const story = await spread.locator('.station-book__story').boundingBox(), photo = await spread.locator('figure').boundingBox();
        expect(photo.y).toBeGreaterThanOrEqual(story.y + story.height - 1);
        expect(photo.width).toBeGreaterThan(viewport.width - 40);
        expect(photo.height).toBeGreaterThan((await surface.boundingBox()).height * .5);
      }
      await page.screenshot({path:info.outputPath('opening.png')});
      const box = await surface.boundingBox(), x=box.x+box.width*.8;
      if (mobile) {
        await swipe(page,{x,y:box.y+box.height*.88},{x,y:box.y+box.height*.48},async()=>{
          await expect(book).toHaveAttribute('data-book-turning','true');
          const strips=await book.locator('.station-book__strip').evaluateAll(items=>items.map(item=>item.offsetHeight));
          expect(Math.max(...strips)-Math.min(...strips)).toBeLessThanOrEqual(1);
          await page.screenshot({path:info.outputPath('pull-up.png')});
        });
      } else { await page.mouse.move(x,box.y+box.height*.7); await page.mouse.wheel(0,280); }
      await expect(book).toHaveAttribute('data-book-progress','1.000');
      await expect(spread.locator('img')).toHaveCount(mobile?1:2);
      expect(await spread.innerText()).toBe('');
      await page.screenshot({path:info.outputPath('photos.png')});
      if(mobile) await swipe(page,{x,y:box.y+box.height*.25},{x,y:box.y+box.height*.65},async()=>{
        await expect(book).toHaveAttribute('data-book-turning','true');
        await page.screenshot({path:info.outputPath('pull-back.png')});
      });
      else await page.mouse.wheel(0,-280);
      await expect(book).toHaveAttribute('data-book-progress','0.000');
      await expect(spread.locator('.station-book__story')).toBeVisible();
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}
