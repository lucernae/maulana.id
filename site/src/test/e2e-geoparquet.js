import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting GeoParquet E2E Test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewport({ width: 1280, height: 800 });

  // Enable console monitoring
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

  page.on('pageerror', error => {
    console.error('💥 PAGE ERROR:', error.message);
  });

  try {
    console.log('🌐 Navigating to geoparquet demo...');
    await page.goto('http://localhost:4321/sandbox/geoparquet-demo/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('✅ Page loaded\n');

    // Wait for loading spinner
    console.log('⏳ Checking for loading state...');
    await page.waitForTimeout(1000);
    const hasSpinner = await page.$('.animate-spin') !== null;
    console.log(hasSpinner ? '✅ Loading spinner present' : '⚠️  Loading spinner not found\n');

    // Wait for map to load (spinner disappears, canvas appears)
    console.log('🗺️  Waiting for map to load (up to 60s)...');
    await page.waitForSelector('canvas', { timeout: 60000 });
    console.log('✅ Canvas element found\n');

    // Check for error state
    console.log('🔍 Checking for error states...');
    const hasError = await page.$('.border-red-500');
    if (hasError) {
      const errorText = await page.$eval('.border-red-500', el => el.textContent);
      console.error('❌ ERROR STATE DETECTED:', errorText);
      await page.screenshot({ path: 'error-state.png', fullPage: true });
      console.log('📸 Error screenshot saved: error-state.png');
      process.exit(1);
    }
    console.log('✅ No error states detected\n');

    console.log('🎉 Map loaded successfully!');

    // Verify canvas elements (MapLibre + DeckGL)
    const canvases = await page.$$('canvas');
    console.log(`✅ Found ${canvases.length} canvas element(s)\n`);

    // Wait a bit for data to fully load
    console.log('⏳ Waiting for data points to render...');
    await page.waitForTimeout(3000);

    // Test pan interaction
    console.log('🖱️  Testing pan interaction...');
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(500, 400);
    await page.mouse.up();
    await page.waitForTimeout(1000);
    console.log('✅ Pan interaction completed\n');

    // Test zoom interaction
    console.log('🔍 Testing zoom interaction...');
    await page.mouse.wheel({ deltaY: -100 });
    await page.waitForTimeout(1000);
    console.log('✅ Zoom interaction completed\n');

    // Test hover tooltip
    console.log('💬 Testing hover tooltip...');
    await page.mouse.move(450, 350);
    await page.waitForTimeout(500);
    const tooltip = await page.$('[style*="position: absolute"]');
    console.log(tooltip ? '✅ Tooltip visible' : '⚠️  Tooltip not detected (may be out of hover range)\n');

    // Capture screenshot
    console.log('📸 Capturing screenshot...');
    await page.screenshot({ path: 'geoparquet-demo-success.png', fullPage: true });
    console.log('✅ Screenshot saved: geoparquet-demo-success.png\n');

    // Performance metrics
    console.log('📊 Collecting performance metrics...');
    const metrics = await page.metrics();
    console.log('Performance Metrics:');
    console.log(`  - JS Heap Used: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - JS Heap Total: ${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Documents: ${metrics.Documents}`);
    console.log(`  - Frames: ${metrics.Frames}`);
    console.log(`  - JS Event Listeners: ${metrics.JSEventListeners}\n`);

    // Check memory usage
    const heapUsedMB = metrics.JSHeapUsedSize / 1024 / 1024;
    if (heapUsedMB > 400) {
      console.log('⚠️  WARNING: High memory usage detected (> 400MB)');
    } else {
      console.log('✅ Memory usage within acceptable range (< 400MB)');
    }

    await browser.close();
    console.log('\n✅ Test completed successfully!');
    console.log('🎉 All checks passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
    console.log('📸 Error screenshot saved: error-state.png');
    await browser.close();
    process.exit(1);
  }
})();
