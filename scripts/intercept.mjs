import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const responses = [];
  page.on('response', async (response) => {
    if (response.url().includes('.json') || response.url().includes('api') || response.headers()['content-type']?.includes('application/json')) {
      try {
        const text = await response.text();
        responses.push({ url: response.url(), data: text });
      } catch (e) {}
    }
  });

  await page.goto('https://nucleussjec.in/team', { waitUntil: 'networkidle' });
  
  // also extract the RSC payload from the page text
  const content = await page.content();
  const matches = [...content.matchAll(/self\.__next_f\.push\(\[1,\"(.*?)\"\]\)/g)];
  let rsc = '';
  for (const m of matches) {
    let str = m[1].replace(/\\\\/g, '\\').replace(/\\\"/g, '"').replace(/\\\\n/g, '\\n');
    rsc += str;
  }
  
  fs.writeFileSync('tmp/network-data.json', JSON.stringify({ responses, rsc }, null, 2));
  await browser.close();
}

run().catch(console.error);
