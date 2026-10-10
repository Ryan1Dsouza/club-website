import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function open(page, path = '/events') {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.route('**/rest/v1/**', route => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith('/team_members') ? site.team.map(member => ({ id: member.id, name: member.name, role: member.role, photo_url: member.image, created_at: member.createdAt ?? '2026-01-01' }))
      : path.endsWith('/site_settings') ? { recruitment_open: true } : [];
    return route.fulfill({ json: data });
  });
  await page.addInitScript(() => {
    window.__audio = { contexts: [], starts: [], buffers: 0, cues: [], errors: [] };
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(options) { super(options); window.__audio.contexts.push({ context: this, options }); }
      createBuffer(...args) { window.__audio.buffers++; return super.createBuffer(...args); }
    };
    for (const Type of [OscillatorNode, AudioBufferSourceNode]) {
      const original = Type.prototype.start;
      Type.prototype.start = function(time = 0, ...args) {
        window.__audio.starts.push({ time, clock: this.context.currentTime, wall: performance.now(), loop: !!this.loop });
        return original.call(this, time, ...args);
      };
    }
    window.addEventListener('error', event => window.__audio.errors.push(event.message));
    window.addEventListener('unhandledrejection', event => window.__audio.errors.push(String(event.reason)));
  });
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 25000 });
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
  await page.evaluate(async () => {
    const { sfx } = await import('/src/lib/sound-effects.ts');
    for (const [name, original] of Object.entries(sfx)) if (typeof original === 'function' && name !== 'dispose') {
      sfx[name] = (...args) => { window.__audio.cues.push({ name, args, wall: performance.now() }); return original(...args); };
    }
  });
}
const cues = page => page.evaluate(() => window.__audio.cues.map(cue => cue.name));
const reset = page => page.evaluate(() => { window.__audio.cues = []; window.__audio.starts = []; });

test('navigation sounds once at pointer/key down, with one prewarmed interactive context', async ({ page }) => {
  await open(page);
  expect(await page.evaluate(() => window.__audio.starts)).toEqual([]);
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  await menu.hover();
  await page.mouse.down();
  await expect.poll(() => cues(page)).toEqual(['toggle']);
  await page.mouse.up();
  expect(await cues(page)).toEqual(['toggle']);
  const latency = await page.evaluate(() => window.__audio.starts[0].time - window.__audio.starts[0].clock);
  expect(latency).toBeLessThan(.015);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Our work', exact: true }).click();
  await expect(page).toHaveURL(/projects/);
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeVisible();
  await reset(page);
  await page.getByRole('button', { name: 'Open menu', exact: true }).focus();
  await page.keyboard.press('Enter');
  expect(await cues(page)).toEqual(['toggle']);
  expect(await page.evaluate(() => window.__audio.contexts.length)).toBe(1);
  expect(await page.evaluate(() => window.__audio.contexts[0].options.latencyHint)).toBe('interactive');
  expect(await page.evaluate(() => window.__audio.buffers)).toBe(1);
  expect(await page.evaluate(() => window.__audio.errors)).toEqual([]);
});

