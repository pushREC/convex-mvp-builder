---
created: 2025-12-30
tags: [type/project]
---

[[README]]

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## AUTONOMOUS AGENT PROJECT

This is a **Convex MVP Builder** - a pre-configured project for autonomous agents
to build MVPs on top of the Convex + Next.js stack.

### Key Files for Agents

| File | Purpose |
|------|---------|
| `prompts/app_spec.txt` | MVP specification (EDIT THIS) |
| `prompts/initializer_prompt.md` | First session instructions |
| `prompts/coding_prompt.md` | Continuation session instructions |
| `feature_list.json` | Generated list of features to build |
| `claude-progress.txt` | Session-to-session progress notes |
| `GUARDRAILS.md` | What agents can/cannot modify |

### Agent Workflow

1. **Session 1 (Initializer):** Creates feature_list.json, sets up schema
2. **Sessions 2+:** Implements features one at a time, marks tests passing
3. **Each session:** Commits progress, updates claude-progress.txt

### Protected Files (Agent BLOCKED from modifying)

- `convex/auth.ts` - Authentication config
- `convex/auth.config.ts` - JWT config
- `convex/_generated/*` - Auto-generated types
- `app/ConvexClientProvider.tsx` - Provider setup
- `app/layout.tsx` - Root layout

See `GUARDRAILS.md` for complete rules.

---

## Commands

```bash
npm run dev              # Start Next.js + Convex dev servers
npm run build            # Production build
npm run lint             # ESLint check (0 warnings allowed)
npm run typecheck        # TypeScript type check
npm run test             # Playwright tests
npm run test:ui          # Playwright UI mode
npm run test:headed      # Tests with visible browser
npm run setup:verify     # Verify environment setup
npx convex logs          # View Convex function logs
```

## Architecture

**Stack:** Next.js 16 + Convex + TypeScript + Tailwind + shadcn/ui

**Data Flow:**
- `convex/` contains all backend code (queries, mutations, actions)
- `convex/_generated/` is auto-generated (never edit)
- React components use `useQuery`/`useMutation` from `convex/react`
- Auth uses `@convex-dev/auth` (ConvexAuthProvider wraps app)

**Key Files:**
- `convex/schema.ts` - Database schema (single source of truth)
- `convex/auth.ts` - Auth providers configuration
- `convex/auth.config.ts` - JWT provider config (required for password auth)
- `convex-docs.md` - Comprehensive Convex API reference
- `lib/config.ts` - App configuration from env vars

---

## ZERO TOLERANCE FOR INVENTION

You are a Convex + Next.js 15 implementation specialist with **ZERO tolerance** for making things up.

### THE GOLDEN RULE

```
If it's not explicitly documented in convex-docs.md, DO NOT USE IT.
```

### CORE DIRECTIVES

1. **READ BEFORE WRITE**: Always read `convex-docs.md` sections before implementing
2. **VERIFY IMPORTS**: Every import must match the Import Reference Cheatsheet exactly
3. **USE TEMPLATES**: Always use the exact templates provided, never improvise
4. **ACKNOWLEDGE LIMITATIONS**: If uncertain, ASK - never guess
5. **CHECK GENERATED FILES**: Never modify anything in `convex/_generated/`

---

## MANDATORY PRE-IMPLEMENTATION CHECKLIST

Before writing ANY Convex code, complete this checklist:

### Step 1: Documentation Verification

```
If SCHEMA changes:
  → Read convex-docs.md Section 4 (Schema & Validators)
  → Read convex-docs.md Section 16 (TypeScript Types)

If CONVEX FUNCTION:
  → Read convex-docs.md Section 5 (Convex Functions)
  → Read convex-docs.md Section 6 (Database Operations)
  → Read convex-docs.md Section 23 (Import Reference)

If REACT COMPONENT with Convex:
  → Read convex-docs.md Section 7 (Next.js Integration)
  → Read convex-docs.md Section 23 (Import Reference)

If PAGE with params/searchParams:
  → Read convex-docs.md Section 8 (Next.js 15 Breaking Changes)

If AUTH (OAuth only):
  → Read convex-docs.md Section 9.2-9.9 (Authentication)

If AUTH (Password/Email):
  → Read convex-docs.md Section 9.1 (JWT Key Generation) - CRITICAL
  → Read convex-docs.md Section 9.5-9.6 (Password Provider + auth.config.ts)
  → Read convex-docs.md Section 9.10-9.12 (Form, Errors, Checklist)
```

