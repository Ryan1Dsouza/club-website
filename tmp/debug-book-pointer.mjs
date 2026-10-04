import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const site=JSON.parse(await readFile('shared/public-data.json','utf8'));
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage();
await page.route('**/api/site',r=>r.fulfill({json:site}));
await page.goto('http://127.0.0.1:3037/events');
await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
await page.waitForTimeout(500);
await page.evaluate(()=>{
  window.events=[];
  for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture']) document.addEventListener(type,e=>window.events.push({type,id:e.pointerId,target:e.target.className,kind:e.pointerType,y:e.clientY,progress:document.querySelector('.station-book').dataset.bookProgress}),true);
});
const box=await page.locator('.station-book__surface').boundingBox();
console.log('box',box);
for(const reverse of [false,true]){
  const cdp=await context.newCDPSession(page);
  const x=box.x+box.width*.8,start=box.y+box.height*(reverse?.25:.88),distance=box.height*(reverse?.4:-.4);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:start}]});
  for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:start+distance*i/12}]});await page.waitForTimeout(16);}
  await page.waitForTimeout(100);
  console.log('before release',reverse,await page.locator('.station-book').getAttribute('data-book-progress'));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  await page.waitForTimeout(700);
  console.log('after',reverse,await page.locator('.station-book').getAttribute('data-book-progress'),await page.locator('.station-book__surface').boundingBox());
  console.log(await page.evaluate(()=>{const out=window.events;window.events=[];return out;}));
}
await browser.close();
