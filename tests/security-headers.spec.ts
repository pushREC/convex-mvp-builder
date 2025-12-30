import { test, expect } from "@playwright/test";

/**
 * Security Headers Test Suite
 *
 * Verifies that security headers are properly configured per OWASP guidelines:
 * - Content-Security-Policy (CSP) - Prevents XSS attacks
 * - Strict-Transport-Security (HSTS) - Enforces HTTPS
 * - Cross-Origin-Opener-Policy (COOP) - Spectre protection
 * - Cross-Origin-Resource-Policy (CORP) - Resource isolation
 * - X-XSS-Protection removed (deprecated, can introduce vulnerabilities)
 */

test.describe("Security Headers", () => {
  test("CSP header is present and properly configured", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const csp = response?.headers()["content-security-policy"];
    expect(csp).toBeDefined();

    // Verify critical CSP directives
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");

    // Verify Convex domains are allowed for connections
    expect(csp).toContain("https://*.convex.cloud");
    expect(csp).toContain("wss://*.convex.cloud");

    // Verify v4 security enhancements
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  test("HSTS header is present and properly configured", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const hsts = response?.headers()["strict-transport-security"];
    expect(hsts).toBeDefined();

    // Verify HSTS is configured for long duration
    expect(hsts).toContain("max-age=63072000"); // 2 years
    expect(hsts).toContain("includeSubDomains");
    expect(hsts).toContain("preload");
  });

  test("X-Content-Type-Options header prevents MIME sniffing", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const xcto = response?.headers()["x-content-type-options"];
    expect(xcto).toBe("nosniff");
  });

  test("X-Frame-Options is DENY for maximum clickjacking protection", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const xfo = response?.headers()["x-frame-options"];
    // DENY is more secure than SAMEORIGIN, matches CSP frame-ancestors 'none'
    expect(xfo).toBe("DENY");
  });

  test("Cross-Origin-Opener-Policy (COOP) provides Spectre protection", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const coop = response?.headers()["cross-origin-opener-policy"];
    expect(coop).toBe("same-origin");
  });

  test("Cross-Origin-Resource-Policy (CORP) provides resource isolation", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const corp = response?.headers()["cross-origin-resource-policy"];
    expect(corp).toBe("same-origin");
  });

  test("X-XSS-Protection is absent (deprecated per OWASP)", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    // X-XSS-Protection should NOT be set - it's deprecated and can introduce vulnerabilities
    // CSP provides better XSS protection
    const xxss = response?.headers()["x-xss-protection"];
    expect(xxss).toBeUndefined();
  });

  test("Referrer-Policy is set", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).not.toBeNull();

    const rp = response?.headers()["referrer-policy"];
    expect(rp).toBeDefined();
    expect(rp).toContain("origin");
  });
});
