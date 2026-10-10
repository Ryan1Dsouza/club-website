import { chromium } from 'playwright';

async function scrape() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  const cards = await page.$$('.tm-card');
  if (cards.length > 0) {
    await cards[0].click();
    await page.waitForTimeout(1000);
    // Print all text in the modal to see what it is
    const text = await page.evaluate(() => document.body.innerText);
    console.log(text.substring(0, 1000));
  }
  
  await browser.close();
}

scrape().catch(console.error);
