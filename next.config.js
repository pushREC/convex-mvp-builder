/** @type {import('next').NextConfig} */

// Bundle analyzer for production build analysis
// Run with: npm run build:analyze
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // Enable React strict mode for catching common issues
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // TypeScript errors should fail the build
  typescript: {
    ignoreBuildErrors: false,
  },

  // NOTE: ESLint is run separately via `npm run lint`
  // Next.js 16+ no longer supports eslint config in next.config.js

  // Security headers - Verified against OWASP, MDN, Next.js docs (Dec 2025)
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevent clickjacking - DENY is more secure than SAMEORIGIN
          { key: "X-Frame-Options", value: "DENY" },
          // NOTE: X-XSS-Protection intentionally omitted - deprecated per OWASP
          // (can introduce vulnerabilities, CSP provides better protection)
          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Cross-Origin-Opener-Policy - Spectre protection
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Cross-Origin-Resource-Policy - Resource isolation
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          // Content Security Policy - comprehensive XSS protection
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud; " +
              "img-src 'self' data: blob: https:; " +
              "font-src 'self' https:; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none'; " +
              "upgrade-insecure-requests;",
          },
          // HTTP Strict Transport Security
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
