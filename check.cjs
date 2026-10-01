const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000/team');
  await page.waitForTimeout(2000);
  const status = await page.$eval('.people-page', el => el.getAttribute('data-tower-status'));
  const canvasExists = await page.$eval('canvas', el => !!el).catch(() => false);
  console.log('Status:', status, 'Canvas Exists:', canvasExists);
  await browser.close();
})();
