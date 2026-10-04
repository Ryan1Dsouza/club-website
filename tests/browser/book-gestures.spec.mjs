import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function swipe(page, from, to, onPull) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[from] });
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x:from.x + (to.x-from.x)*i/12, y:from.y + (to.y-from.y)*i/12 }] });
    await page.waitForTimeout(16);
    if (i === (to.y > from.y ? 11 : 6)) await onPull?.();
  }
  await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
  await cdp.detach();
}

for (const viewport of [{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:1440,height:900}]) {
  test(`book images and reversible gestures at ${viewport.width}px`, async ({ browser }, info) => {
    const mobile = viewport.width < 620 || viewport.height < 500;
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
      await expect(book).toHaveAttribute('data-layout', mobile ? 'mobile' : 'spread');
      await expect(spread.locator('img')).toHaveCount(mobile ? 0 : 1);
      if (!mobile) {
        await expect(spread.locator('img')).toHaveCSS('object-fit','contain');
        await spread.locator('img').evaluate(img => img.decode());
      }
      if (mobile) {
        const story = await spread.locator('.station-book__story').boundingBox();
        expect(story.width).toBeGreaterThanOrEqual(viewport.width - 2);
        expect(story.height).toBeGreaterThan((await surface.boundingBox()).height * .95);
      }
      await page.screenshot({path:info.outputPath('opening.png')});
      const box = await surface.boundingBox(), x=box.x+box.width*.8;
      if (mobile) {
        const pull = Math.max(240, box.height * .8) * .45;
        await swipe(page,{x,y:box.y+box.height*.9},{x,y:box.y+box.height*.9-pull},async()=>{
          await expect(book).toHaveAttribute('data-book-turning','true');
          const strips=await book.locator('.station-book__strip').evaluateAll(items=>items.map(item=>item.offsetHeight));
          expect(Math.max(...strips)-Math.min(...strips)).toBeLessThanOrEqual(1);
          await page.screenshot({path:info.outputPath('pull-up.png')});
        });
      } else { await page.mouse.move(x,box.y+box.height*.7); await page.mouse.wheel(0,280); }
      await expect(book).toHaveAttribute('data-book-progress','1.000');
      await expect(spread.locator('img')).toHaveCount(mobile?1:2);
      expect(await spread.innerText()).toBe('');
      if (mobile) {
        await expect(spread.locator('img')).toHaveAttribute('src', /inauguration\/.*1\.avif/);
        await expect(spread.locator('img')).toHaveCSS('object-fit', 'cover');
        const image = await spread.locator('img').boundingBox();
        expect(image.width).toBeGreaterThanOrEqual(viewport.width - 2);
        expect(image.height).toBeGreaterThanOrEqual(box.height - 2);
        expect((await page.locator('.nx-book-dialog').boundingBox()).height).toBe(viewport.height);
      }
      await page.screenshot({path:info.outputPath('photos.png')});
      if (mobile) {
        await page.getByRole('button', { name: 'Show full photograph' }).click();
        await expect(spread.locator('img')).toHaveCSS('object-fit', 'contain');
        await page.getByRole('button', { name: 'Show full photograph' }).click();
      }
      if(mobile) await swipe(page,{x,y:box.y+box.height*.2},{x,y:box.y+box.height*.2+Math.max(240,box.height*.8)*.45},async()=>{
        await expect(book).toHaveAttribute('data-book-turning','true');
        await page.screenshot({path:info.outputPath('pull-back.png')});
      });
      else await page.mouse.wheel(0,-280);
      await expect(book).toHaveAttribute('data-book-progress','0.000');
      await expect(spread.locator('.station-book__story')).toBeVisible();
      if (viewport.width === 390) {
        await page.emulateMedia({reducedMotion:'reduce'});
        const sources = [];
        for (let pageNumber=2;pageNumber<=13;pageNumber++) {
          await page.getByRole('button',{name:'Next book page',exact:true}).click();
          await expect(book).toHaveAttribute('data-book-page',String(pageNumber));
          sources.push(await spread.locator('img').getAttribute('src'));
        }
        expect(new Set(sources).size).toBe(12);
        const lastPhoto=await spread.locator('img').getAttribute('src');
        await page.setViewportSize({width:1440,height:900});
        await expect(book).toHaveAttribute('data-layout','spread');
        await expect(book).toHaveAttribute('data-book-page','7');
        await expect(spread.locator('img')).toHaveAttribute('src',lastPhoto);
        await page.setViewportSize(viewport);
        await expect(book).toHaveAttribute('data-book-page','13');
        await page.getByRole('button',{name:'Close book after last page'}).click();
        await expect(book).toHaveCount(0);
      }
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}
