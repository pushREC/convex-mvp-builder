/**
 * Auth configuration for Convex Auth.
 *
 * CONVEX_SITE_URL is automatically set by Convex in deployment.
 * For local development, it's set when running `npx convex dev`.
 */

const siteUrl = process.env.CONVEX_SITE_URL;

// Fail fast: Missing CONVEX_SITE_URL should error immediately, not silently fail
if (!siteUrl) {
  throw new Error(
    "CONVEX_SITE_URL environment variable is required. " +
      "This is automatically set by Convex - ensure you're running `npx convex dev`."
  );
}

const authConfig = {
  providers: [
    {
      domain: siteUrl,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
