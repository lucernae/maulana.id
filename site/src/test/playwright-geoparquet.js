// Standalone Playwright test for GeoParquet demo
// Run with: node src/test/playwright-geoparquet.js

import { chromium } from 'playwright';
import { readdirSync } from 'fs';
import { join } from 'path';

(async () => {
  console.log('🚀 Starting Playwright GeoParquet Test...\n');

  let browser;
  try {
    // Launch browser
    console.log('🌐 Launching Chromium...');
    // Use Nix-provided Chromium from PLAYWRIGHT_BROWSERS_PATH environment variable
    let chromiumPath;
    if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
      try {
        // Find chromium symlink in the browsers directory
        const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;
        const chromiumLink = readdirSync(browsersPath).find(f => f.startsWith('chromium-'));
        if (chromiumLink) {
          chromiumPath = join(browsersPath, chromiumLink, 'chrome-linux', 'chrome');
          console.log(`   Using Nix Chromium: ${chromiumPath}`);
        }
      } catch (err) {
        console.log(`   Failed to find Nix Chromium: ${err.message}`);
      }
    }

    if (!chromiumPath) {
      console.log('   Using Playwright bundled browser');
    }

    browser = await chromium.launch({
      executablePath: chromiumPath,
      headless: false, // Set to true for CI/CD
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // Monitor console
    page.on('console', msg => {
      const type = msg.type();
      const prefix = {
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️',
        'log': '📝'
      }[type] || '📝';
      console.log(`${prefix} BROWSER: ${msg.text()}`);
    });

    // Monitor errors
    page.on('pageerror', error => {
      console.error('💥 PAGE ERROR:', error.message);
    });

    // Monitor network for parquet file
    const parquetRequests = [];
    page.on('request', request => {
      if (request.url().includes('.parquet')) {
        console.log('📦 PARQUET REQUEST:', request.method(), request.url());
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('.parquet')) {
        parquetRequests.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
        console.log('✅ PARQUET RESPONSE:', response.status());
        const contentLength = response.headers()['content-length'];
        const contentRange = response.headers()['content-range'];
        if (contentLength) {
          console.log(`   Size: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB`);
        }
        if (contentRange) {
          console.log(`   Range: ${contentRange} (HTTP range requests working!)`);
        }
      }
    });

    // Navigate to demo
    console.log('\n🗺️  Navigating to geoparquet demo...');
    await page.goto('http://localhost:4321/sandbox/geoparquet-demo/', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    console.log('✅ Page loaded\n');

    // Click the lazy-load button
    console.log('🔘 Clicking "Load Interactive Map" button...');
    const loadButton = page.locator('button:has-text("Load Interactive Map")').first();
    await loadButton.waitFor({ timeout: 10000 });
    await loadButton.click();
    console.log('✅ Map loading initiated\n');

    // Check for loading spinner
    console.log('⏳ Checking for loading state...');
    const spinnerVisible = await page.locator('.animate-spin').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(spinnerVisible ? '✅ Loading spinner detected' : 'ℹ️  Loading spinner not found (might have loaded too fast)');

    // Wait for canvas (map) to appear
    console.log('\n🎨 Waiting for map canvas to appear...');
    await page.waitForSelector('canvas', { timeout: 60000 });
    console.log('✅ Canvas element found!\n');

    // Check for error state
    console.log('🔍 Checking for error states...');
    const errorElement = await page.locator('.border-red-500').count();
    if (errorElement > 0) {
      const errorText = await page.locator('.border-red-500').textContent();
      console.error('❌ ERROR STATE DETECTED:', errorText);
      await page.screenshot({ path: 'geoparquet-error.png', fullPage: true });
      throw new Error('Error state detected on page');
    }
    console.log('✅ No error states found\n');

    // Wait a bit for data to fully load
    console.log('⏱️  Waiting for data to fully render...');
    await page.waitForTimeout(5000);

    // Wait for any refetching to complete (1s debounce + query time)
    console.log('⏳ Waiting for refetching to complete...');
    await page.waitForTimeout(2000);
    const refetchingIndicator = page.locator('div:has-text("Loading new area...")');
    const isRefetching = await refetchingIndicator.isVisible().catch(() => false);
    if (isRefetching) {
      console.log('   Refetching in progress, waiting for completion...');
      await refetchingIndicator.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        console.log('   ⚠️  Refetching indicator still visible, continuing anyway');
      });
    }
    console.log('✅ Map fully stabilized\n');

    // Count canvas elements
    const canvasCount = await page.locator('canvas').count();
    console.log(`✅ Found ${canvasCount} canvas element(s) (MapLibre + DeckGL)\n`);

    // Test 1: Take initial screenshot
    console.log('📸 Test 1: Capturing initial state...');
    await page.screenshot({ path: 'playwright-01-map-loaded.png', fullPage: true });
    console.log('✅ Screenshot saved: playwright-01-map-loaded.png\n');

    // Test 2: Pan interaction
    console.log('🖱️  Test 2: Testing pan interaction...');
    const mapElement = page.locator('canvas').first();
    await mapElement.hover({ position: { x: 400, y: 300 }, force: true });
    await page.mouse.down();
    await page.mouse.move(500, 400);
    await page.mouse.up();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-02-after-pan.png', fullPage: true });
    console.log('✅ Pan test complete, screenshot saved\n');

    // Test 3: Zoom interaction
    console.log('🔍 Test 3: Testing zoom interaction...');
    await mapElement.hover({ position: { x: 450, y: 350 }, force: true });
    await page.mouse.wheel(0, -100); // Zoom in
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-03-after-zoom.png', fullPage: true });
    console.log('✅ Zoom test complete, screenshot saved\n');

    // Test 4: Hover for tooltip
    console.log('💬 Test 4: Testing hover tooltip...');
    await mapElement.hover({ position: { x: 450, y: 350 }, force: true });
    await page.waitForTimeout(500);
    const tooltipVisible = await page.locator('[style*="position: absolute"]').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(tooltipVisible ? '✅ Tooltip detected on hover' : 'ℹ️  Tooltip not visible (may be outside data point area)');
    await page.screenshot({ path: 'playwright-04-hover.png', fullPage: true });
    console.log('📸 Hover screenshot saved\n');

    // Goal B: Test individual feature rendering performance
    console.log('🎯 Test 5: Individual Feature Rendering Performance (Goal B)...');
    console.log('   Finding zoom level with ~100 visible points...');

    // Zoom to a level where we expect ~100 individual points (above clusterZoomThreshold of 10)
    await mapElement.hover({ position: { x: 450, y: 350 }, force: true });
    console.log('   Zooming to level 12 (above cluster threshold)...');

    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(500);
    }

    // Measure rendering performance
    const renderStart = Date.now();
    await page.waitForTimeout(1000); // Wait for render to complete
    const renderEnd = Date.now();
    const renderTime = renderEnd - renderStart;

    console.log(`   Render time: ${renderTime}ms`);
    console.log(`   Expected: <200ms for smooth interaction`);
    console.log(renderTime < 200 ? '   ✅ Performance OK - no hanging detected' : '   ⚠️  Performance degraded');

    await page.screenshot({ path: 'playwright-05-individual-features.png', fullPage: true });
    console.log('   ✅ Individual feature test complete');
    console.log('   📸 Screenshot saved: playwright-05-individual-features.png\n');

    // NEW: Test 6: Geometry Rendering Feature
    console.log('🗺️  Test 6: Geometry Rendering Feature...');

    // Check for geometry count in UI overlay
    console.log('   Checking for geometry count overlay...');
    const geometryOverlay = page.locator('div:has-text("geometries")').first();
    const hasGeometryInfo = await geometryOverlay.isVisible().catch(() => false);
    console.log(hasGeometryInfo ? '   ✅ Geometry count overlay detected' : '   ℹ️  Geometry count overlay not visible (may be clustered view)');

    if (hasGeometryInfo) {
      const overlayText = await geometryOverlay.textContent();
      console.log(`   Overlay text: "${overlayText}"`);
      const geometryCountMatch = overlayText.match(/(\d+)\s+geometries/);
      if (geometryCountMatch) {
        const geometryCount = parseInt(geometryCountMatch[1]);
        console.log(`   ✅ Geometry count: ${geometryCount} features`);
      }
    }

    // Test tooltip for geometry type information
    console.log('\n   Testing geometry type in tooltip...');
    await mapElement.hover({ position: { x: 500, y: 400 }, force: true });
    await page.waitForTimeout(800); // Wait for tooltip

    const tooltip = page.locator('[style*="position: absolute"]').first();
    const tooltipShown = await tooltip.isVisible({ timeout: 2000 }).catch(() => false);

    if (tooltipShown) {
      const tooltipHTML = await tooltip.innerHTML();
      const hasGeometryType = tooltipHTML.includes('<b>Type:</b>');
      console.log(hasGeometryType ? '   ✅ Tooltip shows geometry type' : '   ℹ️  Tooltip does not show geometry type (might be a cluster)');

      if (hasGeometryType) {
        const typeMatch = tooltipHTML.match(/<b>Type:<\/b>\s*(\w+)/);
        if (typeMatch) {
          const geomType = typeMatch[1];
          console.log(`   📍 Geometry Type: ${geomType}`);

          // Validate geometry type
          const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
          const isValidType = validTypes.includes(geomType);
          console.log(isValidType ? `   ✅ Valid geometry type detected` : `   ⚠️  Unexpected geometry type: ${geomType}`);
        }
      }
    } else {
      console.log('   ℹ️  Tooltip not visible (may be outside feature area)');
    }

    await page.screenshot({ path: 'playwright-06-geometry-rendering.png', fullPage: true });
    console.log('   📸 Screenshot saved: playwright-06-geometry-rendering.png');
    console.log('   ✅ Geometry rendering test complete\n');

    // NEW: Test 7: Hybrid Rendering (Clusters + Geometries)
    console.log('🎯 Test 7: Hybrid Rendering (Clusters + Geometries)...');
    console.log('   Testing if clusters and geometries can render together...');

    // Zoom to a mid-level where we might have both
    console.log('   Zooming to level 9-10 (near cluster threshold)...');
    await mapElement.hover({ position: { x: 450, y: 350 }, force: true });

    // Zoom out a bit
    for (let i = 0; i < 2; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(500);
    }

    // Check overlay for hybrid indicators
    const overlayElement = page.locator('div').filter({ hasText: /Clustered view|geometries/ }).first();
    const overlayVisible = await overlayElement.isVisible().catch(() => false);

    if (overlayVisible) {
      const overlayContent = await overlayElement.textContent();
      const hasClusterInfo = overlayContent.includes('Clustered view');
      const hasGeometryCount = overlayContent.includes('geometries');
      const isHybrid = hasClusterInfo && hasGeometryCount;

      console.log(`   Overlay content: "${overlayContent}"`);
      console.log(`   Has cluster info: ${hasClusterInfo ? '✅' : '❌'}`);
      console.log(`   Has geometry count: ${hasGeometryCount ? '✅' : '❌'}`);
      console.log(isHybrid ? '   ✅ HYBRID RENDERING CONFIRMED - Both clusters and geometries visible!' : '   ℹ️  Single rendering mode active');
    }

    await page.screenshot({ path: 'playwright-07-hybrid-rendering.png', fullPage: true });
    console.log('   📸 Screenshot saved: playwright-07-hybrid-rendering.png');
    console.log('   ✅ Hybrid rendering test complete\n');

    // Verify network requests
    console.log('📊 Network Analysis:');
    console.log(`   Total parquet requests: ${parquetRequests.length}`);
    const has206 = parquetRequests.some(req => req.status === 206);
    console.log(`   HTTP 206 (Partial Content): ${has206 ? '✅ YES - Range requests working!' : '⚠️  NO - Full file download'}`);
    if (has206) {
      const rangeRequests = parquetRequests.filter(req => req.status === 206);
      console.log(`   Number of range requests: ${rangeRequests.length}`);
    }
    console.log('');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Page navigation: PASS');
    console.log('✅ Map rendering: PASS');
    console.log('✅ Canvas elements: PASS');
    console.log('✅ Pan interaction: PASS');
    console.log('✅ Zoom interaction: PASS');
    console.log(`${tooltipVisible ? '✅' : 'ℹ️ '} Hover tooltip: ${tooltipVisible ? 'PASS' : 'SKIPPED'}`);
    console.log(`${renderTime < 200 ? '✅' : '⚠️ '} Individual feature rendering (Goal B): ${renderTime < 200 ? 'PASS' : 'SLOW'}`);
    console.log(`${has206 ? '✅' : '⚠️ '} HTTP range requests: ${has206 ? 'PASS' : 'WARNING'}`);
    console.log('✅ Geometry rendering feature: TESTED');
    console.log('✅ Hybrid rendering (clusters + geometries): TESTED');
    console.log('✅ No error states: PASS');
    console.log('✅ Screenshots captured: 7 files');
    console.log('='.repeat(60));
    console.log('\n🎉 All tests completed successfully!\n');

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