for (const mobile of [false, true]) {
  test.describe(mobile ? 'phone sounds' : 'desktop sounds', () => {
    test.use({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
    test('book gestures, arrows and close follow the actual page; mute persists', async ({ page }, info) => {
      await open(page);
      const card = page.getByRole('button', { name: 'Open Inauguration event book', exact: true });
      if (mobile) await card.tap(); else await card.click();
      await expect(page.locator('.station-book')).toBeVisible();
      expect(await cues(page)).toEqual(['bookOpen']);
      await reset(page);
      const scroller = page.locator('.station-book__scroller');
      if (mobile) {
        const box = await scroller.boundingBox(), cdp = await page.context().newCDPSession(page);
        const x = box.x + box.width * .8, y = box.y + box.height * .8;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * box.height * .04 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        const box = await scroller.boundingBox();
        await page.mouse.move(box.x + box.width * .8, box.y + box.height * .6);
        await page.mouse.wheel(0, 280);
      }
      await expect(page.locator('.station-book')).toHaveAttribute('data-book-progress', '1.000');
      expect(await cues(page)).toEqual(['pageTurn']);
      await reset(page);
      await page.getByRole('button', { name: 'Previous book page' }).click();
      await expect(page.locator('.station-book')).toHaveAttribute('data-book-progress', '0.000');
      expect(await cues(page)).toEqual(['pageTurn']);
      const sound = page.getByRole('dialog').getByRole('button', { name: 'Website sound' });
      await sound.click();
      await expect(sound).toHaveAttribute('aria-pressed', 'false');
      await reset(page);
      await page.getByRole('button', { name: 'Next book page', exact: true }).click();
      await expect(page.locator('.station-book')).toHaveAttribute('data-book-progress', '1.000');
      expect(await page.evaluate(() => window.__audio.starts.length)).toBe(0);
      // Exercise rotation and narrow phones while the photo and mute control are visible.
      for (const viewport of mobile ? [{ width: 320, height: 740 }, { width: 667, height: 375 }, { width: 390, height: 844 }]
        : [{ width: 820, height: 900 }, { width: 2560, height: 1440 }, { width: 1440, height: 900 }]) {
        await page.setViewportSize(viewport);
        await expect.poll(() => page.locator('.station-book__sound').evaluate(element => {
          const sound = element.getBoundingClientRect(), close = element.parentElement.querySelector('.nx-close').getBoundingClientRect();
          const fit = element.parentElement.querySelector('.station-book__fit')?.getBoundingClientRect();
          return sound.right <= close.left && (!fit || fit.right <= sound.left) && sound.width >= 44 && sound.left >= 0 && close.right <= innerWidth;
        })).toBe(true);
      }
      await page.screenshot({ path: info.outputPath('book-sound-control.png') });
      await page.getByRole('button', { name: 'Close event', exact: true }).click();
      await expect(page.locator('.station-book')).toHaveCount(0);
      await expect(card).toBeFocused();
      await expect(page.getByRole('button', { name: 'Website sound' })).toHaveAttribute('aria-pressed', 'false');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 25000 });
      await expect(page.getByRole('button', { name: 'Website sound' })).toHaveAttribute('aria-pressed', 'false');
      expect(await page.evaluate(() => window.__audio.starts.length)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => window.__audio.errors)).toEqual([]);
    });

    test('Jenga scrolling and rebuild use wood cues', async ({ page }) => {
      await open(page, '/team');
      await page.getByRole('button', { name: 'Play Interactive Tower' }).click();
      await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready', { timeout: 30000 });
      await reset(page);
      await page.getByLabel('Jump to a member').selectOption('1');
      await expect.poll(async () => (await cues(page)).includes('woodRemove')).toBe(true);
      await reset(page);
      await page.getByRole('button', { name: 'Rebuild tower', exact: true }).click();
      expect((await cues(page)).filter(cue => cue === 'rebuild')).toHaveLength(1);
      expect((await cues(page)).filter(cue => cue === 'click')).toHaveLength(0);
      expect(await page.evaluate(() => window.__audio.contexts.length)).toBe(1);
      expect(await page.evaluate(() => window.__audio.errors)).toEqual([]);
    });
  });
}

test('ride shares output, tracks boost and braking, and releases its loops on pause and disposal', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  const result = await page.evaluate(async () => {
    const { createRideAudio } = await import('/src/lib/event-audio.ts');
    const { setAudioForeground } = await import('/src/lib/audio-engine.ts');
    const { sfx } = await import('/src/lib/sound-effects.ts');
    const ride = createRideAudio();
    ride.update(.4, true); const slow = ride.gain;
    await new Promise(resolve => setTimeout(resolve, 40));
    ride.update(1.6, true, { boost: true }); const fast = ride.gain;
    ride.update(1.6, true, { boost: true });
    ride.update(.6, true, { braking: true });
    ride.quiet(); const quiet = ride.gain === 0 && !ride.running;
    ride.update(1, true); sfx.muted = true;
    const muted = ride.gain === 0 && !ride.running;
    sfx.muted = false; ride.update(1, true);
    setAudioForeground(false); const hidden = ride.gain === 0 && !ride.running;
    setAudioForeground(true); ride.update(1, true); ride.dispose();
    const disposed = ride.gain === 0 && !ride.running;
    return { slow, fast, quiet, muted, hidden, disposed, cues: window.__audio.cues.map(cue => cue.name), contexts: window.__audio.contexts.length };
  });
  expect(result.fast).toBeGreaterThan(result.slow);
  expect(result).toMatchObject({ quiet: true, muted: true, hidden: true, disposed: true, contexts: 1 });
  expect(result.cues.filter(cue => cue === 'boost')).toHaveLength(1);
  expect(result.cues.filter(cue => cue === 'brake')).toHaveLength(1);
  expect(await page.evaluate(() => window.__audio.errors)).toEqual([]);
});

