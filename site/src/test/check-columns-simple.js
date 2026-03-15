// Simple script to check parquet columns using DuckDB
// Run with: direnv exec . node src/test/check-columns-simple.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🔍 Checking Parquet Columns\n');

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

  // Inject DuckDB-WASM and check columns
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

      // Load httpfs for remote access
      await conn.query("INSTALL httpfs;");
      await conn.query("LOAD httpfs;");

      const url = 'https://storage.maulana.id/datasets/gis/groundsource_2026_indonesia.parquet';

      // Get column names
      const columnsQuery = `
        SELECT column_name, column_type
        FROM (DESCRIBE SELECT * FROM read_parquet('${url}') LIMIT 1)
      `;

      const columnsResult = await conn.query(columnsQuery);
      const columns = columnsResult.toArray().map(row => ({
        name: row.column_name,
        type: row.column_type
      }));

      // Test a simple query with LIMIT to see if it's fast
      console.log('Testing simple query with LIMIT 10...');
      const startTime = performance.now();
      const simpleQuery = `SELECT * FROM read_parquet('${url}') LIMIT 10`;
      const simpleResult = await conn.query(simpleQuery);
      const simpleTime = performance.now() - startTime;

      // Test expensive geometry query with LIMIT
      console.log('Testing geometry query with LIMIT 10...');
      await conn.query("INSTALL spatial;");
      await conn.query("LOAD spatial;");

      const geometryStart = performance.now();
      const geometryQuery = `
        SELECT
          ST_X(ST_Centroid(ST_GeomFromWKB(geometry))) as lon,
          ST_Y(ST_Centroid(ST_GeomFromWKB(geometry))) as lat
        FROM read_parquet('${url}')
        LIMIT 10
      `;
      const geometryResult = await conn.query(geometryQuery);
      const geometryTime = performance.now() - geometryStart;

      await conn.close();
      await db.terminate();

      return {
        columns,
        simpleQueryTime: simpleTime,
        geometryQueryTime: geometryTime,
        sampleRow: simpleResult.toArray()[0]
      };
    });

    console.log('📊 Columns in Parquet file:');
    result.columns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type}`);
    });

    console.log('\n⏱️  Query Performance:');
    console.log(`   - Simple SELECT * LIMIT 10: ${result.simpleQueryTime.toFixed(0)}ms`);
    console.log(`   - Geometry processing LIMIT 10: ${result.geometryQueryTime.toFixed(0)}ms`);

    console.log('\n📝 Sample row:');
    console.log(JSON.stringify(result.sampleRow, null, 2));

    // Analysis
    const hasLonLat = result.columns.some(c => c.name === 'longitude' || c.name === 'lon') &&
                      result.columns.some(c => c.name === 'latitude' || c.name === 'lat');

    console.log('\n💡 Analysis:');
    if (hasLonLat) {
      console.log('   ✅ File has pre-computed longitude/latitude columns - use these for filtering!');
    } else {
      console.log('   ⚠️  File does NOT have pre-computed lon/lat columns');
      console.log('   ⚠️  Query must parse WKB geometry for every row - this is SLOW!');
      console.log('   💡 Recommendation: Pre-compute centroid columns and re-save parquet');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  await browser.close();
})();
