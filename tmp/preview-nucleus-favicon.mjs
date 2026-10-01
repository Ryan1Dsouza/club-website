import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const src = `data:image/svg+xml;base64,${svg.toString('base64')}`;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 480, height: 240 }, deviceScaleFactor: 2 });
  await page.setContent(`<!doctype html><html><head><meta charset="UTF-8"><style>
    * { box-sizing: border-box; } body { margin: 0; font: 12px system-ui; background: #eee; }
    section { height: 120px; padding: 16px 24px; display: flex; align-items: center; gap: 38px; }
    section + section { background: #171717; color: #ddd; }
    figure { margin: 0; display: grid; justify-items: center; gap: 8px; }
    figcaption { opacity: .7; } img { display: block; }
  </style></head><body>${[0, 1].map(() => `<section>${[16, 32, 48, 64].map(size => `<figure><img alt="Nucleus atom" src="${src}" width="${size}" height="${size}"><figcaption>${size}px</figcaption></figure>`).join('')}</section>`).join('')}</body></html>`);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await mkdir(new URL('../output/favicon-preview/', import.meta.url), { recursive: true });
  await page.screenshot({ path: new URL('../output/favicon-preview/nucleus-atom.png', import.meta.url).pathname.replace(/^\/(\w:)/, '$1') });
  console.log('Rendered Nucleus favicon at 16, 32, 48, and 64 pixels on light and dark backgrounds.');
} finally { await browser.close(); }
