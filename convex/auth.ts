import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import {
  PASSWORD_REQUIREMENTS,
  PASSWORD_ERRORS,
} from "../lib/constants";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,
    Password({
      profile(params) {
        // Validate email exists before type assertion
        if (typeof params.email !== "string") {
          throw new Error("Email required from OAuth provider");
        }
        return {
          email: params.email,
        };
      },
      validatePasswordRequirements: (password: string) => {
        // Use constants from lib/constants.ts (single source of truth)
        if (password.length < PASSWORD_REQUIREMENTS.minLength) {
          throw new Error(PASSWORD_ERRORS.TOO_SHORT);
        }
        if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
          throw new Error(PASSWORD_ERRORS.NO_NUMBER);
        }
      },
    }),
  ],
});
