// Check if parquet file has row group statistics for spatial optimization
// Run with: direnv exec . node src/test/check-parquet-metadata.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🔍 Checking Parquet Row Group Metadata for Spatial Optimization\n');

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

  // Inject DuckDB-WASM and query metadata
  await page.goto('about:blank');

  const result = await page.evaluate(async () => {
    // Import DuckDB
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

    // Load httpfs for remote access
    await conn.query("INSTALL httpfs;");
    await conn.query("LOAD httpfs;");

    const url = 'https://storage.maulana.id/datasets/gis/groundsource_2026_indonesia.parquet';

    // Get parquet file metadata
    const metadataQuery = `
      SELECT
        *
      FROM parquet_metadata('${url}')
    `;

    const metadata = await conn.query(metadataQuery);
    const metadataRows = metadata.toArray();

    // Get row group metadata
    const rowGroupQuery = `
      SELECT
        row_group_id,
        row_group_num_rows,
        total_byte_size,
        num_columns
      FROM parquet_schema('${url}')
      WHERE row_group_id IS NOT NULL
      LIMIT 10
    `;

    let rowGroups;
    try {
      const rgResult = await conn.query(rowGroupQuery);
      rowGroups = rgResult.toArray();
    } catch (e) {
      rowGroups = null;
    }

    // Check for statistics
    const statsQuery = `
      SELECT
        file_name,
        row_group_id,
        row_group_num_rows,
        total_compressed_size,
        total_uncompressed_size
      FROM parquet_file_metadata('${url}')
      LIMIT 5
    `;

    let stats;
    try {
      const statsResult = await conn.query(statsQuery);
      stats = statsResult.toArray();
    } catch (e) {
      stats = null;
    }

    await conn.close();
    await db.terminate();

    return {
      metadata: metadataRows,
      rowGroups,
      stats
    };
  });

  console.log('📦 Parquet File Metadata:');
  console.log(JSON.stringify(result.metadata, null, 2));

  if (result.rowGroups) {
    console.log('\n📊 Row Group Information:');
    console.log(JSON.stringify(result.rowGroups, null, 2));
  }

  if (result.stats) {
    console.log('\n📈 Row Group Statistics:');
    console.log(JSON.stringify(result.stats, null, 2));
  }

  console.log('\n💡 Analysis:');
  console.log('   - If row groups exist with statistics, spatial filtering COULD work');
  console.log('   - Requires querying read_parquet() directly (not CREATE TEMP TABLE)');
  console.log('   - Requires spatial sorting for optimal performance\n');

  await browser.close();
})();
