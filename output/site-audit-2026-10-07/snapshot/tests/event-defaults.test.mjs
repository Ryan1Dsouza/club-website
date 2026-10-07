import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { render } from '../dist/server/entry-server.js';
import { createEventStations } from '../src/lib/event-stations.ts';
import { workshops } from './fixtures/workshops.mjs';
const data=JSON.parse(await readFile(new URL('../shared/public-data.json',import.meta.url),'utf8'));
test('a one-event site shows all local workshop chapters',()=>{
  const events=data.events.slice(0,1),stations=createEventStations(events);
  assert.equal(stations.length,workshops.length);assert.equal(stations.filter(s=>s.event===null).length,workshops.length-1);
  const html=render({...data,events},'/events');
  assert.match(html,/data-event-mode="grid"/);
  assert.equal((html.match(/class="event-card"/g) ?? []).length, workshops.length);
});
test('published additions remain visible in the server-rendered event count',()=>{
  const event={...data.events[0],id:'new-photo-event',trackPosition:.72};
  const html=render({...data,events:[...data.events,event]},'/events');
  assert.equal((html.match(/class="event-card"/g) ?? []).length, workshops.length + 1);assert.doesNotMatch(html,/class="nx-joystick"/);
});

test('dashboard edits override legacy workshop text and photos in the rendered public page', () => {
  const event = { ...data.events[0], managed: true, title: 'Updated inauguration', photos: [{ id: 'saved-photo', name: 'Saved photo', url: '/api/event-photos/saved-photo' }] };
  let html = render({ ...data, events: [event] }, '/events');
  assert.match(html, /Open Updated inauguration event book/);
  assert.match(html, /src="\/api\/event-photos\/saved-photo"/);
  html = render({ ...data, events: [{ ...event, photos: [] }] }, '/events');
  assert.doesNotMatch(html, /saved-photo/);
  assert.equal((html.match(/class="event-card__photo"/g) ?? []).length, workshops.length - 1);
});
