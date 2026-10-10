import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  const cards = await page.$$('.tm-card');
  if (cards.length > 1) {
    await cards[1].click(); // Dinol
    await page.waitForTimeout(1000);
    const html = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('tmp/modal-debug.html', html);
  }
  await browser.close();
}
run().catch(console.error);
