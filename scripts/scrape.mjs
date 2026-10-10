import { chromium } from 'playwright';
import fs from 'fs';

async function getQuotes() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  const members = [];
  const cards = await page.$$('.tm-card');
  for (const card of cards) {
    const name = await card.$eval('.tm-name', el => el.textContent.trim());
    await card.click();
    await page.waitForTimeout(500);
    
    const data = await page.evaluate(() => {
      const modal = document.querySelector('dialog') || document.querySelector('[style*="fixed"]');
      if (!modal) return { quote: '', links: [] };
      
      const pElements = Array.from(modal.querySelectorAll('p'));
      // The quote is usually italicized or enclosed in quotes.
      // Let's just find the text that starts with " or “
      let quote = '';
      for (const p of pElements) {
        const text = p.textContent.trim();
        if (text.startsWith('“') || text.startsWith('"') || text.includes('caffeine')) {
          quote = text;
          break;
        }
      }
      
      const aElements = Array.from(modal.querySelectorAll('a'));
      const links = aElements.map(a => a.href);
      return { quote, links };
    });
    
    members.push({ name, ...data });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  
  fs.writeFileSync('tmp/scraped-members.json', JSON.stringify(members, null, 2));
  await browser.close();
}

getQuotes().catch(console.error);
