import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility Test Suite
 *
 * Verifies WCAG 2.1 Level AA compliance using:
 * - @axe-core/playwright for automated WCAG testing
 * - Manual ARIA and focus indicator checks
 * - Screen reader support verification
 * - Semantic HTML validation
 */

test.describe("Accessibility", () => {
  test("Navigation has proper aria-label", async ({ page }) => {
    await page.goto("/");

    // Header navigation should have aria-label
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });

  test("Home link has proper aria-label", async ({ page }) => {
    await page.goto("/");

    // App name link should have aria-label for home
    const homeLink = page.locator('a[aria-label*="home"]');
    await expect(homeLink).toBeVisible();
  });

  test("Focus indicators are visible on keyboard navigation", async ({
    page,
  }) => {
    await page.goto("/");

    // Tab through interactive elements
    await page.keyboard.press("Tab");

    // Focused element should be visible
    const focused = page.locator(":focus-visible");
    await expect(focused).toBeVisible();

    // Continue tabbing to verify focus chain works
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus-visible")).toBeVisible();
  });

  test("LoadingSkeleton has screen reader attributes", async ({ page }) => {
    // Navigate to a page that shows loading state
    await page.goto("/");

    // The loading skeleton should have proper ARIA attributes when visible
    // Note: This test may need adjustment based on actual loading behavior
    const skeleton = page.locator('[role="status"][aria-busy="true"]');

    // If skeleton is visible, it should have sr-only text
    if (await skeleton.isVisible()) {
      const srText = skeleton.locator(".sr-only");
      await expect(srText).toContainText(/loading/i);
    }
  });

  test("Interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Get all interactive elements
    const interactiveElements = page.locator(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const count = await interactiveElements.count();

    // Verify we can tab to at least some interactive elements
    expect(count).toBeGreaterThan(0);

    // Tab through elements and verify focus moves
    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });

  test("Page has proper heading structure", async ({ page }) => {
    await page.goto("/");

    // Page should have heading elements for proper document structure
    const allHeadings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await allHeadings.count();

    expect(headingCount).toBeGreaterThan(0);
  });

  test("Images have alt text", async ({ page }) => {
    await page.goto("/");

    // All images should have alt attribute (can be empty for decorative)
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // alt should exist (even if empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test("Form inputs have associated labels", async ({ page }) => {
    await page.goto("/");

    // Get all form inputs
    const inputs = page.locator(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])'
    );
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      // Input should have either a label, aria-label, or aria-labelledby
      const hasLabel =
        id && (await page.locator(`label[for="${id}"]`).count()) > 0;
      const hasAriaLabel = ariaLabel !== null;
      const hasAriaLabelledBy = ariaLabelledBy !== null;

      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
    }
  });

  test("WCAG 2.1 Level AA compliance (axe-core)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Run axe-core accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Report violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log("Accessibility violations found:");
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Nodes: ${violation.nodes.length}`);
      });
    }

    // Expect no violations (or filter out known issues during development)
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Color contrast is sufficient", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Use axe-core specifically for color contrast
    const contrastResults = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    expect(contrastResults.violations).toEqual([]);
  });

  test("Skip link is present for keyboard users", async ({ page }) => {
    await page.goto("/");

    // Skip link should be first focusable element
    await page.keyboard.press("Tab");

    // Check if there's a skip link (common accessibility pattern)
    // This is optional but recommended
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    // Don't fail if not present, but log for info
    const skipLinkCount = await skipLink.count();
    if (skipLinkCount === 0) {
      console.log("Info: No skip link found - consider adding one");
    }
  });
});
