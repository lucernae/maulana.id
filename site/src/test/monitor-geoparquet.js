import puppeteer from 'puppeteer';

(async () => {
  console.log('👀 Starting Real-Time GeoParquet Monitor...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true, // Open DevTools automatically
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewport({ width: 1280, height: 800 });

  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('.parquet')) {
      console.log('📦 PARQUET REQUEST:', request.url());
      console.log('   Method:', request.method());
    }
  });

  page.on('response', async (response) => {
    if (response.url().includes('.parquet')) {
      const headers = response.headers();
      const contentLength = headers['content-length'];
      const contentRange = headers['content-range'];
      console.log('✅ PARQUET RESPONSE:', response.status());
      if (contentLength) {
        console.log(`   Size: ${(parseInt(contentLength) / 1024).toFixed(2)} KB`);
      }
      if (contentRange) {
        console.log(`   Range: ${contentRange}`);
      }
    }
  });

  // Monitor console
  page.on('console', msg => {
    const type = msg.type();
    const prefix = {
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️',
      'log': '📝'
    }[type] || '📝';
    console.log(`${prefix} ${msg.text()}`);
  });

  // Monitor page errors
  page.on('pageerror', error => {
    console.error('💥 PAGE ERROR:', error.message);
  });

  // Monitor request failures
  page.on('requestfailed', request => {
    console.error('❌ REQUEST FAILED:', request.url());
    console.error('   Reason:', request.failure().errorText);
  });

  // Monitor performance
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  console.log('🚀 Navigating to demo page...');
  await page.goto('http://localhost:4321/sandbox/geoparquet-demo/');
  console.log('✅ Page loaded. You can now interact with it manually.\n');

  // Keep monitoring for 2 minutes
  console.log('⏱️  Monitoring for 2 minutes. Interact with the page to see real-time logs...');
  console.log('   - Try panning the map');
  console.log('   - Try zooming in/out');
  console.log('   - Hover over data points');
  console.log('   - Check the browser DevTools that opened automatically\n');

  // Monitor memory every 15 seconds
  const memoryInterval = setInterval(async () => {
    const metrics = await page.metrics();
    const heapUsedMB = (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2);
    const heapTotalMB = (metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2);
    console.log(`💾 Memory: ${heapUsedMB} MB / ${heapTotalMB} MB`);
  }, 15000);

  await page.waitForTimeout(120000);

  clearInterval(memoryInterval);

  console.log('\n📊 Collecting final performance metrics...');
  const perfMetrics = await client.send('Performance.getMetrics');
  console.log('Final Metrics:', perfMetrics.metrics);

  const finalMetrics = await page.metrics();
  console.log('\nFinal Memory Usage:');
  console.log(`  - JS Heap Used: ${(finalMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - JS Heap Total: ${(finalMetrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - Documents: ${finalMetrics.Documents}`);
  console.log(`  - Frames: ${finalMetrics.Frames}`);
  console.log(`  - JS Event Listeners: ${finalMetrics.JSEventListeners}`);

  console.log('\n✅ Monitoring session complete!');
  await browser.close();
})();
