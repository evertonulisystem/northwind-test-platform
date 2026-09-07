// Usage: node scripts/verify-swagger-ui.cjs [path to installed playwright package]
const { chromium } = require(process.argv[2] || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/api-docs');
    await page.locator('.opblock').first().waitFor({ timeout: 60000 });
    const expected = require('../lib/swagger');
    const blocks = page.locator('.opblock');
    const expectedCount = Object.values(expected.paths).reduce((n, ms) => n + Object.keys(ms).length, 0);
    assert.equal(await blocks.count(), expectedCount);
    let examples = 0;
    for (let i = 0; i < expectedCount; i++) {
      const block = blocks.nth(i);
      await block.locator('.opblock-summary-control').click();
      await block.locator('.responses-wrapper').waitFor();
      const count = await block.getByRole('tab', { name: 'Example Value', exact: true }).count();
      assert.ok(count > 0, await block.locator('.opblock-summary-path').innerText());
      examples += count;
      await block.locator('.opblock-summary-control').click();
    }
    assert.equal(await page.locator('.errors-wrapper .errors').count(), 0);
    console.log(JSON.stringify({ operationsRendered: expectedCount, exampleTabs: examples, errors: 0 }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
