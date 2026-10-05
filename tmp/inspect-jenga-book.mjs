import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const site = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
await mkdir('output/people-book-refresh', { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const viewport of [{width:1440,height:1000},{width:393,height:851},{width:320,height:568}]) {
 const context = await browser.newContext({ viewport, isMobile:viewport.width<700, hasTouch:viewport.width<700 });
 const page = await context.newPage();
 page.on('pageerror', e=>console.log('PAGE ERROR',e.message));
 await page.route('**/api/site', route=>route.fulfill({json:site}));
 await page.goto('http://127.0.0.1:3000/team');
 await page.locator('.fan-layout[data-ready=true]').waitFor();
 await page.screenshot({path:`output/people-book-refresh/people-${viewport.width}.png`,fullPage:true});
 const button=page.locator('.people-tower-button');
 await button.scrollIntoViewIfNeeded();
 await button.evaluate(button=>Promise.all(button.getAnimations({subtree:true}).filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished)));
 await page.waitForTimeout(2200);
 await button.screenshot({path:`output/people-book-refresh/jenga-${viewport.width}.png`});
 console.log('People',viewport.width, await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,autoplay:document.querySelector('.fan-carousel').dataset.autoplay})));
 if (viewport.width<700) {
 await page.goto('http://127.0.0.1:3000/events');
 await page.locator('[data-loading-screen]').waitFor({state:'detached',timeout:20000});
 await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
 await page.screenshot({path:`output/people-book-refresh/story-${viewport.width}.png`});
 await page.getByRole('button',{name:'Next book page',exact:true}).click();
 await page.locator('.station-book[data-book-progress="1.000"]').waitFor();
 await page.screenshot({path:`output/people-book-refresh/photo-${viewport.width}.png`});
 }
 await context.close();
}
await browser.close();
