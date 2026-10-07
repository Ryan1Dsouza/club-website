import { readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { createApp } from '../../server/app.mjs';
import { openDatabase } from '../../server/db.mjs';
import { render } from '../../dist/server/entry-server.js';
const db=openDatabase(':memory:');
const server=createApp(db,{render,production:true,origin:'https://nucleussjec.in'}).listen(0,'127.0.0.1');
await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}`,results={requests:[],latency:[],loginLimit:[]};
try {
  const manifest=JSON.parse(await readFile('dist/client/.vite/manifest.json','utf8'));
  for(const path of ['/','/team','/events','/achievements','/news','/live-news','/admin','/not-a-page','/api/health','/api/site','/api/admin/site','/.env.local','/.git/config','/data/nucleus.sqlite','/'+manifest['index.html'].file]) {
    const r=await fetch(base+path);const body=await r.text();
    results.requests.push({path,status:r.status,bytes:Buffer.byteLength(body),headers:Object.fromEntries([...r.headers].filter(([k])=>/content-security|cache-control|content-encoding|x-frame|x-content|strict-transport|referrer-policy|content-type/.test(k))),ssr:body.includes('id="nucleus-data"')});
  }
  for(const path of ['/api/site','/','/team','/events']) {
    const times=[];
    for(let i=0;i<30;i++) {const start=performance.now();await fetch(base+path).then(r=>r.arrayBuffer());times.push(performance.now()-start);}
    times.sort((a,b)=>a-b);results.latency.push({path,requests:times.length,p50Ms:times[15],p95Ms:times[28],maxMs:times.at(-1)});
  }
  for(let i=0;i<9;i++) results.loginLimit.push((await fetch(base+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://nucleussjec.in'},body:JSON.stringify({email:'nonexistent@example.com',password:'audit-only-wrong-password'})})).status);
  const r=await fetch(base+'/api/applications',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://untrusted.invalid'},body:'{}'});results.crossOriginStatus=r.status;
  await writeFile('output/site-audit-2026-10-07/server-check.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
} finally {await new Promise(r=>server.close(r));db.close();}
