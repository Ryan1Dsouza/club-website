import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const root = 'output/book-motion/review';
await mkdir(root, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: {width:390,height:844}, isMobile:true, hasTouch:true });
await page.route('**/api/site', async route => route.fulfill({json:JSON.parse(await readFile('shared/public-data.json','utf8'))}));
await page.goto('http://127.0.0.1:3053/events');
await page.locator('[data-loading-screen]').waitFor({state:'detached'});
await page.getByRole('button',{name:'Open Inauguration event book',exact:true}).click();
await page.waitForTimeout(400);
await page.screenshot({path:`${root}/mobile-contents.png`});
await page.getByRole('button',{name:'Next book page',exact:true}).click();
await page.locator('.station-book[data-book-progress="1.000"]').waitFor();
const cdp=await page.context().newCDPSession(page), frames=[];
await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
cdp.on('Page.screencastFrame',event=>{frames.push(Buffer.from(event.data,'base64'));void cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId});});
await cdp.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:390,maxHeight:844,everyNthFrame:1});
const box=await page.locator('.station-book__surface').boundingBox(),x=box.width*.8;
for(const dir of [1,-1,1]) {
  const from=box.y+box.height*(dir>0?.85:.15);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:from}]});
  for(let i=1;i<=8;i++) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:from-dir*i*box.height*.075}]});
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(650);
}
await cdp.send('Page.stopScreencast');
const width=130,height=282,cols=10;
const thumbnails=await Promise.all(frames.map(async(input,i)=>({input:await sharp(input).resize(width,height).jpeg().toBuffer(),left:i%cols*width,top:Math.floor(i/cols)*height})));
await sharp({create:{width:width*cols,height:Math.ceil(frames.length/cols)*height,channels:3,background:'#fff'}}).composite(thumbnails).png().toFile(`${root}/mobile-turn-frames.png`);
await writeFile(`${root}/frames.json`,JSON.stringify({count:frames.length,order:'Left to right, then top to bottom. Forward, reverse, forward at 6x CPU slowdown.'},null,2));
await page.setViewportSize({width:1440,height:900});
await page.getByRole('button',{name:'Previous book page'}).click();
await page.locator('.station-book[data-book-progress="0.000"]').waitFor();
await page.screenshot({path:`${root}/desktop-book.png`});
console.log('Recorded',frames.length,'composited frames');
await browser.close();
