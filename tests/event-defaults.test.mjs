import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { render } from '../dist/server/entry-server.js';
import { createEventStations } from '../src/lib/event-stations.ts';
const data=JSON.parse(await readFile(new URL('../shared/public-data.json',import.meta.url),'utf8'));
test('a one-event site shows all seven local workshop chapters',()=>{
  const events=data.events.slice(0,1),stations=createEventStations(events);
  assert.equal(stations.length,7);assert.equal(stations.filter(s=>s.event===null).length,6);
  const html=render({...data,events},'/events');
  assert.match(html,/data-event-mode="grid"/);
  assert.match(html.replace(/<[^>]*>/g,''),/07 CHAPTERS/);
});
test('published additions remain visible in the server-rendered event count',()=>{
  const event={...data.events[0],id:'new-photo-event',trackPosition:.72};
  const html=render({...data,events:[...data.events,event]},'/events');
  assert.match(html.replace(/<[^>]*>/g,''),/08 CHAPTERS/);assert.doesNotMatch(html,/class="nx-joystick"/);
});
