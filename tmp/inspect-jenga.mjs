import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/team', { waitUntil: 'networkidle' });
  
  // wait for jenga animation to be ready
  await page.waitForTimeout(1000);
  
  // scroll to the button to make sure we can click it
  await page.evaluate(() => window.scrollBy(0, 10000));
  await page.waitForTimeout(1000);
  
  await page.click('.people-tower-button');
  console.log("Clicked tower play button");
  
  // Wait for loading
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tmp/screenshot_start.png' });
  
  // scroll down fully to remove all blocks
  await page.evaluate(() => window.scrollBy(0, 50000));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tmp/screenshot_end.png' });
  
  // scroll up a bit (reverse scroll)
  await page.evaluate(() => window.scrollBy(0, -100)); // Just 1 tick up
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tmp/screenshot_reverse_1.png' });

  await page.evaluate(() => window.scrollBy(0, -100)); // Another tick up
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tmp/screenshot_reverse_2.png' });

  await page.evaluate(() => window.scrollBy(0, -100)); // Another tick up
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tmp/screenshot_reverse_3.png' });
  
  await browser.close();
})();
