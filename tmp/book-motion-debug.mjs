import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const site = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
await mkdir('output/book-motion', { recursive: true });
const browser = await chromium.launch();
for (const mobile of [false, true]) {
  const page = await browser.newPage({ viewport: mobile ? {width:390,height:844} : {width:1440,height:900}, isMobile:mobile, hasTouch:mobile });
  await page.route('**/api/site', route => route.fulfill({json:site}));
  await page.goto('http://127.0.0.1:3053/events');
  await page.locator('[data-loading-screen]').waitFor({state:'detached'});
  await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
  await page.waitForTimeout(500);
  await page.screenshot({path:`output/book-motion/${mobile?'mobile':'desktop'}-before.png`});
  console.log('layout',mobile,await page.locator('.station-book').evaluate(el=>[...el.querySelectorAll('.station-book__scroller,.station-book__surface,.station-book__story,.station-book__copy,.station-book__details')].slice(0,6).map(e=>({class:e.className,h:e.clientHeight,sh:e.scrollHeight,top:e.getBoundingClientRect().top}))));
  const frames = await page.locator('.station-book').evaluate(async el=>{
    const scroller=el.querySelector('.station-book__scroller'), frames=[];
    let input=0, packet=0, sampling=true;
    function sample(t) {if(!sampling)return;frames.push({t,input,packet,p:Number(el.dataset.bookProgress),native:scroller.scrollTop,angle:el.querySelector('.station-book__leaf').style.getPropertyValue('--book-turn'),page:el.dataset.bookPage});requestAnimationFrame(sample);}
    requestAnimationFrame(sample);
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    for (const delta of [180,180,180,180,-80,-80,-80,-80,150,150,150,-150,-150,-150]) {
      input=Math.sign(delta);packet++;
      scroller.dispatchEvent(new WheelEvent('wheel',{deltaY:delta,bubbles:true,cancelable:true}));
      await wait(125);
    }
    input=0;await wait(800);sampling=false;return frames;
  });
  await writeFile(`output/book-motion/${mobile?'mobile':'desktop'}-before.json`,JSON.stringify(frames,null,2));
  console.log('frames',mobile,frames.length,'stalls',frames.filter((f,i)=>i&&f.input&&f.p===frames[i-1].p&&f.p>0).length,'wrongDirection',frames.filter((f,i)=>i&&f.input&&Math.sign(f.p-frames[i-1].p)===-f.input).slice(0,12));
  await page.close();
}
await browser.close();