### Step 2: Pre-Write Verification

```
[ ] I have read the relevant section(s) of convex-docs.md
[ ] I have verified all imports against Section 23
[ ] I have verified all validators against Section 4
[ ] I am using an exact template from this CLAUDE.md
[ ] I am NOT using any deprecated/removed patterns
```

---

## FORBIDDEN PATTERNS REGISTRY

### CATEGORY 1: DEPRECATED/REMOVED VALIDATORS

#### FORBIDDEN: v.bigint()
```typescript
// ❌ FORBIDDEN - DEPRECATED
v.bigint()

// ✅ CORRECT - Use v.int64() instead
v.int64()
```

#### FORBIDDEN: v.map()
```typescript
// ❌ FORBIDDEN - DOES NOT EXIST (Removed in Convex 0.19.0)
v.map(v.string(), v.number())

// ✅ CORRECT - Use v.record() for string keys
v.record(v.string(), v.number())

// ✅ CORRECT - For complex keys, use array of objects
v.array(v.object({ key: v.string(), value: v.number() }))
```

#### FORBIDDEN: v.set()
```typescript
// ❌ FORBIDDEN - DOES NOT EXIST (Removed in Convex 0.19.0)
v.set(v.string())

// ✅ CORRECT - Use array with deduplication logic
v.array(v.string())
```

### CATEGORY 2: WRONG IMPORT PATHS

#### FORBIDDEN: ConvexAuthProvider from convex/react
```typescript
// ❌ FORBIDDEN - WRONG IMPORT PATH
import { ConvexAuthProvider } from "convex/react";

// ✅ CORRECT
import { ConvexAuthProvider } from "@convex-dev/auth/react";
```

#### FORBIDDEN: useAuthActions from convex/react
```typescript
// ❌ FORBIDDEN - WRONG IMPORT PATH
import { useAuthActions } from "convex/react";

// ✅ CORRECT
import { useAuthActions } from "@convex-dev/auth/react";
```

#### FORBIDDEN: getAuthUserId from convex/server
```typescript
// ❌ FORBIDDEN - WRONG IMPORT PATH
import { getAuthUserId } from "convex/server";

// ✅ CORRECT
import { getAuthUserId } from "@convex-dev/auth/server";
```

#### FORBIDDEN: httpRouter from _generated
```typescript
// ❌ FORBIDDEN - WRONG IMPORT PATH
import { httpRouter } from "./_generated/server";

// ✅ CORRECT
import { httpRouter } from "convex/server";
```

### CATEGORY 3: NEXT.JS 15 BREAKING CHANGES

#### FORBIDDEN: Synchronous params access
```typescript
// ❌ FORBIDDEN - Next.js 15 params are Promises
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // WILL BREAK
}

// ✅ CORRECT - Await params in Server Components
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
}

// ✅ CORRECT - Use use() hook in Client Components
'use client'
import { use } from 'react'

export default function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params);
}
```

#### FORBIDDEN: Synchronous searchParams access
```typescript
// ❌ FORBIDDEN - Next.js 15 searchParams are Promises
export default function Page({
  searchParams
}: {
  searchParams: { page?: string }
}) {
  const page = searchParams.page; // WILL BREAK
}

// ✅ CORRECT
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page = '1' } = await searchParams;
}
```

#### FORBIDDEN: Synchronous cookies() and headers()
```typescript
// ❌ FORBIDDEN - Next.js 15 requires await
import { cookies, headers } from 'next/headers';
const cookieStore = cookies();
const headersList = headers();

// ✅ CORRECT
import { cookies, headers } from 'next/headers';
const cookieStore = await cookies();
const headersList = await headers();
```

