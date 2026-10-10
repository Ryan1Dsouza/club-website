const { chromium } = require('playwright');
const fs = require('fs');

async function getQuotes() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  const quotes = [];
  const cards = await page.$$('.tm-card');
  for (const card of cards) {
    const name = await card.$eval('.tm-name', el => el.textContent.trim());
    await card.click();
    await page.waitForTimeout(400);
    
    // In the modal, we can find the text that starts with '“' or quotes
    const modalText = await page.evaluate(() => {
      const modal = document.querySelector('dialog') || document.querySelector('[style*="fixed"]');
      if (!modal) return '';
      // find paragraphs
      const p = Array.from(modal.querySelectorAll('p'));
      return p.map(el => el.textContent).join(' | ');
    });
    
    quotes.push({ name, text: modalText });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  
  fs.writeFileSync('tmp/scraped-quotes.json', JSON.stringify(quotes, null, 2));
  await browser.close();
}

getQuotes().catch(console.error);
