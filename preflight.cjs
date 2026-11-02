const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<button onclick="this.textContent=\'Ready\'">Check</button>');
    await page.getByRole('button', { name: 'Check' }).click();
    assert.equal(await page.getByRole('button').textContent(), 'Ready');
    console.log('Neutral browser check passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
