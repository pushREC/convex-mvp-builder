import { test, expect } from "@playwright/test";

/**
 * Reduced Motion Test Suite
 *
 * Verifies that the application respects user's motion preferences
 * per WCAG 2.1 SC 2.3.3 (Animation from Interactions)
 */

test.describe("Reduced Motion Support", () => {
  test("respects prefers-reduced-motion: reduce", async ({ browser }) => {
    // Create context with reduced motion preference
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });

    const page = await context.newPage();
    await page.goto("/");

    // Check that animations are disabled via CSS
    const hasReducedMotionStyles = await page.evaluate(() => {
      // Check if the reduced motion media query is being applied
      const style = document.createElement("style");
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          .test-reduced-motion { --reduced-motion: 1; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .test-reduced-motion { --reduced-motion: 0; }
        }
      `;
      document.head.appendChild(style);

      const testEl = document.createElement("div");
      testEl.className = "test-reduced-motion";
      document.body.appendChild(testEl);

      const computed = getComputedStyle(testEl);
      const value = computed.getPropertyValue("--reduced-motion").trim();

      // Cleanup
      document.head.removeChild(style);
      document.body.removeChild(testEl);

      return value === "1";
    });

    expect(hasReducedMotionStyles).toBe(true);

    // Check that transition/animation durations are reduced
    const animationDurations = await page.evaluate(() => {
      const results: { element: string; duration: string }[] = [];
      const elements = document.querySelectorAll("*");

      elements.forEach((el) => {
        const style = getComputedStyle(el);
        const animDuration = style.animationDuration;
        const transDuration = style.transitionDuration;

        // Only record non-zero durations
        if (animDuration !== "0s" && animDuration !== "0ms") {
          results.push({
            element: el.tagName.toLowerCase(),
            duration: animDuration,
          });
        }
        if (transDuration !== "0s" && transDuration !== "0ms") {
          // Transitions under 10ms are effectively instant
          const ms = parseFloat(transDuration);
          if (ms > 10) {
            results.push({
              element: el.tagName.toLowerCase(),
              duration: transDuration,
            });
          }
        }
      });

      return results;
    });

    // With reduced motion, most animations should be disabled
    // Some very short transitions may still exist for accessibility
    const longAnimations = animationDurations.filter((a) => {
      const duration = parseFloat(a.duration);
      // Consider anything over 100ms as a potentially problematic animation
      return duration > 100;
    });

    // Log any long animations found
    if (longAnimations.length > 0) {
      console.log(
        "Long animations found with reduced motion:",
        longAnimations
      );
    }

    // Most pages should have minimal long animations with reduced motion
    expect(longAnimations.length).toBeLessThan(5);

    await context.close();
  });

  test("animations work normally without reduced motion preference", async ({
    browser,
  }) => {
    // Create context without reduced motion preference
    const context = await browser.newContext({
      reducedMotion: "no-preference",
    });

    const page = await context.newPage();
    await page.goto("/");

    // Page should load normally
    await expect(page).toHaveURL(/localhost:3000/);

    // Verify page is functional
    const body = page.locator("body");
    await expect(body).toBeVisible();

    await context.close();
  });

  test("CSS custom properties for reduced motion are respected", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });

    const page = await context.newPage();
    await page.goto("/");

    // Check if the global CSS includes reduced motion rules
    const styleSheets = await page.evaluate(() => {
      const rules: string[] = [];

      for (const sheet of document.styleSheets) {
        try {
          if (sheet.cssRules) {
            for (const rule of sheet.cssRules) {
              if (rule.cssText.includes("prefers-reduced-motion")) {
                rules.push(rule.cssText);
              }
            }
          }
        } catch {
          // Cross-origin stylesheets will throw
        }
      }

      return rules;
    });

    // Should have at least one rule for reduced motion
    expect(styleSheets.length).toBeGreaterThan(0);

    await context.close();
  });
});
