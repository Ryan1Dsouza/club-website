import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { WORKSHOP_STATIONS } from '../src/events/stations.ts';
import { photoNumber, workshopPhotos, bookSpreads } from '../src/events/photo-order.ts';
import { createEventStations } from '../src/lib/event-stations.ts';
import { stationPanAngle, STATION_PAN_SECONDS } from '../src/lib/event-cinematics.ts';

test('numbered workshop files sort by their final number, including parentheses and n8n', () => {
  for (const name of ['photo(1).jpg', 'in1.avif', 'n8n1.avif']) assert.equal(photoNumber(name), 1);
  const files = Object.fromEntries(['n8n10.avif', 'n8n2.avif', 'n8n1.avif'].map(name => [`/workshops/n8n/${name}`, name]));
  assert.deepEqual(workshopPhotos(files, ['n8n']).map(photo => photo.name), ['n8n1.avif', 'n8n2.avif', 'n8n10.avif']);
});

test('every station has its own real photo album, with photo 1 only on the opening spread', async () => {
  const paths = await readdir(new URL('../workshops/', import.meta.url), { recursive: true });
  const files = Object.fromEntries(paths.filter(path => /\.(avif|jpg|png|webp|jpeg)$/i.test(path)).map(path => ['/workshops/' + path.replaceAll('\\', '/'), path]));
  const stations = createEventStations([]);
  assert.deepEqual(stations.map(station => station.workshop), ['inauguration', 'dev', 'khoj', 'linkedin', 'n8n', 'noesis', 'unlocked']);
  assert.deepEqual(WORKSHOP_STATIONS.map(station => workshopPhotos(files, station.folders).length), [12, 2, 4, 1, 4, 7, 6]);
  for (const station of WORKSHOP_STATIONS) {
    const photos = workshopPhotos(files, station.folders), spreads = bookSpreads(photos);
    assert.equal(photoNumber(photos[0].name), 1);
    assert.deepEqual(spreads[0], [null, photos[0]]);
    assert.deepEqual(spreads.slice(1).flat().filter(Boolean), photos.slice(1));
    assert.equal(new Set(spreads.flat().filter(Boolean).map(photo => photo.id)).size, photos.length);
  }
  assert.deepEqual(bookSpreads([]), [[null, null]]);
});

test('the arrival pan turns smoothly right by exactly 90 degrees', () => {
  assert.ok(STATION_PAN_SECONDS <= .4);
  assert.ok(Math.abs(stationPanAngle(.25)) > Math.PI / 8, 'ease-out moves quickly at the start');
  assert.equal(stationPanAngle(0), 0);
  assert.equal(stationPanAngle(1), -Math.PI / 2);
  let previous = 0;
  for (let i = 1; i <= 100; i++) { const angle = stationPanAngle(i / 100); assert.ok(angle < previous); previous = angle; }
  assert.equal(stationPanAngle(2), -Math.PI / 2);
});
