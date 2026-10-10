import { chromium } from 'playwright';
import fs from 'node:fs';

async function scrape() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  // Scrape team members
  console.log('Extracting data...');
  const data = await page.evaluate(() => {
    // We need to click each member to see their quote/github/linkedin, if it opens a modal
    // Or maybe the data is embedded in the page's React state?
    // Let's grab window.__NEXT_DATA__ if it's there
    if (window.__NEXT_DATA__) {
      return window.__NEXT_DATA__.props.pageProps;
    }
    
    // Fallback: try to scrape DOM
    const cards = Array.from(document.querySelectorAll('.tm-card'));
    return cards.map(card => {
      // simulate click to open modal? We can't do that inside evaluate without async interaction
      return card.outerHTML; 
    });
  });

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    console.log('Found NEXT_DATA');
    fs.writeFileSync('tmp/team-data.json', JSON.stringify(data, null, 2));
  } else {
    // Let's do an interactive scrape
    const members = [];
    const cards = await page.$$('.tm-card');
    for (const card of cards) {
      const name = await card.$eval('.tm-name', el => el.textContent.trim()).catch(() => '');
      const role = await card.$eval('.tm-role', el => el.textContent.trim()).catch(() => '');
      
      // Click the card to open modal
      await card.click();
      await page.waitForTimeout(500); // wait for animation
      
      // Extract modal data
      const quote = await page.$eval('.tm-quote', el => el.textContent.trim()).catch(() => '');
      const github = await page.$eval('a[href*="github.com"]', el => el.getAttribute('href')).catch(() => '');
      const linkedin = await page.$eval('a[href*="linkedin.com"]', el => el.getAttribute('href')).catch(() => '');
      const instagram = await page.$eval('a[href*="instagram.com"]', el => el.getAttribute('href')).catch(() => '');
      const twitter = await page.$eval('a[href*="twitter.com"]', el => el.getAttribute('href')).catch(() => '');
      
      members.push({ name, role, quote, github, linkedin, instagram, twitter });
      
      // Close modal
      const closeBtn = await page.$('.tm-modal-close').catch(() => null);
      if (closeBtn) await closeBtn.click();
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    fs.writeFileSync('tmp/team-data.json', JSON.stringify(members, null, 2));
  }
  
  await browser.close();
  console.log('Done!');
}

scrape().catch(console.error);
