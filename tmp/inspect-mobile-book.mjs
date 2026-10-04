import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
page.on('pageerror', error => console.log('pageerror', error.message));
await page.goto(process.argv[2] || 'https://club-website-peach-zeta.vercel.app/events');
await page.locator('[data-loading-screen]').waitFor({state:'detached',timeout:30000});
await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
await page.waitForTimeout(500);
const book=page.locator('.station-book'), box=await page.locator('.station-book__surface').boundingBox();
await page.locator('.station-book__scroller').evaluate(element => {
 window.__bookPointers=[];
 for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture']) element.addEventListener(type,event=>window.__bookPointers.push({type,target:event.target.className,progress:document.querySelector('.station-book').dataset.bookProgress}),true);
 if (location.search.includes('capture')) element.addEventListener('pointerdown', event=>element.setPointerCapture(event.pointerId),true);
});
console.log('initial', await book.evaluate(el=>({data:{...el.dataset}, nodes:el.querySelectorAll('*').length, images:el.querySelectorAll('img').length, height:el.querySelector('.station-book__surface').clientHeight})));
const cdp=await page.context().newCDPSession(page);
async function drag(start,end) {
 const x=box.x+box.width*.8;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:box.y+box.height*start}]});
 const frames=[];
 for(let i=1;i<=12;i++) {
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:box.y+box.height*(start+(end-start)*i/12)}]});
  await page.waitForTimeout(30);
  frames.push(await book.getAttribute('data-book-progress'));
 }
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(1000);
 console.log('drag',start,end,frames,'settled',await book.getAttribute('data-book-progress'));
 console.log('pointers',await page.evaluate(()=>window.__bookPointers.splice(0)));
}
await drag(.88,.48); await drag(.25,.65);
await browser.close();
