// Quick script to detect columns in parquet file
// Run with: direnv exec . node src/test/detect-parquet-columns.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🔍 Detecting parquet columns...\n');

  // Use Nix-provided Chromium from environment
  let chromiumPath;
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    try {
      const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
      const chromiumLink = readdirSync(browsersPath).find(f => f.startsWith('chromium-'));
      if (chromiumLink) {
        chromiumPath = join(browsersPath, chromiumLink, 'chrome-linux', 'chrome');
      }
    } catch (err) {
      console.log(`   Failed to find Nix Chromium: ${err.message}`);
    }
  }

  const browser = await chromium.launch({
    executablePath: chromiumPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console to get column info
  const columns = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Arrow table schema:')) {
      console.log(text);
    }
    if (text.includes('First 3 data points:')) {
      console.log(text);
    }
  });

  await page.goto('http://localhost:4321/sandbox/geoparquet-demo/');
  await page.waitForTimeout(10000); // Wait for data to load

  await browser.close();
  console.log('\n✅ Done! Check output above for column names');
})();
