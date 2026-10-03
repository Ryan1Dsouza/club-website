import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { createApp } from '../../server/app.mjs';
import { openDatabase } from '../../server/db.mjs';
import { render } from '../../dist/server/entry-server.js';

const directory = 'output/performance-audit-2026-10-03/hardware';
await mkdir(directory, { recursive: true });
const db = openDatabase(':memory:');
const server = createApp(db, { render, production: true, origin: 'https://nucleussjec.in', limits: false }).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium', headless: true, args: ['--enable-gpu', '--use-angle=d3d11'] });
const results = [];

function instrument() {
  const audit = window.__audit = { marks: {}, longTasks: [], shifts: [], lcp: [], renderers: [], resources: [] };
  const record = (type, target) => {
    try { new PerformanceObserver(list => target.push(...list.getEntries().map(entry => ({ start: entry.startTime, duration: entry.duration, value: entry.value, hadRecentInput: entry.hadRecentInput, text: entry.element?.textContent?.slice(0,100) })))).observe({ type, buffered: true }); } catch {}
  };
  record('longtask', audit.longTasks); record('layout-shift', audit.shifts); record('largest-contentful-paint', audit.lcp);
  const mark = () => {
    for (const [selector, attribute, label] of [['.site-shell','data-loading-stage','loader'],['.logo-landing','data-status','logo'],['.logo-landing','data-text-ready','text'],['.people-page','data-tower-status','tower']]) {
      const value = document.querySelector(selector)?.getAttribute(attribute);
      if (value && !(label + ':' + value in audit.marks)) audit.marks[label + ':' + value] = performance.now();
    }
  };
  new MutationObserver(mark).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-loading-stage','data-status','data-text-ready','data-tower-status'] });
  window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
    const renderer = event.detail;
    if (!renderer?.isWebGLRenderer) return;
    const entry = { renderer, count: 0, renderTimes: [], compilations: [], last: {}, disposed: false };
    audit.renderers.push(entry);
    const render = renderer.render.bind(renderer), dispose = renderer.dispose.bind(renderer), compile = renderer.compileAsync.bind(renderer);
    renderer.render = (scene, camera) => {
      const start = performance.now(); const result = render(scene, camera); const duration = performance.now() - start;
      entry.count++; entry.scene = scene;
      entry.last = { ...renderer.info.render, ...renderer.info.memory, width: renderer.domElement.width, height: renderer.domElement.height, pixelRatio: renderer.getPixelRatio(), shadows: renderer.shadowMap.enabled };
      if (audit.sampling) entry.renderTimes.push(duration);
      return result;
    };
    renderer.compileAsync = async (...args) => { const start = performance.now(); try { return await compile(...args); } finally { entry.compilations.push(performance.now() - start); } };
    renderer.dispose = () => { entry.disposed = true; return dispose(); };
  } };
}

