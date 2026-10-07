import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const site = JSON.parse(await readFile('shared/public-data.json', 'utf8'));
await mkdir('output/jenga-refresh', { recursive: true });
const browser = await chromium.launch();
for (const viewport of [{width:1440,height:1000}, {width:393,height:851}, {width:320,height:568}, {width:844,height:390}]) {
  if (process.argv[2] && viewport.width !== Number(process.argv[2])) continue;
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 900, hasTouch: viewport.width < 900, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', error => console.log('ERROR', error.message));
  await page.route('**/api/site', route => route.fulfill({ json: site }));
  await page.goto('http://127.0.0.1:3051/team');
  await page.locator('.site-shell[data-loading-stage="done"]').waitFor();
  const button = page.getByRole('button', {name: 'Play Interactive Tower'});
  await button.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await button.screenshot({path:`output/jenga-refresh/button-${viewport.width}.png`});
  await button.click();
  await page.locator('.people-page[data-tower-status="ready"]').waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({path:`output/jenga-refresh/tower-${viewport.width}.png`});
  for (const index of viewport.width === 1440 ? [0,1,3] : [1]) {
    await page.getByLabel('Jump to a member').selectOption(String(index));
    await page.waitForFunction(() => document.querySelector('.tower-profile')?.style.opacity === '1');
    await page.locator('.tower-profile__photo:not([data-preview])').waitFor();
    await page.waitForTimeout(350);
    await page.screenshot({path:`output/jenga-refresh/profile-${viewport.width}-${index}.png`});
  }
  console.log(viewport, await page.evaluate(() => ({ scrollY, width: document.documentElement.scrollWidth, height: innerHeight,
    profile: document.querySelector('.tower-profile').getBoundingClientRect().toJSON(), hud: document.querySelector('.people-tower__hud').getBoundingClientRect().toJSON() })));
  await context.close();
}
await browser.close();