### CATEGORY 4: CONVEX FUNCTION ERRORS

#### FORBIDDEN: ctx.db in actions
```typescript
// ❌ FORBIDDEN - Actions do NOT have ctx.db
export const myAction = action({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", {}); // WILL FAIL
  },
});

// ✅ CORRECT - Use ctx.runMutation for database operations in actions
export const myAction = action({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.tasks.create, {});
  },
});
```

#### FORBIDDEN: Missing returns validator
```typescript
// ❌ FORBIDDEN - Missing returns validator
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

// ✅ CORRECT - Always include returns validator
export const myQuery = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
```

#### FORBIDDEN: "use node" for fetch()
```typescript
// ❌ FORBIDDEN - fetch() does NOT require "use node"
"use node";
export const fetchData = action({
  handler: async (ctx) => {
    return await fetch("https://api.example.com");
  },
});

// ✅ CORRECT - fetch() works in default runtime
export const fetchData = action({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await fetch("https://api.example.com");
  },
});
```

#### FORBIDDEN: ctx.storage.getMetadata()
```typescript
// ❌ FORBIDDEN - DEPRECATED
const metadata = await ctx.storage.getMetadata(storageId);

// ✅ CORRECT - Query _storage system table
const metadata = await ctx.db.system.get(storageId);
```

### CATEGORY 5: CLIENT COMPONENT ERRORS

#### FORBIDDEN: useQuery without "use client"
```typescript
// ❌ FORBIDDEN - Hooks require client directive
import { useQuery } from "convex/react";

export default function Page() {
  const data = useQuery(api.tasks.list); // WILL FAIL
}

// ✅ CORRECT
"use client";

import { useQuery } from "convex/react";

export default function Page() {
  const data = useQuery(api.tasks.list);
}
```

#### FORBIDDEN: Not handling undefined state
```typescript
// ❌ FORBIDDEN - Not handling loading state
"use client";
export function TaskList() {
  const tasks = useQuery(api.tasks.list);
  return <ul>{tasks.map(t => <li>{t.title}</li>)}</ul>; // WILL CRASH
}

// ✅ CORRECT - Handle all states
"use client";
export function TaskList() {
  const tasks = useQuery(api.tasks.list);

  if (tasks === undefined) return <div>Loading...</div>;
  if (tasks === null) return <div>Not found</div>;
  if (tasks.length === 0) return <div>No tasks</div>;

  return <ul>{tasks.map(t => <li key={t._id}>{t.title}</li>)}</ul>;
}
```

### CATEGORY 6: AUTHENTICATION ERRORS (CRITICAL)

#### FORBIDDEN: Random base64 as JWT key
```typescript
// ❌ FORBIDDEN - Random string will NOT work
JWT_PRIVATE_KEY=randombase64string==

// ✅ CORRECT - Must be RSA PKCS#8 PEM format
// Generate with: openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvg...\n-----END PRIVATE KEY-----
```

#### FORBIDDEN: Ed25519 or EC keys for JWT
```bash
# ❌ FORBIDDEN - Ed25519 will cause "PrivateKeyInfo algorithm is not rsaEncryption"
openssl genpkey -algorithm ed25519 -out key.pem

# ❌ FORBIDDEN - EC keys will also fail
openssl ecparam -genkey -name prime256v1 -out key.pem

# ✅ CORRECT - MUST use RSA
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out key.pem
```

#### FORBIDDEN: Missing auth.config.ts for Password auth
```typescript
// ❌ FORBIDDEN - Password auth WILL FAIL without auth.config.ts
// Error: "No auth provider found matching the given token"

// ✅ CORRECT - Create convex/auth.config.ts
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

#### FORBIDDEN: Missing JWKS environment variable
```typescript
// ❌ FORBIDDEN - JWT_PRIVATE_KEY alone is NOT enough for password auth
// You ALSO need JWKS (public key in JSON Web Key Set format)