async function sample(page, cdp, name, action, duration = 4500) {
  const before = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(item => [item.name,item.value]));
  const sampling = page.evaluate(async duration => {
    const audit = window.__audit, start = performance.now(), counts = audit.renderers.map(item => item.count);
    audit.sampling = true; audit.renderers.forEach(item => { item.renderTimes = []; });
    const intervals = []; let previous;
    await new Promise(resolve => {
      const tick = time => { if (previous !== undefined) intervals.push(time - previous); previous = time; if (performance.now() - start >= duration) resolve(); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    audit.sampling = false;
    const elapsed = performance.now() - start, sorted = intervals.toSorted((a,b) => a-b), pct = (values, quantile) => values[Math.min(values.length - 1, Math.floor(values.length * quantile))] ?? 0;
    return { duration: elapsed, animationFps: intervals.length * 1000 / elapsed, frameP50: pct(sorted,.5), frameP95: pct(sorted,.95), framesOver33ms: intervals.filter(v => v > 33.4).length, totalFrames: intervals.length,
      longTasks: audit.longTasks.filter(item => item.start >= start),
      renderers: audit.renderers.map((entry,index) => { const times=entry.renderTimes.toSorted((a,b)=>a-b); return { renders:entry.count-(counts[index]||0), rendersPerSecond:(entry.count-(counts[index]||0))*1000/elapsed, submissionP95:pct(times,.95), submissionTotal:times.reduce((a,b)=>a+b,0), last:entry.last, disposed:entry.disposed }; }),
      world: { ...document.querySelector('.nx-world')?.dataset }, activeMember: document.querySelector('.people-tower__world')?.dataset.activeMember, activeEvent: document.querySelector('.event-carousel')?.dataset.activeEvent, scrollY };
  }, duration);
  if (action) await action();
  const timing = await sampling;
  const after = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(item => [item.name,item.value]));
  const item = { name, ...timing, taskMs: (after.TaskDuration-before.TaskDuration)*1000, scriptMs: (after.ScriptDuration-before.ScriptDuration)*1000, layoutMs: (after.LayoutDuration-before.LayoutDuration)*1000, styleMs: (after.RecalcStyleDuration-before.RecalcStyleDuration)*1000, heapMB: after.JSHeapUsedSize/1024/1024 };
  console.log(JSON.stringify({name, fps:item.animationFps, p95:item.frameP95, taskMs:item.taskMs, renderers:item.renderers.map(({rendersPerSecond,last})=>({rendersPerSecond,...last})),world:item.world}));
  return item;
}

async function snapshot(page) {
  return page.evaluate(() => {
    const audit=window.__audit;
    return { marks:audit.marks, longTasks:audit.longTasks, lcp:audit.lcp, layoutShift:audit.shifts.filter(x=>!x.hadRecentInput).reduce((s,x)=>s+x.value,0), domNodes:document.querySelectorAll('*').length, overflow:document.documentElement.scrollWidth>innerWidth,
      renderers:audit.renderers.map(entry=>({count:entry.count,compilations:entry.compilations,last:entry.last,disposed:entry.disposed})),
      resources:performance.getEntriesByType('resource').map(x=>({url:new URL(x.name).pathname,type:x.initiatorType,transfer:x.transferSize,encoded:x.encodedBodySize,decoded:x.decodedBodySize,duration:x.duration,start:x.startTime})),
      profiles:document.querySelectorAll('.tower-profile').length, images:[...document.querySelectorAll('.tower-profile__photo')].map(x=>({src:x.getAttribute('src'),loaded:x.complete&&x.naturalWidth>0,width:x.naturalWidth,height:x.naturalHeight})), statuses:{logo:document.querySelector('.logo-landing')?.dataset.status,tower:document.querySelector('.people-page')?.dataset.towerStatus} };
  });
}

try {
  for (const device of ['mobile','desktop']) {
    const mobile=device==='mobile', viewport=mobile?{width:390,height:844}:{width:1440,height:900};
    for (const mode of ['home','people','quick-browse','ride']) {
      const name=`${device}-${mode}`; console.log(`START ${name}`);
      if (process.argv[2] === 'repair' && !mobile && mode !== 'ride') continue;
      if (process.argv[2] && process.argv[2] !== 'repair' && name !== process.argv[2]) continue;
      const context=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
      await context.addInitScript(instrument);
      const page=await context.newPage(), cdp=await context.newCDPSession(page), errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await cdp.send('Performance.enable');
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1});
      try {
        const path=mode==='home'?'/':mode==='people'?'/team':'/events';
        await page.goto(origin+path);
        await page.locator('.site-shell[data-loading-stage="done"]').waitFor({timeout:45000});
        let interactionReady;
        if(mode==='home') await page.locator('.logo-landing[data-text-ready="true"]').waitFor({timeout:45000});
        if(mode==='people') await page.locator('.people-page[data-tower-status="ready"]').waitFor({timeout:45000});
        if(mode==='quick-browse'||mode==='ride') {
          const start=await page.evaluate(()=>performance.now());
          await page.getByRole('button',{name:mode==='ride'?/The Nucleus Ride/:/Quick Browse/}).click();
          await page.locator(mode==='ride'?'.nx-map-button:not([disabled])':'.ec-scroll').waitFor({timeout:45000});
          interactionReady=(await page.evaluate(()=>performance.now()))-start;
        }
        const entry={name,viewport,cpuSlowdown:mobile?4:1,interactionReady,initial:await snapshot(page),samples:[],errors};
        entry.samples.push(await sample(page,cdp,`${name}-idle`));
        await page.screenshot({path:`${directory}/${name}.png`});
        if(mode==='ride') {
          const returnToRide=page.getByRole('button',{name:'Return to ride',exact:true});
          if(await returnToRide.count()) await returnToRide.click();
          await page.locator('.nx-world').focus();
          await page.keyboard.down('w');
          entry.samples.push(await sample(page,cdp,`${name}-driving`));
          await page.keyboard.up('w');
          await page.locator('.nx-event-actions button').first().click();
          entry.samples.push(await sample(page,cdp,`${name}-dialog`,undefined,2500));
        } else {
          const scroll=async()=>{
            if(!mobile) return cdp.send('Input.synthesizeScrollGesture',{x:Math.round(viewport.width*.65),y:Math.round(viewport.height*.72),yDistance:-viewport.height*(mode==='quick-browse'?6:4),speed:viewport.height*1.5,gestureSourceType:'mouse'});
            const point={x:Math.round(viewport.width*.65),y:Math.round(viewport.height*.8)};
            for(let swipe=0;swipe<6;swipe++){
              await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
              for(let step=1;step<=10;step++){
                await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x,y:point.y-step*viewport.height*.055}]});
                await page.waitForTimeout(16);
              }
              await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
              await page.waitForTimeout(150);
            }
          };
          entry.samples.push(await sample(page,cdp,`${name}-scroll`,scroll,5000));
          if(mode==='people') {
            await page.getByLabel('Jump to a member').selectOption('7');
            await page.waitForTimeout(600);
            entry.samples.push(await sample(page,cdp,`${name}-profile`,undefined,2500));
          }
        }
        entry.final=await snapshot(page);
        results.push(entry);
      } catch(error) { results.push({name,error:error.stack,errors,snapshot:await snapshot(page).catch(()=>null)}); console.log(JSON.stringify({name,error:error.message})); }
      finally { await context.close(); }
      await writeFile(`${directory}/runtime${process.argv[2] ? `-${process.argv[2]}` : ''}.json`,JSON.stringify(results,null,2));
    }
  }
  const responses=[];
  for(const path of ['/','/events','/team','/api/site']) {
    const samples=[]; let headers;
    for(let i=0;i<6;i++){const start=performance.now();const response=await fetch(origin+path);await response.arrayBuffer();samples.push(performance.now()-start);headers=Object.fromEntries(response.headers);}
    responses.push({path,samples,headers});
  }
  await writeFile(`${directory}/server-responses.json`,JSON.stringify(responses,null,2));
} finally {
  await browser.close(); await new Promise(resolve=>server.close(resolve)); db.close();
}
