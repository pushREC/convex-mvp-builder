/**
 * Application configuration loaded from environment variables.
 *
 * Set these in your .env.local file:
 *   NEXT_PUBLIC_APP_NAME=Your App Name
 *   NEXT_PUBLIC_APP_DESCRIPTION=Your app description
 *
 * These are safe to expose to the client (NEXT_PUBLIC_ prefix).
 */
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "My App",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Micro SaaS Application",
} as const;