// ✅ CORRECT - Set BOTH in Convex Dashboard:
// JWT_PRIVATE_KEY = RSA private key (PEM format)
// JWKS = {"keys":[{"kty":"RSA","n":"...","e":"AQAB","alg":"RS256","use":"sig","kid":"..."}]}
```

#### FORBIDDEN: Weak passwords without validation
```typescript
// ❌ FORBIDDEN - Default password validation requires 8+ chars AND 1+ number
// Password "password" will fail
// Password "12345678" will fail (no letter? depends on config)

// ✅ CORRECT - Passwords must meet requirements
// Default: min 8 characters, at least 1 number
// Example valid password: "mypassword1"
```

---

## MANDATORY CODE TEMPLATES

### TEMPLATE 1: Query Function
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("tasks"),
    _creationTime: v.number(),
    title: v.string(),
    completed: v.boolean(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});
```

### TEMPLATE 2: Query with ID Parameter
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      completed: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});
```

### TEMPLATE 3: Query with Index
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
```

### TEMPLATE 4: Mutation Function
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      userId: args.userId,
      completed: false,
    });
  },
});
```

### TEMPLATE 5: Protected Query with Auth
```typescript
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const myProtectedQuery = query({
  args: {},
  returns: v.union(v.any(), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

### TEMPLATE 6: Action with External API
```typescript
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const fetchExternalData = action({
  args: { url: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    // fetch() does NOT require "use node"
    const response = await fetch(args.url);
    const data = await response.json();

    // To save data, use runMutation (NOT ctx.db)
    await ctx.runMutation(internal.data.save, { data });

    return data;
  },
});
```

### TEMPLATE 7: React Component with useQuery
```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskList() {
  const tasks = useQuery(api.tasks.list);

  // MANDATORY: Handle all states
  if (tasks === undefined) {
    return <div>Loading...</div>;
  }

  if (tasks === null) {
    return <div>Not found</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks yet</div>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

### TEMPLATE 8: React Component with useMutation
```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function CreateTask() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = useMutation(api.tasks.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createTask({ title });
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
```

### TEMPLATE 9: ConvexClientProvider WITH Auth
```typescript
"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
```

### TEMPLATE 10: Schema Definition
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    userId: v.id("users"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_completed", ["userId", "completed"]),
});
```

### TEMPLATE 11: HTTP Action
```typescript
import { httpAction } from "./_generated/server";

export const myHttpEndpoint = httpAction(async (ctx, request) => {
  const body = await request.json();

  // Process request...

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
```

### TEMPLATE 12: Cron Job
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup old data",
  { minutes: 60 },
  internal.cleanup.run
);

export default crons;
```

### TEMPLATE 13: File Upload Handler
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });
  },
});
```

### TEMPLATE 14: Paginated Query
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(v.any()),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### TEMPLATE 15: Internal Function
```typescript
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal functions are NOT exposed to clients
// Call them from actions using ctx.runMutation(internal.module.function, args)

export const processInBackground = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("processedData", {
      data: args.data,
      processedAt: Date.now(),
    });
    return null;
  },
});
```

### TEMPLATE 16: Search Index Query
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

// NOTE: Requires search index defined in schema:
// .searchIndex("search_title", { searchField: "title" })

export const searchTasks = query({
  args: { searchTerm: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.searchTerm.length < 2) {
      return [];
    }

    return await ctx.db
      .query("tasks")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm)
      )
      .take(10);
  },
});
```

### TEMPLATE 17: Auth Config File (REQUIRED for Password Auth)
```typescript
// convex/auth.config.ts
// ⚠️ THIS FILE IS REQUIRED for password/email authentication
// Without it: "No auth provider found matching the given token" error

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

### TEMPLATE 18: Password Provider with Custom Validation
```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,  // Optional: Remove if not using OAuth
    Password({
      // Extract user profile from credentials
      profile(params) {
        return {
          email: params.email as string,
        };
      },
      // Custom password requirements (optional but recommended)
      validatePasswordRequirements: (password: string) => {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        if (!/\d/.test(password)) {
          throw new Error("Password must contain at least 1 number");
        }
      },
    }),
  ],
});
```

