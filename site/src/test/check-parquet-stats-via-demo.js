// Check parquet row group stats via demo page (where CORS is configured)
// Run with: direnv exec . node src/test/check-parquet-stats-via-demo.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🔍 Checking Parquet Row Group Metadata\n');

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

  await page.goto('http://localhost:4321/sandbox/geoparquet-demo/', {
    waitUntil: 'networkidle'
  });

  // Wait for page to load
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async () => {
    const url = 'https://storage.maulana.id/datasets/gis/groundsource_2026_indonesia.parquet';

    // Use existing DuckDB connection from the page (if available)
    // Or create a new one
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

    await conn.query("INSTALL httpfs;");
    await conn.query("LOAD httpfs;");

    // Get file metadata
    const metadataQuery = `SELECT * FROM parquet_file_metadata('${url}')`;

    let metadata;
    try {
      const result = await conn.query(metadataQuery);
      metadata = result.toArray().map(row => ({
        file_name: row.file_name,
        row_group_id: row.row_group_id,
        row_group_num_rows: row.row_group_num_rows,
        total_compressed_size: row.total_compressed_size,
        total_uncompressed_size: row.total_uncompressed_size
      }));
    } catch (e) {
      metadata = { error: e.message };
    }

    // Get schema info
    const schemaQuery = `SELECT * FROM parquet_schema('${url}') LIMIT 20`;

    let schema;
    try {
      const result = await conn.query(schemaQuery);
      schema = result.toArray();
    } catch (e) {
      schema = { error: e.message };
    }

    await conn.close();
    await db.terminate();

    return { metadata, schema };
  });

  console.log('📦 Parquet File Metadata (Row Groups):');
  console.log(JSON.stringify(result.metadata, null, 2));

  console.log('\n📋 Parquet Schema Info:');
  console.log(JSON.stringify(result.schema, null, 2));

  console.log('\n💡 Interpretation:');
  if (result.metadata && !result.metadata.error) {
    console.log(`   ✅ Found ${result.metadata.length} row groups`);
    console.log('   - DuckDB CAN use row group filtering');
    console.log('   - For spatial optimization, need row groups sorted by location');
    console.log('   - Test by querying read_parquet() directly (not CREATE TEMP TABLE)');
  } else {
    console.log('   ❌ Could not read row group metadata');
    console.log(`   Error: ${result.metadata?.error || 'Unknown'}`);
  }

  await browser.close();
})();
