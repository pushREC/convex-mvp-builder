/**
 * =============================================================================
 * SHARED CONSTANTS
 * =============================================================================
 *
 * Single source of truth for configuration values used across the application.
 * These constants are imported by both client components and Convex functions.
 */

/**
 * Password validation requirements.
 * Used in:
 *   - convex/auth.ts (server-side validation)
 *   - components/auth/SignInForm.tsx (client-side validation + UI)
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumber: true,
} as const;

/**
 * Password validation error messages.
 * Used in convex/auth.ts for server-side error responses.
 */
export const PASSWORD_ERRORS = {
  TOO_SHORT: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
  NO_NUMBER: "Password must contain at least 1 number",
} as const;

/**
 * Generate password requirements help text for UI display.
 */
export function getPasswordHelpText(): string {
  const requirements: string[] = [];

  if (PASSWORD_REQUIREMENTS.minLength > 0) {
    requirements.push(`Min ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireNumber) {
    requirements.push("at least 1 number");
  }

  return requirements.join(", ");
}