### TEMPLATE 19: Complete Password Sign In/Up Form
```typescript
"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function PasswordAuthForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", mode);  // CRITICAL: signIn or signUp

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <input name="email" type="email" placeholder="Email" required disabled={isLoading} />
      <input name="password" type="password" placeholder="Password" required disabled={isLoading} minLength={8} />
      {mode === "signUp" && <p className="text-sm text-gray-500">Min 8 chars, at least 1 number</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : mode === "signIn" ? "Sign In" : "Sign Up"}
      </button>
      <button type="button" onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}>
        {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
```

---

## IMPORT REFERENCE CHEATSHEET

### Convex Server (in convex/ files)
```typescript
import { query, mutation, action } from "./_generated/server";
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { defineSchema, defineTable } from "convex/server";
import { paginationOptsValidator } from "convex/server";
import { cronJobs } from "convex/server";
```

### Convex Auth Server
```typescript
import { getAuthUserId, getAuthSessionId } from "@convex-dev/auth/server";
import { authTables } from "@convex-dev/auth/server";
import { convexAuth } from "@convex-dev/auth/server";
```

### Convex Client (in React components)
```typescript
import { useQuery, useMutation, useAction } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { useConvex, useConvexAuth } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
```

### Convex Auth Client
```typescript
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useAuthActions } from "@convex-dev/auth/react";
```

### Convex Next.js
```typescript
import { preloadQuery, fetchQuery, fetchMutation } from "convex/nextjs";
import { Preloaded, usePreloadedQuery } from "convex/react";
```

---

## VERIFICATION WORKFLOW

### Before Creating a File
1. Identify which convex-docs.md sections to read
2. Complete the Pre-Implementation Checklist
3. Select the appropriate template from this CLAUDE.md

### After Creating a File
1. Verify all imports match the Import Reference Cheatsheet
2. Verify all functions have: `args`, `returns`, `handler`
3. Verify all `useQuery` results handle `undefined` state
4. Verify client components have `"use client"` directive

### Before Running `npx convex dev`
1. Check convex/schema.ts exists and is valid
2. Check no v.bigint(), v.map(), or v.set() used
3. Check all validators use v.* from "convex/values"

### After Running `npx convex dev`
1. Confirm convex/_generated folder exists
2. Confirm no TypeScript errors in terminal
3. Confirm "Convex functions ready!" message appears

---

## ERROR RECOVERY PROCEDURES

### ERROR: "Module not found: convex/_generated"
```bash
# Solution
npx convex dev

# If still failing
rm -rf .convex
npx convex dev
```

### ERROR: "Invalid validator"
```
Causes:
1. Using v.bigint() (deprecated) → Use v.int64()
2. Using v.map() or v.set() (removed) → Use v.record() or v.array()
3. Wrong import for v

Solution:
1. Check convex-docs.md Section 4 for valid validators
2. Search for v.bigint, v.map, v.set and replace
3. Verify: import { v } from "convex/values";
```

### ERROR: Type errors after schema changes
```bash
# Solution - Restart Convex dev server
# Press Ctrl+C, then:
npx convex dev

# If still wrong, force regeneration
rm -rf .convex
rm -rf convex/_generated
npx convex dev
```

### ERROR: Auth not working (COMPREHENSIVE)

**For OAuth (GitHub, Google, etc.):**
```
Checklist:
[ ] SITE_URL set in Convex Dashboard
[ ] OAuth credentials set (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET)
[ ] Using ConvexAuthProvider from "@convex-dev/auth/react"
[ ] convex/http.ts has auth.addHttpRoutes(http)
```

**For Password/Email Auth (MOST COMMON ISSUES):**
```
Checklist:
[ ] JWT_PRIVATE_KEY set in Convex Dashboard
    → MUST be RSA PKCS#8 PEM format (not random base64)
    → Generate with: openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048
    → Use \n for newlines when pasting
[ ] JWKS set in Convex Dashboard
    → JSON Web Key Set with matching public key
    → Format: {"keys":[{"kty":"RSA","n":"...","e":"AQAB","alg":"RS256","use":"sig","kid":"..."}]}
[ ] convex/auth.config.ts exists with provider config
[ ] SITE_URL set (http://localhost:3000 for dev)
[ ] convex/http.ts has auth.addHttpRoutes(http)
[ ] Using ConvexAuthProvider (NOT ConvexProvider)
```

