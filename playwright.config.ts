import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Convex + Next.js Boilerplate
 *
 * Tests cover:
 * - Security headers (CSP, HSTS)
 * - Accessibility (WCAG 2.1 Level AA)
 * - Component behavior (toast memory, reduced motion)
 *
 * NOTE: Tests require a running dev server with Convex connected.
 * Run `npm run dev` in a separate terminal before running tests locally.
 * In CI, a placeholder URL is used and the server starts automatically.
 */

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // By default, only run Chromium (most reliable, matches CI)
  // To run cross-browser: npx playwright test --project=firefox --project=webkit
  // To install other browsers: npx playwright install firefox webkit
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Web server configuration
  // Local: expects `npm run dev` already running
  // CI: starts server with placeholder Convex URL
  webServer: {
    command: "npm run dev:frontend",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NEXT_PUBLIC_CONVEX_URL:
        process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud",
    },
  },
});
