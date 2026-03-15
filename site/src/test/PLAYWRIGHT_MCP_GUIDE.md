# Using Playwright MCP for GeoParquet Testing

## Status

✅ **Playwright MCP Server Installed**: Configured in `~/.claude.json`
⚠️ **Restart Required**: You need to restart Claude Code for it to load

---

## After Restart: How to Use

### Quick Test Commands

Once Claude Code restarts, you can use natural language to run automated browser tests:

#### 1. Basic Navigation Test
```
"Use Playwright to open http://localhost:4321/sandbox/geoparquet-demo/
and take a screenshot"
```

**What the agent will do:**
- Launch browser
- Navigate to demo page
- Wait for page load
- Capture screenshot
- Report results

#### 2. Full End-to-End Test
```
"Use Playwright MCP to test the geoparquet demo:
1. Navigate to the page
2. Wait for loading spinner to disappear
3. Verify the map canvas appears
4. Test pan interaction by dragging
5. Test zoom by scrolling
6. Capture screenshots at each step
7. Report any console errors"
```

**What the agent will do:**
- Execute each step automatically
- Capture evidence (screenshots)
- Monitor console for errors
- Generate test report

#### 3. Performance Monitoring Test
```
"Use Playwright to navigate to the geoparquet demo and:
- Monitor network requests for the parquet file
- Check if HTTP 206 status is used (range requests)
- Measure memory usage
- Verify load time is under 40 seconds
- Take screenshot when fully loaded"
```

---

## Playwright MCP Tools Available

### Navigation
- `playwright_navigate` - Go to URL
- `playwright_goto` - Alternative navigation method
- `playwright_reload` - Refresh page

### Interaction
- `playwright_click` - Click element by selector
- `playwright_fill` - Type into input fields
- `playwright_hover` - Hover over element
- `playwright_scroll` - Scroll page

### Verification
- `playwright_screenshot` - Capture screenshot
- `playwright_pdf` - Save page as PDF
- `playwright_evaluate` - Run JavaScript
- `playwright_console_logs` - Get console output
- `playwright_network_activity` - Monitor network

### Assertions
- `playwright_expect_visible` - Check element visibility
- `playwright_expect_text` - Verify text content
- `playwright_expect_count` - Count elements

---

## Example: Automated GeoParquet Test

### Test Script (Natural Language)

```
Create a Playwright test for the geoparquet demo that:

1. Opens http://localhost:4321/sandbox/geoparquet-demo/
2. Waits up to 60 seconds for a canvas element to appear
3. Takes screenshot named "01-map-loaded.png"
4. Drags from (400, 300) to (500, 400) to test pan
5. Takes screenshot named "02-after-pan.png"
6. Scrolls wheel down 100 pixels to zoom in
7. Takes screenshot named "03-after-zoom.png"
8. Hovers over position (450, 350) to test tooltip
9. Takes screenshot named "04-tooltip.png"
10. Gets all console logs and checks for errors
11. Gets network activity and verifies parquet file loaded
12. Generates summary report
```

### Expected Agent Response

The agent will:
```javascript
// Agent generates and executes this automatically

import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

// 1. Navigate
await page.goto('http://localhost:4321/sandbox/geoparquet-demo/');

// 2. Wait for canvas
await page.waitForSelector('canvas', { timeout: 60000 });

// 3. Screenshot
await page.screenshot({ path: '01-map-loaded.png' });

// 4. Pan interaction
await page.mouse.move(400, 300);
await page.mouse.down();
await page.mouse.move(500, 400);
await page.mouse.up();

// 5. Screenshot after pan
await page.screenshot({ path: '02-after-pan.png' });

// ... continues for all steps

// Report
console.log('✅ All tests passed');
```

---

## GeoParquet-Specific Test Checklist

### Visual Tests
```
"Use Playwright to verify the geoparquet demo shows:
- A loading spinner initially
- OpenStreetMap tiles after loading
- Blue scatter points on the map
- Correct viewport (centered on Indonesia)
- Border and rounded corners on map container"
```

### Console Tests
```
"Use Playwright to check console logs for:
- 'DuckDB httpfs extension loaded'
- 'DuckDB spatial extension loaded'
- 'Arrow table row count: <number>'
- No error messages
- No WebGL warnings"
```

### Network Tests
```
"Use Playwright to monitor network activity and verify:
- Parquet file request uses HTTP 206 status
- Multiple range requests to same file
- Individual requests are under 10MB
- Total data transferred is under 50MB"
```

### Performance Tests
```
"Use Playwright to measure performance:
- Page load time
- Time until canvas appears
- Memory usage after full load
- Frame rate during pan/zoom
- Take heap snapshot"
```

---

## Comparison: Puppeteer Scripts vs Playwright MCP

### Puppeteer Scripts (Current)
✅ **Pros:**
- Already written and ready
- Full control over code
- Can run without restart

❌ **Cons:**
- Requires Chrome/Chromium (NixOS issue)
- Manual script execution
- Need to update scripts for changes

### Playwright MCP (After Restart)
✅ **Pros:**
- Agent generates tests on demand
- Natural language instructions
- Multi-browser support (Chromium, Firefox, WebKit)
- Better NixOS compatibility
- Screenshots and reports automatic
- No manual script maintenance

❌ **Cons:**
- Requires Claude Code restart
- First-time setup learning curve

---

## After Restart: Quick Start

1. **Verify Playwright is loaded:**
   ```
   "List available MCP tools"
   ```
   Should show: `playwright_navigate`, `playwright_screenshot`, etc.

2. **Run quick test:**
   ```
   "Use Playwright to navigate to http://localhost:4321/sandbox/geoparquet-demo/
   and take a screenshot"
   ```

3. **Run full test:**
   ```
   "Use Playwright MCP to run the complete geoparquet demo test including:
   - Visual verification
   - Interaction testing
   - Console log checking
   - Network monitoring
   - Performance metrics"
   ```

---

## Troubleshooting

### If Playwright tools aren't available after restart:

1. Check installation:
   ```bash
   cat ~/.claude.json | grep -A 5 '"playwright"'
   ```

2. Verify npx works:
   ```bash
   npx @playwright/mcp@latest --version
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

4. Check MCP server status in Claude Code:
   ```
   /help mcp
   ```

---

## Advanced: Persistent Test Suite

You can ask the agent to create a permanent test file:

```
"Create a Playwright test file at site/src/test/geoparquet.spec.js that:
- Tests all visual elements
- Tests all interactions
- Checks console logs
- Monitors network
- Generates HTML report
- Can be run with: npx playwright test"
```

This gives you both:
- **Ad-hoc testing**: Natural language prompts via MCP
- **CI/CD testing**: Persistent test files for automation

---

## Next Steps

1. ✅ Playwright MCP installed
2. ⏳ Restart Claude Code
3. 🚀 Use natural language to run browser tests
4. 📊 Generate test reports automatically
5. 🔄 Iterate and refine tests with agent help

## Resources

- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Playwright MCP Documentation](https://executeautomation.github.io/mcp-playwright/docs/intro)
- [Bug0: Playwright MCP Servers for AI Testing 2026](https://bug0.com/blog/playwright-mcp-servers-ai-testing)
- [Builder.io: How to Use Playwright MCP Server with Claude Code](https://www.builder.io/blog/playwright-mcp-server-claude-code)

---

**Development server is running:** http://localhost:4321
**Ready for testing after restart!** 🎉