**Specific Error → Solution:**
| Error | Solution |
|-------|----------|
| `Missing environment variable JWT_PRIVATE_KEY` | Set JWT_PRIVATE_KEY in Convex Dashboard |
| `"pkcs8" must be PKCS#8 formatted string` | Use openssl genpkey (not random string) |
| `PrivateKeyInfo algorithm is not rsaEncryption` | Use RSA algorithm (not Ed25519/EC) |
| `No auth provider found matching the given token` | Create auth.config.ts AND set JWKS |
| `Invalid password` | Password needs 8+ chars AND 1+ number |
| `Account already exists` | Use signIn flow, not signUp |
| `InvalidAccountId` | Use signUp flow to create account first |

### ERROR: "Cannot read properties of undefined"
```
Cause: Not handling loading state from useQuery

Solution: Always check for undefined FIRST
const data = useQuery(api.tasks.list);

if (data === undefined) return <Loading />;  // REQUIRED
if (data === null) return <NotFound />;
return <DataDisplay data={data} />;
```

---

## REQUIRED CHECKS BEFORE COMPLETION

Before marking ANY task as complete:

### TypeScript Check
```bash
npm run typecheck
```
Must show: **0 errors**

### Convex Schema Validation
```bash
npx convex dev --once
```
Must show: **Schema validated**

### Build Test
```bash
npm run build
```
Must complete: **Successfully**

---

## CONVEX-DOCS.MD INTEGRATION

### Reading Requirements

| Task | Required Reading (convex-docs.md) |
|------|-----------------------------------|
| Define schema | Section 4: Convex Schema & Validators |
| Create query | Section 5: Convex Functions, Section 6: Database Operations |
| Create mutation | Section 5: Convex Functions, Section 6: Database Operations |
| Create action | Section 5: Convex Functions (Action subsection) |
| Use "use node" | Section 5: "use node" Directive |
| Add React hooks | Section 7: React Hooks Reference |
| Handle route params | Section 8: Next.js 15 Breaking Changes |
| Implement OAuth auth | Section 9.2-9.9: Authentication |
| Implement Password auth | Section 9.1 (JWT Keys), Section 9.5-9.6 (Provider + Config), Section 9.10-9.12 |
| File uploads | Section 10: File Storage |
| Pagination | Section 14: Pagination |
| Any imports | Section 23: Import Reference Cheatsheet |

### When Pattern Not Found

If you cannot find a pattern in convex-docs.md:
1. DO NOT invent it
2. State: "This pattern is not documented in convex-docs.md"
3. Ask the user for clarification
4. Do NOT proceed until clarification received

---

## FILE MODIFICATION RULES

### Before Modifying ANY File
1. Read the ENTIRE file first
2. Understand the existing patterns
3. Make targeted changes only
4. Preserve existing functionality

### When Creating New Files
1. Check if similar file exists
2. Follow naming conventions:
   - Components: `PascalCase.tsx`
   - Utilities: `camelCase.ts`
   - Convex functions: `camelCase.ts`
3. Add "use client" if using:
   - useQuery, useMutation, useAction
   - useAuthActions
   - useState, useEffect
   - Any browser APIs

---

## DEBUGGING PROTOCOL

When something doesn't work:

1. **Check console** - Browser AND terminal
2. **Check types** - Run `npm run typecheck`
3. **Check Convex logs** - `npx convex logs`
4. **Check network** - Browser DevTools > Network
5. **Read error message** - Usually tells you exactly what's wrong

---

## COMMIT RULES

Never commit:
- With TypeScript errors
- With failing builds
- With hardcoded secrets
- Without testing the feature

---

**END OF GUARDRAILS**

When in doubt, consult `convex-docs.md` or ask for clarification.
