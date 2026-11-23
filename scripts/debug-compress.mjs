import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => console.log(m.type(), m.text()));
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
const bytes = [...fs.readFileSync('/tmp/test-compress-input.mp4')];
await page.evaluate(
  ({ data, name }) => {
    const input = document.getElementById('file-input');
    if (!input) throw new Error('missing file input');
    const blob = new Blob([new Uint8Array(data)], { type: 'video/mp4' });
    const file = new File([blob], name, { type: 'video/mp4' });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },
  { data: bytes, name: 'test-compress-input.mp4' },
);
await page.waitForFunction(
  () => !document.querySelector('#compress-btn')?.hasAttribute('disabled'),
  { timeout: 15000 },
);
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('input[type=checkbox]').setChecked(false);
await page.fill('#target-size', '1');
await page.click('#compress-btn');
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(2000);
  const err = await page.locator('.error-text').textContent().catch(() => '');
  const prog = await page.locator('#progress-text').textContent().catch(() => '');
  const hasDl = await page.locator('a#download-btn').count();
  console.log('tick', i, prog, err || '-', 'download', hasDl);
  if (hasDl) break;
}
await browser.close();