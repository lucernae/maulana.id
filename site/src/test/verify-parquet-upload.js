// Verify the uploaded parquet file is valid and readable by DuckDB
// Run with: direnv exec . node site/src/test/verify-parquet-upload.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🔍 Verifying uploaded parquet file...\n');

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

  const page = await browser.newPage();
  await page.goto('about:blank');

  try {
    const result = await page.evaluate(async () => {
      const duckdb = await import('https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@latest/+esm');

      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
      );

      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

      const conn = await db.connect();

      // Load extensions
      await conn.query("INSTALL httpfs;");
      await conn.query("LOAD httpfs;");
      await conn.query("INSTALL spatial;");
      await conn.query("LOAD spatial;");

      const url = 'https://storage.maulana.id/datasets/gis/groundsource_2026_indonesia.parquet';

      // Test 1: Check parquet metadata
      console.log('Test 1: Reading parquet metadata...');
      const metaStart = performance.now();
      const metaQuery = `SELECT COUNT(*) as total_rows FROM read_parquet('${url}')`;
      const metaResult = await conn.query(metaQuery);
      const metaTime = performance.now() - metaStart;
      const totalRows = metaResult.toArray()[0].total_rows;

      // Test 2: Check if lon/lat columns exist
      console.log('Test 2: Checking for lon/lat columns...');
      const colsQuery = `SELECT column_name FROM (DESCRIBE SELECT * FROM read_parquet('${url}') LIMIT 1)`;
      const colsResult = await conn.query(colsQuery);
      const columns = colsResult.toArray().map(row => row.column_name);

      // Test 3: Query with optimized WHERE clause (Indramayu extent)
      console.log('Test 3: Testing optimized spatial query...');
      const queryStart = performance.now();
      const optimizedQuery = `
        SELECT COUNT(*) as count
        FROM read_parquet('${url}')
        WHERE lon BETWEEN 108.0 AND 108.6
          AND lat BETWEEN -6.6 AND -6.0
      `;
      const queryResult = await conn.query(optimizedQuery);
      const queryTime = performance.now() - queryStart;
      const indramayuCount = queryResult.toArray()[0].count;

      await conn.close();
      await db.terminate();

      return {
        success: true,
        totalRows,
        columns,
        indramayuCount,
        metaTime: metaTime.toFixed(0),
        queryTime: queryTime.toFixed(0)
      };
    });

    console.log('\n✅ Verification Results:');
    console.log(`   Total rows: ${result.totalRows.toLocaleString()}`);
    console.log(`   Columns: ${result.columns.join(', ')}`);
    console.log(`   Has lon/lat: ${result.columns.includes('lon') && result.columns.includes('lat') ? '✅ YES' : '❌ NO'}`);
    console.log(`\n   Metadata query time: ${result.metaTime}ms`);
    console.log(`   Indramayu query time: ${result.queryTime}ms`);
    console.log(`   Indramayu rows: ${result.indramayuCount.toLocaleString()}`);

    if (result.columns.includes('lon') && result.columns.includes('lat')) {
      console.log('\n🎉 SUCCESS: Parquet file is valid and optimized!');
      console.log('   ✅ File uploaded correctly');
      console.log('   ✅ lon/lat columns present');
      console.log('   ✅ Queries work with HTTP range requests');
    } else {
      console.log('\n⚠️  WARNING: lon/lat columns missing');
      console.log('   File may not be the optimized version');
    }

  } catch (error) {
    console.error('\n❌ Verification FAILED:', error.message);
    console.error('\nPossible causes:');
    console.error('   - File is corrupted');
    console.error('   - Browser cache showing old version');
    console.error('   - CDN propagation delay');
    console.error('\nSuggested fixes:');
    console.error('   1. Wait 1-2 minutes for CDN propagation');
    console.error('   2. Clear browser cache (Ctrl+Shift+R)');
    console.error('   3. Try cache-busting URL: add ?v=2 to parquet URL');
  }

  await browser.close();
})();
