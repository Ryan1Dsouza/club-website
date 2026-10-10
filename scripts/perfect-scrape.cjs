const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  const members = [];
  const cards = await page.$$('.tm-card');
  for (const card of cards) {
    const name = await card.$eval('.tm-name', el => el.textContent.trim());
    await card.click();
    await page.waitForTimeout(500); // wait for modal to animate in
    
    const data = await page.evaluate(() => {
      const modal = document.querySelector('.tm-modal-card') || document.querySelector('[class*="modal-card"]');
      if (!modal) {
        // try to find by tagline
        const tagline = document.querySelector('.tm-modal-tagline');
        if (tagline) {
          const links = Array.from(document.querySelectorAll('.tm-modal-socials a')).map(a => a.href);
          return { quote: tagline.textContent.trim(), links };
        }
        return { quote: '', links: [] };
      }
      
      const taglineEl = modal.querySelector('.tm-modal-tagline');
      const quote = taglineEl ? taglineEl.textContent.trim() : '';
      
      const links = Array.from(modal.querySelectorAll('.tm-modal-socials a')).map(a => a.href);
      return { quote, links };
    });
    
    // Clean up quote (remove enclosing quotes if they exist)
    let cleanQuote = data.quote.replace(/^["“”]/, '').replace(/["“”]$/, '').trim();
    
    members.push({ name, quote: cleanQuote, links: data.links });
    
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  
  fs.writeFileSync('tmp/perfect-scraped.json', JSON.stringify(members, null, 2));
  await browser.close();
}

run().catch(console.error);
