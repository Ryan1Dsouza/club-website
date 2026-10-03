import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';
import { render } from '../dist/server/entry-server.js';

const data = JSON.parse(await readFile(new URL('../shared/public-data.json', import.meta.url), 'utf8'));

test('Events renders seven photo cards and two portals without loading the ride', () => {
  for (const route of ['/events', '/events/']) {
    const html = render(data, route);
    assert.match(html, /data-event-mode="grid"/);
    assert.equal((html.match(/class="flip-card__photo"/g) ?? []).length, 7);
    assert.equal((html.match(/Ride Immersive Experience/g) ?? []).length, 2);
    assert.match(html, /data-styled/);
    assert.doesNotMatch(html, /class="nx-world|class="ec-scroll/);
  }
});

test('direct production requests serve the Events grid and cannot bypass the portal', async () => {
  const db = openDatabase(':memory:');
  const server = createApp(db, { production: true, limits: false, dist: resolve('dist/client'), render }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    for (const route of ['/events', '/events/', '/events?view=ride']) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /data-event-mode="grid"/);
      assert.match(html, /<title>Events/);
      assert.match(html.split('</head>')[0], /data-styled/);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
  }
});
