import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createApp } from './snapshot/server/app.mjs';
import { openDatabase } from './snapshot/server/db.mjs';
import { render } from './snapshot/dist/server/entry-server.js';
import lighthouse from 'lighthouse';

const out = 'C:/Users/ryan1/OneDrive/Documents/club-website/output/site-audit-2026-10-07/final';
await mkdir(out, { recursive: true });
const seed = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
const db = openDatabase(':memory:');
const server = createApp(db, { render, production: true, origin: 'https://nucleussjec.in', limits: true }).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const mode = process.argv[2] || 'layout';
const browser = await chromium.launch({ headless: true, ...(['interactions','lighthouse','hardware-performance','checks','regressions'].includes(mode)?{channel:'chromium'}:{}), args: mode === 'lighthouse' ? ['--remote-debugging-port=9237'] : [] });
const devices = [
  { name: 'phone-small', width: 320, height: 568, touch: true },
  { name: 'phone', width: 390, height: 844, touch: true },
  { name: 'phone-landscape', width: 844, height: 390, touch: true },
  { name: 'tablet', width: 768, height: 1024, touch: true },
  { name: 'desktop', width: 1440, height: 900, touch: false },
  { name: 'wide', width: 1920, height: 1080, touch: false },
];
const paths = ['/', '/about', '/events', '/projects', '/team', '/achievements', '/news', '/recruitment'];
const summary = [];
try { const browserCdp=await browser.newBrowserCDPSession(); const system=await browserCdp.send('SystemInfo.getInfo'); await writeFile(`${out}/${mode}-browser-system.json`,JSON.stringify(system,null,2)); } catch {}
const save = async () => writeFile(`${out}/${mode}.json`, JSON.stringify(summary, null, 2));
async function makePage(device, mock = true) {
  const context = await browser.newContext({ viewport: { width: device.width, height: device.height }, isMobile: device.touch, hasTouch: device.touch, deviceScaleFactor: device.touch ? 2 : 1 });
  if (mock) await context.route(/https:\/\/[^/]+\.supabase\.(co|in)\//, route => {
    const url = new URL(route.request().url());
    let json = [];
    if (url.pathname.includes('team_members')) json = seed.team.map((p, i) => ({ id: p.id, name: p.name, role: p.role, photo_url: p.image ? origin + p.image : null, created_at: `2026-01-${String(i % 28 + 1).padStart(2, '0')}T00:00:00Z` }));
    if (url.pathname.includes('live_news')) json = [{ id: 'audit-news', title: 'Nucleus workshop update', description: 'A local audit fixture for checking the news card and poster layout.', image_url: origin + '/nucleus-logo.webp', date: '2026-10-07', created_at: '2026-10-07T00:00:00Z' }];
    return route.fulfill({ json });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.addInitScript(() => {
    window.__audit = { longTasks: [], lcp: 0, cls: 0, resources: [] };
    new PerformanceObserver(list => list.getEntries().forEach(e => window.__audit.longTasks.push({ start: e.startTime, duration: e.duration }))).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(list => list.getEntries().forEach(e => window.__audit.lcp = e.startTime)).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.__audit.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
      const renderer = event.detail;
      if (renderer?.isWebGLRenderer) {
        const original = renderer.render.bind(renderer);
        renderer.render = (scene, camera) => { window.__view = { renderer, scene, camera }; return original(scene, camera); };
      }
    } };
  });
  return { page, context };
}
async function ready(page, path) {
  const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
  await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
  return response;
}
async function frames(page, action = 'scroll') {
  return page.evaluate(async action => {
    const intervals = [], start = performance.now(); let previous = start;
    const longStart = window.__audit.longTasks.length;
    await new Promise(resolve => {
      function sample(now) {
        intervals.push(now - previous); previous = now;
        const elapsed = now - start;
        if (action === 'scroll') window.scrollTo(0, Math.max(0, document.documentElement.scrollHeight - innerHeight) * (.5 - .5 * Math.cos(elapsed / 4000 * Math.PI * 2)));
        if (elapsed < 4000) requestAnimationFrame(sample); else resolve();
      }
      requestAnimationFrame(sample);
    });
    intervals.shift(); intervals.sort((a,b) => a-b);
    const renderer = window.__view?.renderer;
    return { frames: intervals.length, p50Ms: intervals[Math.floor(intervals.length * .5)], p95Ms: intervals[Math.floor(intervals.length * .95)], maxMs: intervals.at(-1), over33Percent: intervals.filter(x => x > 33.5).length / intervals.length * 100, longTasks: window.__audit.longTasks.slice(longStart), ...(renderer ? { renderCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixels: renderer.domElement.width * renderer.domElement.height, pixelRatio: renderer.getPixelRatio(), geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures } : {}) };
  }, action);
}
try {
  if (mode === 'layout') {
    for (const device of devices) for (const path of paths) {
      const { page, context } = await makePage(device);
      const errors = [], failed = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) failed.push({ path: new URL(r.url()).pathname, status: r.status() }); });
      const item = { device: device.name, path, errors, failed };
      try {
        const response = await ready(page, path);
        item.status = response.status();
        item.readyMs = await page.evaluate(() => performance.now());
        await page.waitForTimeout(500);
        item.initial = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, height: document.documentElement.scrollHeight, cls: window.__audit.cls, lcp: window.__audit.lcp, jsBytes: performance.getEntriesByType('resource').filter(e => e.initiatorType === 'script' || /\.js($|\?)/.test(e.name)).reduce((sum,e) => sum + e.decodedBodySize, 0), transferBytes: performance.getEntriesByType('resource').reduce((sum,e) => sum + e.transferSize,0) }));
        const name = `${device.name}-${path.slice(1) || 'home'}`;
        await page.screenshot({ path: `${out}/${name}.png` });
        const overflow = [];
        for (const fraction of [.25, .5, .75, 1]) {
          await page.evaluate(f => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * f, behavior: 'instant' }), fraction);
          await page.waitForTimeout(100);
          overflow.push(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
        }
        item.maxHorizontalOverflow = Math.max(item.initial.scrollWidth - item.initial.viewport, ...overflow);
        item.brokenImages = await page.locator('img').evaluateAll(imgs => imgs.filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => ({ src: i.currentSrc.replace(location.origin, ''), alt: i.alt })));
        if (['phone', 'desktop'].includes(device.name)) {
          await page.evaluate(() => scrollTo(0,0));
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
          item.accessibility = axe.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map(n => n.target).slice(0,12) }));
        }
      } catch(e) { item.failure = e.message; }
      summary.push(item); await save(); console.log(JSON.stringify(item));
      await context.close();
    }
  }
  if (mode === 'performance' || mode === 'hardware-performance') {
    for (const device of devices.filter(d => d.name !== 'phone-small')) {
      const { page, context } = await makePage(device);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: device.touch ? 4 : 1 });
      for (const target of (mode==='hardware-performance'?['home','domains','events','ride']:['home','domains','events','book','ride','team','tower','projects'])) {
        const item = { device: device.name, target, cpuSlowdown: device.touch ? 4 : 1 };
        try {
          const path = target === 'home' || target === 'domains' ? '/' : ['team','tower'].includes(target) ? '/team' : ['events','book','ride'].includes(target) ? '/events' : '/projects';
          await ready(page, path);
          await page.waitForTimeout(1000);
          if (target === 'home') {
            await page.locator('.logo-landing[data-text-ready="true"]').waitFor({timeout:45000});
            item.heroTextReadyMs = await page.evaluate(()=>performance.now());
          }
          if (target === 'tower') {
            const started = Date.now();
            await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
            await page.locator('.people-page[data-tower-status="ready"]').waitFor({ timeout: 45000 });
            item.sceneReadyMs = Date.now() - started;
          }
          if (target === 'book') await page.locator('.events-grid__item button').first().click();
          if (target === 'ride') {
            const started = Date.now();
            await page.getByRole('button',{name:'The Nucleus Ride',exact:true}).first().click();
            await page.getByRole('button',{name:"Yes, Let's Go"}).click();
            await page.waitForFunction(()=>document.querySelector('.nx-map-button')?.disabled===false, {timeout:45000});
            await page.locator('.events-flight').waitFor({state:'detached',timeout:45000});
            const back = page.getByRole('button',{name:'Return to ride',exact:true});
            if(await back.count()) await back.click();
            await page.locator('.nx-world').focus();
            await page.keyboard.down('w');
            item.sceneReadyMs = Date.now() - started;
          }
          await cdp.send('Performance.enable');
          const before=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
          item.sample = await frames(page, ['home','book','ride'].includes(target) ? 'idle' : 'scroll');
          const after=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
          item.cpu={taskMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000,layoutMs:(after.LayoutDuration-before.LayoutDuration)*1000,layouts:after.LayoutCount-before.LayoutCount,heapMB:after.JSHeapUsedSize/1048576};
          if(mode==='hardware-performance' && target==='events') {
            await page.evaluate(()=>{const style=document.querySelector('.events-page').style;const old=style.setProperty.bind(style);style.setProperty=(name,...args)=>{if(name!=='--rail-progress')old(name,...args);};});
            item.fixedTrains=await frames(page,'scroll');
          }
          if (target === 'ride') await page.keyboard.up('w');
          if (target === 'book') {
            const pending = frames(page, 'idle');
            for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 380); await page.waitForTimeout(350); }
            item.turning = await pending;
          }
          item.metrics = await page.evaluate(() => ({ lcp: window.__audit.lcp, cls: window.__audit.cls, maxLongTask: Math.max(0, ...window.__audit.longTasks.map(x => x.duration)), initialLongTaskCount: window.__audit.longTasks.length }));
        } catch(e) { item.failure = e.message; }
        summary.push(item); await save(); console.log(JSON.stringify(item));
      }
      await context.close();
    }
  }
  if (mode === 'lighthouse') {
    for (const device of ['mobile','desktop']) for (const path of ['/','/team','/events','/projects','/achievements','/news','/recruitment','/about']) {
      const name = `${device}-${path.slice(1) || 'home'}`; if(process.argv[3] && process.argv[3] !== name) continue;
      const options = { port: 9237, output: ['html','json'], logLevel: 'error', onlyCategories: ['performance','accessibility','best-practices','seo'] };
      if (device === 'desktop') Object.assign(options, { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } });
      try {
        const result = await lighthouse(origin + path, options);
        await writeFile(`${out}/lighthouse-${name}.html`, result.report[0]);
        await writeFile(`${out}/lighthouse-${name}.json`, result.report[1]);
        const { categories, audits } = result.lhr;
        const item = { name, scores: Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,v.score === null ? null : Math.round(v.score*100)])), metrics: Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(k=>[k,{value:audits[k].numericValue,display:audits[k].displayValue}])), issues:Object.values(audits).filter(a=>a.score !== null && a.score < 1 && !['notApplicable','informative','manual'].includes(a.scoreDisplayMode)).map(a=>({id:a.id,title:a.title,value:a.displayValue})) };
        summary.push(item); await save(); console.log(JSON.stringify(item));
      } catch(e) { summary.push({name,error:e.message}); await save(); }
    }
  }
  if (mode === 'bottlenecks') {
    for (const device of devices.filter(d=>['phone','phone-landscape','tablet','desktop'].includes(d.name))) {
      const {page,context}=await makePage(device);
      const cdp=await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:device.touch?4:1});
      await cdp.send('Performance.enable');
      for(const variant of ['original','no-portal-glow','fixed-trains','no-photo-filter']) {
        await ready(page,'/events');
        await page.waitForTimeout(1000);
        if(variant==='no-portal-glow') await page.addStyleTag({content:'.events-portal,.events-portal .railway-track__rails,.events-portal .railway-track__cart{filter:none!important}'});
        if(variant==='no-photo-filter') await page.addStyleTag({content:'.event-card__photo{filter:none!important}'});
        if(variant==='fixed-trains') await page.evaluate(()=>{const style=document.querySelector('.events-page').style;const old=style.setProperty.bind(style);style.setProperty=(name,...args)=>{if(name!=='--rail-progress')old(name,...args);};});
        const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
        const before=await metrics();
        const sample=await frames(page,'scroll');
        const after=await metrics();
        const item={device:device.name,variant,sample,cpu:{taskMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000,styleMs:(after.RecalcStyleDuration-before.RecalcStyleDuration)*1000,styleRecalculations:after.RecalcStyleCount-before.RecalcStyleCount,layoutMs:(after.LayoutDuration-before.LayoutDuration)*1000}};
        summary.push(item);await save();console.log(JSON.stringify(item));
      }
      await context.close();
    }
  }
  if (mode === 'interactions') {
    for (const device of devices.filter(d=>d.name!=='wide')) {
      const {page,context}=await makePage(device);
      const cdp=await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:device.touch?4:1});
      const item={device:device.name,errors:[]};
      page.on('pageerror',e=>item.errors.push(e.message));
      try {
        await ready(page,'/events');
        await page.getByRole('button',{name:'Open menu',exact:true}).click();
        item.menuLinks=await page.locator('a').evaluateAll(a=>a.filter(x=>getComputedStyle(x).visibility!=='hidden' && x.getBoundingClientRect().width && x.textContent.trim()).filter(x=>!x.closest('[aria-hidden=true]')).map(x=>{const r=x.getBoundingClientRect();return {text:x.textContent.trim().slice(0,50),left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
        await page.screenshot({path:`${out}/${device.name}-menu.png`});
        await page.keyboard.press('Escape');
        await page.locator('.events-grid__item button').first().click();
        await page.locator('.station-book').waitFor();
        item.book=await page.locator('.nx-book-dialog').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,height:e.clientHeight,layout:e.querySelector('.station-book').dataset.layout}));
        const pending=frames(page,'idle');
        await page.getByRole('button',{name:'Next book page',exact:true}).click();
        item.bookTurn=await pending;
        item.bookPage=await page.locator('.station-book').getAttribute('data-book-page');
        await page.screenshot({path:`${out}/${device.name}-book.png`});
        await page.getByRole('button',{name:'Close event',exact:true}).click();
        item.bookClosed=await page.locator('.station-book').count()===0;
        await ready(page,'/projects');
        await page.locator('.laundroid-card__open').click();
        await page.getByRole('dialog').waitFor();
        item.project=await page.getByRole('dialog').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));
        await page.screenshot({path:`${out}/${device.name}-project-details.png`});
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({state:'detached'});
        await ready(page,'/team');
        await page.locator('.people-card button').first().click();
        await page.locator('.team-profile[open]').waitFor();
        item.profile=await page.locator('.team-profile').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,emptyLinks:e.querySelectorAll('a[href="#"]').length}));
        await page.screenshot({path:`${out}/${device.name}-profile.png`});
        await page.keyboard.press('Escape');
        await page.locator('.team-profile').waitFor({state:'detached'});
        await page.getByRole('button',{name:'Play Interactive Tower'}).click();
        await page.locator('.people-page[data-tower-status="ready"]').waitFor({timeout:45000});
        const before=await page.locator('.people-tower').evaluate(e=>Number(e.style.getPropertyValue('--tower-progress')));
        const activeFrames=frames(page,'idle');
        if(device.touch) {
          for(let n=0;n<3;n++) {
            const x=device.width*.78,y=device.height*.65;
            await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
            for(let i=1;i<=10;i++) { await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*device.height*.035}]}); await page.waitForTimeout(30); }
            await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
            await page.waitForTimeout(100);
          }
        } else {
          await page.mouse.move(device.width*.7,device.height*.5);
          for(let i=0;i<10;i++) {await page.mouse.wheel(0,200);await page.waitForTimeout(120);}
        }
        item.towerActive=await activeFrames;
        item.towerProgress={before,after:await page.locator('.people-tower').evaluate(e=>Number(e.style.getPropertyValue('--tower-progress'))),documentScroll:await page.evaluate(()=>scrollY)};
        await page.getByLabel('Jump to a member').selectOption('1');
        await page.waitForTimeout(400);
        await page.screenshot({path:`${out}/${device.name}-tower.png`});
        item.towerPicker=await page.getByLabel('Jump to a member').inputValue();
        await page.getByRole('button',{name:'Rebuild tower'}).click();
        await page.waitForTimeout(1000);
        await page.getByRole('button',{name:'Drag & throw'}).click();
        const point=await page.evaluate(()=>{const {renderer,scene,camera}=window.__view;const blocks=scene.children.find(o=>o.isInstancedMesh&&o.castShadow);const matrix=blocks.matrix.clone();blocks.getMatrixAt(Math.min(12,blocks.count-1),matrix);const p=camera.position.clone().set(0,0,.501).applyMatrix4(matrix).project(camera),r=renderer.domElement.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};});
        const physics=frames(page,'idle');
        await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(Math.min(device.width-20,point.x+130),Math.max(80,point.y-80),{steps:15});await page.mouse.up();
        item.towerThrow=await physics;
        await page.getByRole('button',{name:'Back to the team',exact:true}).click();
        item.cleanedUp=await page.evaluate(()=>({canvas:document.querySelectorAll('.people-tower canvas').length,locked:document.documentElement.classList.contains('people-tower-open'),geometries:window.__view.renderer.info.memory.geometries,textures:window.__view.renderer.info.memory.textures}));
      }catch(e){item.failure=e.message;}
      summary.push(item);await save();console.log(JSON.stringify(item));await context.close();
    }
    const {page,context}=await makePage(devices[1]);
    await page.emulateMedia({reducedMotion:'reduce'});await ready(page,'/');
    summary.push({test:'reduced-motion-home',readyMs:await page.evaluate(()=>performance.now()),canvas:await page.locator('.logo-landing canvas').count(),textReady:await page.locator('.logo-landing').getAttribute('data-text-ready')});
    await context.close();await save();
  }
  if(mode==='checks') {
    {
      const {page,context}=await makePage(devices[1]);
      await page.route('**/rest/v1/team_members**',r=>r.fulfill({status:503,json:{message:'Audit simulated upstream failure'}}));
      await ready(page,'/team');await page.waitForTimeout(300);
      summary.push({test:'team-api-error',initialSeedMembers:seed.team.length,remainingCards:await page.locator('.people-card').count(),visibleAlerts:await page.getByRole('alert').count()});
      await context.close();await save();
    }
    {
      const {page,context}=await makePage(devices[1]);
      const example={id:'audit-supabase-event',title:'Audit Supabase Event',description:'A local published fixture to verify the latest public event integration.',starts_at:'2026-10-01T10:00:00Z',ends_at:'2026-10-01T11:00:00Z',location:'Audit lab',category:'Workshop',published:true,event_photos:[]};
      await page.route('**/rest/v1/events**',r=>r.fulfill({json:[example]}));
      await ready(page,'/events');
      summary.push({test:'supabase-event-integration',rendered:await page.getByRole('button',{name:'Open Audit Supabase Event event book'}).count()===1});
      await context.close();await save();
    }
    {
      const {page,context}=await makePage(devices[1]);const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.emulateMedia({reducedMotion:'reduce'});
      let failure;try{await ready(page,'/');}catch(e){failure=e.message;}
      summary.push({test:'reduced-motion-home',failure,errors,state:await page.evaluate(()=>({stage:document.querySelector('.site-shell')?.dataset.loadingStage,loader:!!document.querySelector('.nucleus-loader'),bodyText:document.body.innerText.slice(0,300),textReady:document.querySelector('.logo-landing')?.dataset.textReady,canvas:document.querySelectorAll('.logo-landing canvas').length}))});
      await page.screenshot({path:`${out}/reduced-motion-home.png`});await context.close();await save();
    }
    for(const device of devices) {
      const {page,context}=await makePage(device);await ready(page,'/events');
      await page.getByRole('button',{name:'Open menu',exact:true}).click();
      await page.waitForFunction(()=>Array.from(document.querySelectorAll('.morph-nav__links li')).every(e=>getComputedStyle(e).transform==='none'||getComputedStyle(e).transform==='matrix(1, 0, 0, 1, 0, 0)'));
      await page.waitForTimeout(300);
      const links=await page.locator('.morph-nav__link').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{text:e.getAttribute('aria-label'),left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
      await page.screenshot({path:`${out}/${device.name}-menu-settled.png`});
      await page.getByRole('link',{name:'Our work',exact:true}).click();
      await page.waitForURL('**/projects');await page.locator('.laundroid-card').waitFor();
      summary.push({test:'menu-and-navigation',device:device.name,links,maxOverflow:Math.max(0,...links.map(x=>x.right-device.width)),navigated:page.url().endsWith('/projects')});
      await context.close();await save();
    }
    {
      const {page,context}=await makePage(devices[1]);
      await page.route('**/*.js',r=>r.abort('failed'));
      await page.goto(origin+'/team');await page.waitForTimeout(2500);
      summary.push({test:'failed-entry-script',serverContent:await page.locator('.people-card').count(),loaderVisible:await page.locator('.nucleus-loader').isVisible(),centerBlockedByLoader:await page.evaluate(()=>!!document.elementFromPoint(innerWidth/2,innerHeight/2)?.closest('.nucleus-loader'))});
      await page.screenshot({path:`${out}/failed-entry-script.png`});await context.close();await save();
    }
    {
      const {page,context}=await makePage(devices[1]);
      await page.route('**/api/site',()=>{});await ready(page,'/team');
      summary.push({test:'stalled-api',readyMs:await page.evaluate(()=>performance.now()),cards:await page.locator('.people-card').count()});await context.close();await save();
    }
    {
      const settings=JSON.parse(db.prepare('select body from settings').get().body);settings.recruitmentOpen=true;settings.recruitmentDeadline='';
      db.prepare('update settings set body=?').run(JSON.stringify(settings));
      const {page,context}=await makePage(devices[1]);await ready(page,'/recruitment');
      // HTTP-only local harness models the production HTTPS Origin expected by the server.
      await page.route('**/api/applications',r=>r.continue({headers:{...r.request().headers(),origin:'https://nucleussjec.in'}}));
      await page.getByLabel('Your name',{exact:true}).fill('Audit Student');
      await page.getByLabel('Email address',{exact:true}).fill('audit-student@example.com');
      await page.getByLabel('Year of study').selectOption('2');await page.getByLabel('Your domain').selectOption('web');
      await page.getByLabel('What would you like to learn or build?').fill('I want to build accessible websites with the student community. This is an isolated local audit fixture.');
      await page.getByRole('checkbox').check();
      await page.getByRole('button',{name:'Send application'}).click();
      await page.getByRole('heading',{name:'Application received.'}).waitFor();
      summary.push({test:'recruitment-submit',success:true,persisted:db.prepare('select count(*) as n from applications').get().n});
      await page.screenshot({path:`${out}/recruitment-success.png`});await context.close();await save();
    }
  }
  if(mode==='regressions') {
    {
      const {page,context}=await makePage(devices[1]);
      await page.route('**/rest/v1/team_members**',r=>r.fulfill({status:403,json:{code:'42501',message:'Audit simulated permission failure'}}));
      await ready(page,'/team');await page.waitForTimeout(1000);
      summary.push({test:'team-api-error',status:403,initialSeedMembers:seed.team.length,remainingCards:await page.locator('.people-card').count(),visibleAlerts:await page.getByRole('alert').count()});
      await context.close();await save();
    }
    {
      const settings=JSON.parse(db.prepare('select body from settings').get().body);settings.recruitmentOpen=true;settings.recruitmentDeadline='';
      db.prepare('update settings set body=?').run(JSON.stringify(settings));
      const {page,context}=await makePage(devices[1]);
      const responses=[];page.on('response',async r=>{if(r.url().includes('/api/'))responses.push({path:new URL(r.url()).pathname,status:r.status()});});
      await ready(page,'/recruitment');
      await page.route('**/api/applications',async route=>{
        const response=await fetch(route.request().url(),{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://nucleussjec.in'},body:route.request().postData()});
        const body=await response.text();responses.push({path:'proxy-result',status:response.status,body});await route.fulfill({status:response.status,contentType:'application/json',body});
      });
      await page.getByLabel('Your name',{exact:true}).fill('Audit Student');
      await page.getByLabel('Email address',{exact:true}).fill('audit-student@example.com');
      await page.getByLabel('Year of study').selectOption('2');await page.getByLabel('Your domain').selectOption('web');
      await page.getByLabel('What would you like to learn or build?').fill('I want to build accessible websites with the student community. This is an isolated local audit fixture.');
      await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Send application'}).click();
      let failure;try{await page.getByRole('heading',{name:'Application received.'}).waitFor({timeout:8000});}catch(e){failure=e.message;}
      summary.push({test:'recruitment-submit',success:!failure,failure,responses,persisted:db.prepare('select count(*) as n from applications').get().n,alerts:await page.getByRole('alert').allTextContents(),invalid:await page.locator(':invalid').evaluateAll(es=>es.map(e=>({name:e.name,message:e.validationMessage}))) });
      await page.screenshot({path:`${out}/recruitment-success.png`});await context.close();await save();
    }
  }
} finally { await browser.close(); await new Promise(r=>server.close(r)); db.close(); }
