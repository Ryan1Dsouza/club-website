import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { memberProgress, TOWER_INTRO, TOWER_OUTRO } from '../../src/lib/people-tower-motion.ts';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
const duration = TOWER_INTRO + site.team.length + TOWER_OUTRO;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.addInitScript(() => {
    window.__flightScrollY = scrollY;
    window.addEventListener('scroll', () => { window.__flightScrollY = scrollY; }, { passive: true });
  });
});

async function sampleSeek(page, progress) {
  await page.locator('.people-tower').evaluate((element, progress) => {
    const stage = element.querySelector('.people-tower__stage');
    const start = element.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
    const range = element.offsetHeight - stage.offsetHeight;
    const before = Number(element.style.getPropertyValue('--tower-progress'));
    window.scrollTo({ top: start + progress * range, behavior: 'instant' });
    const target = (scrollY - start) / range;
    const frames = [];
    window.__flightSample = { before, target, scrollY, frames };
    function sample() {
      frames.push({
        progress: Number(element.style.getPropertyValue('--tower-progress')),
        profiles: [...element.querySelectorAll('.tower-profile')].map(profile => ({
          index: Number(profile.querySelector('[data-profile-index]').textContent.split('/')[0]) - 1,
          opacity: Number(getComputedStyle(profile).opacity),
          display: getComputedStyle(profile).display,
        })),
      });
      if (frames.length < 10) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }, progress);
  // Native scroll delivery uses the compositor clock. Wait for it to wake the
  // scene before advancing the paused JS clock through the sampled frames.
  await expect.poll(() => page.evaluate(() => window.__flightScrollY === window.__flightSample.scrollY)).toBe(true);
  await page.clock.runFor(160);
  return page.evaluate(() => window.__flightSample);
}

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  test(`extraction never flashes a profile ahead of the scroll at ${viewport.width}px`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await page.goto('/team');
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
    // A fixed 60 Hz clock catches even a single bad frame independently of GPU speed.
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.clock.runFor(200);

    const samples = [];
    for (const index of [0, 1, 7]) {
      samples.push(await sampleSeek(page, (TOWER_INTRO + index + .05) / duration));
      const flight = await sampleSeek(page, (TOWER_INTRO + index + .24) / duration);
      samples.push(flight);
      expect(flight.frames).toHaveLength(10);
      await info.attach(`member-${index}-flight`, { body: JSON.stringify(flight, null, 2), contentType: 'application/json' });
      for (const frame of flight.frames) {
        expect(frame.progress, 'extraction must not jump forward to the open profile').toBeLessThanOrEqual(flight.target + 1e-6);
        expect(frame.profiles.filter(profile => profile.display !== 'none' && profile.opacity > 0), 'the profile stays hidden during extraction').toEqual([]);
      }
      if (index === 0) await page.screenshot({ path: info.outputPath('extraction.png') });
      samples.push(await sampleSeek(page, memberProgress(index, site.team.length)));
      const profile = page.locator('.tower-profile').filter({ has: page.locator('[data-profile-index]', { hasText: `${String(index + 1).padStart(2, '0')} /` }) });
      await expect(profile).toHaveCSS('opacity', '1');
      if (index === 0) await page.screenshot({ path: info.outputPath('profile.png') });
      samples.push(await sampleSeek(page, (TOWER_INTRO + index + .99) / duration));
      samples.push(await sampleSeek(page, memberProgress(index, site.team.length)));
      await expect(profile).toHaveCSS('opacity', '1');
    }
    samples.push(await sampleSeek(page, 0));
    for (const { before, target, frames } of samples) {
      let previous = before;
      for (const frame of frames) {
        expect(frame.progress).toBeGreaterThanOrEqual(Math.min(previous, target) - 1e-6);
        expect(frame.progress).toBeLessThanOrEqual(Math.max(previous, target) + 1e-6);
        previous = frame.progress;
      }
      expect(previous).toBeCloseTo(target, 5);
    }
  });
}
