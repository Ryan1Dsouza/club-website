import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { render } from '../dist/server/entry-server.js';
import { createExperienceStations } from '../src/lib/experience-stations.ts';
const data=JSON.parse(await readFile(new URL('../shared/public-data.json',import.meta.url),'utf8'));
test('a one-event site keeps preview ride stations while advertising only the real event',()=>{
  const events=data.events.slice(0,1),stations=createExperienceStations(events);
  assert.equal(stations.length,7);assert.equal(stations.filter(s=>s.event===null).length,6);
  const html=render({...data,events},'/events');
  assert.match(html,/data-event-mode="choice"/);
  assert.match(html.replace(/<[^>]*>/g,''),/01 event\. Countless connections/);
});
test('published additions remain visible in the server-rendered event count',()=>{
  const event={...data.events[0],id:'new-photo-event',trackPosition:.72};
  const html=render({...data,events:[...data.events,event]},'/events');
  assert.match(html.replace(/<[^>]*>/g,''),/04 events\. Countless connections/);assert.doesNotMatch(html,/class="nx-joystick"/);
});
