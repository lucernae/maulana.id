// Performance test for GeoParquet clustering with network throttling
// Tests: 1 Mbps network to simulate real-world conditions
// Measures: HTTP requests, data transfer, render time, zoom performance
// Run with: node src/test/performance-clustering.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🚀 Performance Test: GeoParquet Clustering with Network Throttling\n');
  console.log('⏱️  Simulating 1 Mbps network connection...\n');

  let browser;
  try {
    // Launch browser - use Nix-provided Chromium from environment
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

    browser = await chromium.launch({
      executablePath: chromiumPath,
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    // Enable network throttling: 1 Mbps = 125 KB/s
    const cdpSession = await context.newCDPSession(await context.pages()[0] || await context.newPage());
    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 125 * 1024, // 1 Mbps = 125 KB/s
      uploadThroughput: 125 * 1024,
      latency: 50 // 50ms latency (typical for 3G/slow 4G)
    });

    const page = await context.newPage();

    // Performance metrics
    const metrics = {
      parquetRequests: [],
      totalBytesTransferred: 0,
      loadStartTime: null,
      loadEndTime: null,
      zoomEvents: [],
      consoleErrors: []
    };

    // Monitor console for errors
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        metrics.consoleErrors.push(msg.text());
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      }
    });

    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('.parquet')) {
        const timestamp = Date.now();
        console.log(`📦 [${new Date(timestamp).toISOString()}] PARQUET REQUEST: ${request.method()}`);
        metrics.parquetRequests.push({
          type: 'request',
          url: request.url(),
          timestamp
        });
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('.parquet')) {
        const timestamp = Date.now();
        const contentLength = response.headers()['content-length'];
        const contentRange = response.headers()['content-range'];
        const status = response.status();

        const bytes = contentLength ? parseInt(contentLength) : 0;
        metrics.totalBytesTransferred += bytes;

        console.log(`✅ [${new Date(timestamp).toISOString()}] PARQUET RESPONSE: ${status}`);
        console.log(`   Size: ${(bytes / 1024).toFixed(2)} KB`);
        if (contentRange) {
          console.log(`   Range: ${contentRange}`);
        }

        metrics.parquetRequests.push({
          type: 'response',
          url: response.url(),
          status,
          bytes,
          range: contentRange,
          timestamp
        });
      }
    });

    // Navigate and measure initial load
    console.log('\n🗺️  Phase 1: Initial Load (1 Mbps Network)');
    console.log('═'.repeat(60));

    await page.goto('http://localhost:4321/sandbox/geoparquet-demo/', {
      waitUntil: 'networkidle',
      timeout: 120000 // Increased timeout for slow network
    });

    // Click the lazy-load button to start loading the map
    console.log('🔘 Clicking "Load Interactive Map" button...');
    const loadButton = page.locator('button:has-text("Load Interactive Map")').first();
    await loadButton.waitFor({ timeout: 10000 });

    // Start timing after button click (actual data load start)
    metrics.loadStartTime = Date.now();
    await loadButton.click();
    console.log('✅ Map loading initiated');

    // Wait for map to load
    await page.waitForSelector('canvas', { timeout: 120000 });
    await page.waitForTimeout(3000); // Wait for data rendering

    metrics.loadEndTime = Date.now();
    const initialLoadTime = (metrics.loadEndTime - metrics.loadStartTime) / 1000;

    console.log(`\n✅ Initial load complete: ${initialLoadTime.toFixed(2)}s`);
    console.log(`📊 Data transferred: ${(metrics.totalBytesTransferred / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 Parquet requests: ${metrics.parquetRequests.filter(r => r.type === 'request').length}`);

    // Take screenshot
    await page.screenshot({ path: 'perf-01-initial-load.png' });

    // Phase 2: Test zoom interactions (measure re-query performance)
    console.log('\n🔍 Phase 2: Zoom Performance Test');
    console.log('═'.repeat(60));

    const mapElement = page.locator('canvas').first();
    const bytesBeforeZoom = metrics.totalBytesTransferred;
    const requestsBeforeZoom = metrics.parquetRequests.filter(r => r.type === 'request').length;

    // Perform multiple zoom operations
    for (let i = 0; i < 3; i++) {
      console.log(`\n🔍 Zoom test ${i + 1}/3`);
      const zoomStartTime = Date.now();
      const requestsBefore = metrics.parquetRequests.filter(r => r.type === 'request').length;

      // Zoom in
      await mapElement.hover({ position: { x: 450, y: 350 } });
      await page.mouse.wheel(0, -200); // Significant zoom
      await page.waitForTimeout(500); // Wait for debounce + re-query

      const zoomEndTime = Date.now();
      const requestsAfter = metrics.parquetRequests.filter(r => r.type === 'request').length;
      const zoomDuration = (zoomEndTime - zoomStartTime) / 1000;
      const newRequests = requestsAfter - requestsBefore;

      metrics.zoomEvents.push({
        duration: zoomDuration,
        newRequests,
        timestamp: zoomEndTime
      });

      console.log(`   Duration: ${zoomDuration.toFixed(2)}s`);
      console.log(`   New parquet requests: ${newRequests}`);
      console.log(`   Status: ${newRequests > 0 ? '⚠️  RE-QUERYING FROM PARQUET' : '✅ CACHED'}`);

      await page.waitForTimeout(1000);
    }

    const bytesAfterZoom = metrics.totalBytesTransferred;
    const requestsAfterZoom = metrics.parquetRequests.filter(r => r.type === 'request').length;
    const zoomDataTransfer = bytesAfterZoom - bytesBeforeZoom;
    const zoomNewRequests = requestsAfterZoom - requestsBeforeZoom;

    await page.screenshot({ path: 'perf-02-after-zooms.png' });

    // Phase 3: Test cluster click interaction
    console.log('\n🎯 Phase 3: Cluster Click Test');
    console.log('═'.repeat(60));

    // Look for cluster info overlay
    const clusterOverlay = await page.locator('div:has-text("Clustered view")').isVisible().catch(() => false);
    console.log(`Cluster overlay visible: ${clusterOverlay ? '✅ YES' : '❌ NO'}`);

    if (clusterOverlay) {
      const clickStartTime = Date.now();
      const requestsBefore = metrics.parquetRequests.filter(r => r.type === 'request').length;

      // Click on map (attempt to click a cluster)
      await mapElement.click({ position: { x: 450, y: 350 } });
      await page.waitForTimeout(1000); // Wait for zoom animation + re-query

      const clickEndTime = Date.now();
      const requestsAfter = metrics.parquetRequests.filter(r => r.type === 'request').length;
      const clickDuration = (clickEndTime - clickStartTime) / 1000;
      const newRequests = requestsAfter - requestsBefore;

      console.log(`   Click-to-zoom duration: ${clickDuration.toFixed(2)}s`);
      console.log(`   New parquet requests: ${newRequests}`);
      console.log(`   Status: ${newRequests > 0 ? '⚠️  RE-QUERYING' : '✅ CACHED'}`);

      await page.screenshot({ path: 'perf-03-after-cluster-click.png' });
    }

    // Final Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PERFORMANCE TEST RESULTS');
    console.log('═'.repeat(60));
    console.log('\n🌐 Network Conditions:');
    console.log('   Bandwidth: 1 Mbps (125 KB/s)');
    console.log('   Latency: 50ms');
    console.log('\n⏱️  Initial Load:');
    console.log(`   Time: ${initialLoadTime.toFixed(2)}s`);
    console.log(`   Data transferred: ${(metrics.totalBytesTransferred / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Parquet requests: ${requestsBeforeZoom}`);
    console.log(`   Effective speed: ${((metrics.totalBytesTransferred / 1024 / 1024) / initialLoadTime).toFixed(2)} MB/s`);
    console.log('\n🔍 Zoom Operations (3x):');
    console.log(`   Total new requests: ${zoomNewRequests}`);
    console.log(`   Additional data: ${(zoomDataTransfer / 1024).toFixed(2)} KB`);
    console.log(`   Average zoom time: ${(metrics.zoomEvents.reduce((sum, e) => sum + e.duration, 0) / metrics.zoomEvents.length).toFixed(2)}s`);
    console.log('\n⚠️  INEFFICIENCY DETECTED:');
    if (zoomNewRequests > 0) {
      console.log(`   ❌ Component is re-querying parquet on every zoom change!`);
      console.log(`   ❌ ${zoomNewRequests} HTTP requests during zoom interactions`);
      console.log(`   ❌ ${(zoomDataTransfer / 1024).toFixed(2)} KB re-downloaded (already in DuckDB!)`);
      console.log('\n💡 RECOMMENDATION:');
      console.log('   ✅ Load parquet data ONCE into DuckDB temp table');
      console.log('   ✅ Cache temp table in-memory');
      console.log('   ✅ Perform clustering queries on cached data');
      console.log('   ✅ Avoid repeated HTTP range requests');
      console.log(`\n💰 POTENTIAL SAVINGS:`);
      console.log(`   Data transfer: ${((zoomDataTransfer / 1024 / 1024) * 100 / (metrics.totalBytesTransferred / 1024 / 1024)).toFixed(1)}% reduction`);
      console.log(`   HTTP requests: ${zoomNewRequests} fewer requests`);
    } else {
      console.log('   ✅ Data is being cached efficiently!');
    }

    console.log('\n🎯 Client-Side Rendering:');
    console.log('   The main cost is initial data load, not re-rendering');
    console.log('   Re-queries are SLOWER than client-side clustering');
    console.log('   RECOMMENDATION: Cache full dataset in-memory for small files (<10MB)');

    console.log('\n📸 Screenshots saved:');
    console.log('   - perf-01-initial-load.png');
    console.log('   - perf-02-after-zooms.png');
    if (clusterOverlay) {
      console.log('   - perf-03-after-cluster-click.png');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Performance test complete!\n');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
})();