test('missing Web Audio never breaks navigation or event books', async ({ page }) => {
  await page.addInitScript(() => { window.AudioContext = undefined; window.webkitAudioContext = undefined; });
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/events', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open Inauguration event book', exact: true }).click();
  await expect(page.locator('.station-book')).toBeVisible();
  await page.getByRole('button', { name: 'Next book page', exact: true }).click();
  await expect(page.locator('.station-book')).toHaveAttribute('data-book-progress', '1.000');
  expect(errors).toEqual([]);
});

test('every synthesized effect renders audible finite samples, with headroom and a silent tail', async ({ page }) => {
  await open(page);
  const measurements = await page.evaluate(async () => {
    const engine = await import('/src/lib/audio-engine.ts');
    const { playSound } = await import('/src/lib/sound-effects.ts');
    const results = [];
    for (const cue of ['click', 'toggle', 'swoosh', 'pageTurn', 'cardFan', 'bookOpen', 'bookClose', 'woodPlace', 'woodRemove', 'woodGrab', 'woodThrow', 'woodImpact', 'rebuild', 'boost', 'brake', 'arrival', 'depart', 'success', 'error']) {
      engine.disposeAudio();
      const offline = new OfflineAudioContext(1, 48000, 48000);
      // Route the production synthesis into offline audio, without changing the DSP.
      Object.defineProperty(offline, 'state', { get: () => 'running' });
      offline.close = () => Promise.resolve();
      window.AudioContext = class { constructor() { return offline; } };
      await engine.unlockAudio();
      playSound(cue);
      const data = (await offline.startRendering()).getChannelData(0);
      let peak = 0, energy = 0, tail = 0;
      for (let i = 0; i < data.length; i++) {
        peak = Math.max(peak, Math.abs(data[i])); energy += data[i] * data[i];
        if (i > 30000) tail = Math.max(tail, Math.abs(data[i]));
      }
      results.push({ cue, peak, energy, tail, finite: data.every(Number.isFinite) });
    }
    return results;
  });
  for (const effect of measurements) {
    expect(effect.finite, effect.cue).toBe(true);
    expect(effect.peak, effect.cue).toBeGreaterThan(.005);
    expect(effect.peak, effect.cue).toBeLessThan(.85);
    expect(effect.energy, effect.cue).toBeGreaterThan(.01);
    expect(effect.tail, effect.cue).toBeLessThan(.00001);
  }
});

test('a delayed unlock drops stale sounds and a later touch gesture can retry resume', async ({ page }) => {
  await open(page);
  const result = await page.evaluate(async () => {
    const engine = await import('/src/lib/audio-engine.ts');
    const { sfx } = await import('/src/lib/sound-effects.ts');
    const graph = engine.prepareAudio();
    await graph.context.suspend();
    const original = graph.context.resume.bind(graph.context);
    const pending = [];
    let attempts = 0;
    graph.context.resume = () => { attempts++; return new Promise(resolve => pending.push(resolve)); };
    void engine.unlockAudio(); sfx.click();
    await new Promise(resolve => setTimeout(resolve, 150));
    void engine.unlockAudio();
    await original(); pending.forEach(resolve => resolve());
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    const staleStarts = window.__audio.starts.length;
    sfx.swoosh();
    return { attempts, staleStarts, freshStarts: window.__audio.starts.length };
  });
  expect(result.attempts).toBe(2);
  expect(result.staleStarts).toBe(0);
  expect(result.freshStarts).toBeGreaterThan(0);
});
