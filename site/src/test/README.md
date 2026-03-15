# GeoParquet Testing Guide

## Current Status

✅ **Test Infrastructure Created**:
- E2E test script: `src/test/e2e-geoparquet.js`
- Real-time monitoring script: `src/test/monitor-geoparquet.js`
- Puppeteer installed as dev dependency
- Dev server running on http://localhost:4321

⚠️ **NixOS Browser Compatibility Issue**:
Puppeteer's bundled Chrome doesn't work on NixOS due to dynamic linking. You need to either:
1. Install Chromium via Nix
2. Use the manual testing approach (recommended for immediate testing)

---

## Quick Start: Manual Testing

**Dev server is already running on: http://localhost:4321**

### Step 1: Open the Demo Page

Navigate to: http://localhost:4321/sandbox/geoparquet-demo/

### Step 2: Visual Verification Checklist

- [ ] Loading spinner appears initially (animated blue spinner)
- [ ] OpenStreetMap basemap loads after spinner disappears
- [ ] Blue scatter points render on the map
- [ ] Map is centered around Indonesia region (lon: 118, lat: -2)
- [ ] Map has border and rounded corners

### Step 3: Interaction Testing

- [ ] **Pan**: Click and drag the map → should pan smoothly
- [ ] **Zoom**: Scroll wheel → should zoom in/out
- [ ] **Hover**: Move mouse over data points → tooltip should appear with data

### Step 4: Browser Console Verification (F12 > Console)

Expected logs:
```
📝 Loading GeoParquet from URL: ...
📝 DuckDB httpfs extension loaded
📝 DuckDB spatial extension loaded
📝 Query result type: object
📝 Arrow table schema: ...
📝 Arrow table row count: <number>
📝 First 3 data points: ...
```

Check for:
- ✅ No CORS errors
- ✅ No WebGL errors
- ✅ No JavaScript errors

### Step 5: Network Tab Verification (F12 > Network)

Filter by ".parquet":
- [ ] Status: 206 (Partial Content) - indicates HTTP range requests working
- [ ] Multiple requests to the same file
- [ ] Individual request sizes < 10MB each
- [ ] Total transferred < 50MB for initial view

---

## Option 1: Fix Puppeteer for NixOS

### Install Chromium via Nix

Add to your `configuration.nix` or use `nix-shell`:

```bash
nix-shell -p chromium
```

### Update E2E Scripts to Use System Chromium

Edit `src/test/e2e-geoparquet.js` and `src/test/monitor-geoparquet.js`:

```javascript
const browser = await puppeteer.launch({
  headless: false,
  executablePath: '/nix/store/.../bin/chromium', // Path from 'which chromium'
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Run the Tests

```bash
node src/test/e2e-geoparquet.js
node src/test/monitor-geoparquet.js
```

---

## Option 2: Use Docker for Testing

Create `Dockerfile.test`:

```dockerfile
FROM node:20

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["node", "src/test/e2e-geoparquet.js"]
```

Run tests in Docker:
```bash
docker build -f Dockerfile.test -t geoparquet-test .
docker run --network host geoparquet-test
```

---

## Option 3: Use Playwright (Alternative to Puppeteer)

Playwright has better NixOS support:

```bash
yarn add -D @playwright/test
yarn playwright install
```

Create `src/test/e2e-playwright.js`:

```javascript
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
// ... rest of test
```

---

## What to Check During Testing

### 1. Data Loading
- ✅ Parquet file loads via HTTP range requests (206 status)
- ✅ DuckDB-WASM initializes successfully
- ✅ Spatial extension loads
- ✅ Coordinates extracted correctly

### 2. Visualization
- ✅ ScatterplotLayer renders all data points
- ✅ Points appear at correct coordinates
- ✅ Map interactions (pan/zoom/rotate) work smoothly
- ✅ No visual glitches or rendering errors

### 3. Performance
- ✅ Initial load < 40 seconds
- ✅ Memory usage < 400MB after full load
- ✅ HTTP requests are efficient (multiple 206 responses)
- ✅ Smooth 30+ FPS during interactions

### 4. Error Handling
- ✅ Graceful error display if parquet fails to load
- ✅ Worker cleanup on component unmount
- ✅ No unhandled promise rejections
- ✅ Proper error boundaries

### 5. Interactivity
- ✅ Hover tooltips display correct data
- ✅ Point highlighting on hover
- ✅ Custom styling props work (if used)
- ✅ SQL filtering works (if used)

---

## Testing Shortcuts

### Quick Browser Test
```bash
# Server already running on port 4321
# Just open: http://localhost:4321/sandbox/geoparquet-demo/
```

### Monitor Network Traffic
```bash
# Open DevTools (F12)
# Network tab → Filter: ".parquet"
# Reload page and watch for:
#   - Status: 206
#   - Size: Multiple requests < 10MB each
```

### Check Memory Usage
```bash
# Open DevTools (F12)
# Performance tab → Take heap snapshot
# After load, check JS Heap Size < 400MB
```

---

## Common Issues

### Issue: Loading spinner never disappears
**Possible causes**:
- Parquet file path incorrect
- Network error fetching file
- DuckDB-WASM initialization failed

**Debug**: Check browser console for errors

### Issue: Map loads but no points visible
**Possible causes**:
- Geometry column missing or invalid
- ST_X/ST_Y extraction failed
- Coordinates out of viewport bounds

**Debug**: Check console logs for "Arrow table row count" and "First 3 data points"

### Issue: High memory usage (> 600MB)
**Possible causes**:
- HTTP range requests not working (downloading full file)
- Memory leak in component
- Too many points rendering at once

**Debug**: Check Network tab for 206 status codes

### Issue: Console errors about WebGL
**Possible causes**:
- Browser doesn't support WebGL
- GPU drivers outdated
- Hardware acceleration disabled

**Debug**: Run `document.createElement('canvas').getContext('webgl')` in console

---

## Test Results Template

Copy this template to document your test results:

```markdown
## GeoParquet Demo Test Results

**Date**: 2026-03-15
**Browser**: Chrome 125 / Firefox 124 / Safari 17
**Testing Method**: Manual / Automated E2E

### Visual Verification
- [ ] Loading spinner: Pass/Fail
- [ ] Map renders: Pass/Fail
- [ ] Data points visible: Pass/Fail
- [ ] Interactions work: Pass/Fail

### Console Logs
- [ ] No errors: Pass/Fail
- [ ] DuckDB loaded: Pass/Fail
- [ ] Spatial extension loaded: Pass/Fail

### Network
- [ ] HTTP 206 status: Pass/Fail
- [ ] Multiple range requests: Pass/Fail
- [ ] Total transferred < 50MB: Pass/Fail

### Performance
- Load time: ___ seconds
- Memory usage: ___ MB
- FPS during pan: ___ fps

### Issues Found
- None / List issues here

### Overall Result
✅ Pass / ❌ Fail
```

---

## Next Steps

1. **Immediate**: Do manual testing using the checklist above
2. **Short-term**: Fix Puppeteer/Playwright for automated testing
3. **Long-term**: Add unit tests for GeoParquetReader and component

## Support

If you encounter issues not covered here, check:
- Browser DevTools Console for errors
- Network tab for failed requests
- Performance tab for memory leaks
- DuckDB-WASM documentation: https://duckdb.org/docs/api/wasm
