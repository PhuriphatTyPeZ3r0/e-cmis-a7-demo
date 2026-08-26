// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/*
 * E2E "เล่นหน้าจอ" suite for flow 7.1/7.2/7.3 (board resolution → chairman/secgen
 * signing → order/report). See docs/memory/standards/test-design-e2e-flow-71-73.md
 * for the full test design.
 *
 * No webServer block here on purpose — this project has no dev-server npm script
 * at all (static HTML served by whatever the developer already has running, same
 * as every manual browser test this whole project has relied on). Start a static
 * server on 127.0.0.1:8080 yourself before running `npm run test:e2e`.
 */
module.exports = defineConfig({
  testDir: './tests-e2e',
  fullyParallel: false, // each test seeds/cleans its own Supabase fixture rows — keep runs serial to avoid confusing overlapping console/network noise
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
