/**
 * Headless smoke test: load tool, compress test MP4 to 1 MB target.
 * Requires: npm run preview, npx playwright, /tmp/test-compress-input.mp4
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const url = process.env.SMOKE_URL || 'http://127.0.0.1:4173/';
const input = process.env.SMOKE_VIDEO || '/tmp/test-compress-input.mp4';

if (!fs.existsSync(input)) {
  console.error('Missing test video:', input);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', msg => {
  if (msg.type() === 'error') console.error('PAGE', msg.text());
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.setInputFiles('#file-input', input);
await page.fill('#target-size', '1');
await page.click('#compress-btn');
await page.waitForSelector('#download-btn', { timeout: 180000 });
const href = await page.getAttribute('#download-btn', 'href');
const sizeText = await page.textContent('#progress-pane');
console.log('OK compress smoke:', href?.slice(0, 40), sizeText?.slice(0, 120));
await browser.close();