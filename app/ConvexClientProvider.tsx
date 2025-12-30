"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

/**
 * =============================================================================
 * CONVEX CLIENT PROVIDER
 * =============================================================================
 *
 * Initializes the Convex client and wraps the app with auth context.
 *
 * FEATURES:
 *   - Environment validation at module load time
 *   - Auth context for the entire app
 *   - Real-time subscriptions to Convex queries
 *
 * CONNECTION LOSS HANDLING:
 *   Convex automatically reconnects when connection is lost. For production,
 *   you may want to show a connection status indicator:
 *
 *   1. Use the useConvex hook to access the client
 *   2. Listen to connection state changes
 *   3. Show a toast/banner when disconnected
 *
 *   Example (add to a component inside ConvexClientProvider):
 *   ```typescript
 *   import { useConvex } from "convex/react";
 *
 *   function ConnectionStatus() {
 *     const convex = useConvex();
 *     const [isConnected, setIsConnected] = useState(true);
 *
 *     useEffect(() => {
 *       // Convex client exposes connection state
 *       // Check the Convex docs for the latest API
 *     }, [convex]);
 *
 *     if (!isConnected) {
 *       return <Banner>Reconnecting to server...</Banner>;
 *     }
 *     return null;
 *   }
 *   ```
 *
 * Documentation: See convex-docs.md Section 7 (React Hooks Reference)
 */

/**
 * Validate NEXT_PUBLIC_CONVEX_URL at module load time.
 * This provides a clear, actionable error instead of cryptic runtime failures.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not set.\n\n" +
      "To fix this:\n" +
      "  1. Run: cp .env.example .env.local\n" +
      "  2. Run: npx convex dev\n" +
      "  3. Restart: npm run dev\n\n" +
      "The Convex URL is automatically added to .env.local when you run 'npx convex dev'."
  );
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
