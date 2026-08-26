const puppeteer = require('puppeteer-core');
const fs = require('fs');
const paths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const exe = paths.find((p) => fs.existsSync(p));
(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text());
  });
  page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
  await page
    .goto('http://localhost:5173/b/B-1042', { waitUntil: 'networkidle0', timeout: 20000 })
    .catch((e) => errs.push('GOTO: ' + e.message));
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: 'shot-portal.png' });
  await page
    .goto('http://localhost:5173/console', { waitUntil: 'networkidle0', timeout: 20000 })
    .catch((e) => errs.push('GOTO2: ' + e.message));
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: 'shot-console.png' });
  console.log('browser:', exe ? exe.split('\\').pop() : 'NONE FOUND');
  console.log('errors:', errs.length ? errs.join('\n') : 'NONE');
  await browser.close();
})();
