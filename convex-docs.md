# ULTIMATE Next.js + Convex + Vercel Reference

**The Definitive Zero-Gap Context Document for AI-Assisted MVP Development**

**Version**: 3.0 ULTIMATE  
**Verified**: December 2025  
**Sources**: docs.convex.dev, nextjs.org/docs, vercel.com/docs, labs.convex.dev/auth

> **FOR AI CODING AGENTS**: This is the SINGLE source of truth. Every pattern is triple-verified against official documentation. Follow this document exactly.

---

## Table of Contents

1. [Stack Overview & Architecture](#1-stack-overview--architecture)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [Convex Schema & Validators (Complete)](#4-convex-schema--validators-complete)
5. [Convex Functions (Complete)](#5-convex-functions-complete)
6. [Database Operations (Complete)](#6-database-operations-complete)
7. [Next.js Integration (Complete)](#7-nextjs-integration-complete)
8. [Next.js 15 Breaking Changes (CRITICAL)](#8-nextjs-15-breaking-changes-critical)
9. [Authentication (Complete)](#9-authentication-complete)
10. [File Storage (Complete)](#10-file-storage-complete)
11. [Scheduled Functions & Crons](#11-scheduled-functions--crons)
12. [HTTP Endpoints](#12-http-endpoints)
13. [Real-Time Features](#13-real-time-features)
14. [Pagination (Complete)](#14-pagination-complete)
15. [Error Handling Patterns](#15-error-handling-patterns)
16. [TypeScript Types & Inference](#16-typescript-types--inference)
17. [AI Coding Rules (CRITICAL)](#17-ai-coding-rules-critical)
18. [Common Patterns Library](#18-common-patterns-library)
19. [Deployment Guide](#19-deployment-guide)
20. [Production Checklist](#20-production-checklist)
21. [Troubleshooting](#21-troubleshooting)
22. [Real-World Examples](#22-real-world-examples)
23. [Import Reference Cheatsheet](#23-import-reference-cheatsheet)
24. [Prompt Templates for AI Agents](#24-prompt-templates-for-ai-agents)

---

## 1. Stack Overview & Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 14/15 (App Router) | React-based full-stack framework |
| Backend + Database | Convex | Reactive database, serverless functions, real-time, auth |
| Hosting | Vercel | Zero-config deployment |
| Language | TypeScript | Type-safe development |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui | Accessible component primitives |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  Next.js App (React + TypeScript)                              │
│  ├── app/                    # App Router pages & layouts      │
│  ├── components/             # React components                │
│  └── lib/                    # Utilities & helpers             │
│                                                                 │
│  ConvexProvider wraps app → real-time subscriptions            │
└─────────────────────────────────────────────────────────────────┘
                              │ WebSocket (real-time)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CONVEX CLOUD                            │
│                                                                 │
│  convex/                                                       │
│  ├── schema.ts              # Database schema                  │
│  ├── [feature].ts           # Queries, mutations, actions      │
│  ├── auth.ts                # Authentication config            │
│  ├── http.ts                # HTTP endpoints                   │
│  ├── crons.ts               # Scheduled jobs                   │
│  └── _generated/            # Auto-generated types             │
│                                                                 │
│  Features:                                                     │
│  • Document-relational database                                │
│  • Real-time subscriptions (automatic)                         │
│  • ACID transactions                                           │
│  • Serverless functions                                        │
│  • File storage                                                │
│  • Scheduled jobs (cron)                                       │
│  • Authentication (Convex Auth)                                │
└─────────────────────────────────────────────────────────────────┘
                              │ Git push triggers
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL                                 │
│                                                                 │
│  • Automatic builds on git push                                │
│  • Preview deployments per branch                              │
│  • Edge network CDN                                            │
│  • Environment variables management                            │
│  • Zero-config Next.js deployment                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
my-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers (REQUIRED)
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles (Tailwind)
│   ├── ConvexClientProvider.tsx # Convex provider wrapper ("use client")
│   ├── loading.tsx              # Root loading UI
│   ├── error.tsx                # Root error boundary (MUST be "use client")
│   ├── not-found.tsx            # 404 page
│   └── [feature]/               # Feature routes
│       ├── page.tsx
│       ├── [id]/                # Dynamic route
│       │   └── page.tsx
│       ├── loading.tsx          # Feature loading UI
│       └── error.tsx            # Feature error boundary
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   └── [feature]/               # Feature-specific components
│
├── convex/                       # Convex backend
│   ├── _generated/              # Auto-generated (NEVER edit)
│   │   ├── api.d.ts
│   │   ├── dataModel.d.ts
│   │   └── server.d.ts
│   ├── schema.ts                # Database schema (DEFINE FIRST)
│   ├── auth.ts                  # Auth configuration
│   ├── auth.config.ts           # Auth providers config
│   ├── http.ts                  # HTTP endpoints
│   ├── crons.ts                 # Scheduled jobs
│   └── [feature].ts             # Feature functions
│
├── lib/                          # Utilities
│   └── utils.ts
│
├── public/                       # Static assets
│
├── .env.local                    # Environment variables (gitignored)
├── convex.json                   # Convex configuration
├── next.config.js               # Next.js configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. Environment Variables

### Local Development (.env.local)

```bash
# Convex (auto-generated by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Auth (if using OAuth providers)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

### Convex Dashboard Variables

Set in Convex Dashboard → Settings → Environment Variables:

```bash
# REQUIRED for ALL auth
SITE_URL=https://your-domain.vercel.app  # Use http://localhost:3000 for dev

# REQUIRED for Password/Credentials auth (see Section 9 for generation)
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEv...your-key...\n-----END PRIVATE KEY-----
JWKS={"keys":[{"kty":"RSA","n":"...","e":"AQAB","alg":"RS256","use":"sig","kid":"..."}]}

# OAuth provider credentials (if using OAuth)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

### ⚠️ CRITICAL: Password Authentication Environment Variables

**If using Password/Email authentication, you MUST set these in Convex Dashboard:**

| Variable | Required For | Format |
|----------|-------------|--------|
| `SITE_URL` | All auth | URL (e.g., `http://localhost:3000`) |
| `JWT_PRIVATE_KEY` | Password auth | RSA PKCS#8 PEM format (see Section 9.1) |
| `JWKS` | Password auth | JSON Web Key Set with public key (see Section 9.1) |

**Common Errors if Missing:**
- `Missing environment variable JWT_PRIVATE_KEY` → Set JWT_PRIVATE_KEY
- `"pkcs8" must be PKCS#8 formatted string` → Key is wrong format (not PEM)
- `PrivateKeyInfo algorithm is not rsaEncryption` → Key is Ed25519/EC, must be RSA
- `No auth provider found matching the given token` → Missing JWKS or auth.config.ts

### Vercel Environment Variables

```bash
# Client-side (MUST have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Server-side only (NO prefix)
CONVEX_DEPLOY_KEY=prod:your-key
API_SECRET=your_secret
```

### CRITICAL RULES

1. **`NEXT_PUBLIC_*`** — Exposed to browser, inlined at BUILD TIME
2. **No prefix** — Server-side only, never reaches client
3. **Dynamic lookups DON'T WORK** for NEXT_PUBLIC_ variables:

```typescript
// ❌ WON'T WORK
const env = process.env;
setup(env.NEXT_PUBLIC_CONVEX_URL);

// ✅ WORKS
setup(process.env.NEXT_PUBLIC_CONVEX_URL);
```

---

## 4. Convex Schema & Validators (Complete)

### Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    userId: v.id("users"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_completed", ["userId", "completed"]),
});
```

### Complete Validator Reference

```typescript
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE VALIDATORS
// ═══════════════════════════════════════════════════════════════

v.string()              // string
v.number()              // number (float64)
v.boolean()             // boolean
v.null()                // null
v.int64()               // bigint — USE THIS for large integers
v.float64()             // explicit float64 (alias for v.number())
v.bytes()               // ArrayBuffer
v.bigint()              // ⚠️ DEPRECATED ALIAS for v.int64() — avoid

// ═══════════════════════════════════════════════════════════════
// COMPLEX VALIDATORS
// ═══════════════════════════════════════════════════════════════

v.id("tableName")                        // Document ID reference
v.array(v.string())                      // Array (max 8192 values)
v.object({ key: v.string() })            // Object (max 1024 entries)
v.record(v.string(), v.number())         // Record<string, number> (ASCII keys only)

// ═══════════════════════════════════════════════════════════════
// OPTIONAL, NULLABLE, AND UNIONS
// ═══════════════════════════════════════════════════════════════

v.optional(v.string())                   // string | undefined (field can be omitted)
v.union(v.string(), v.number())          // string | number
v.literal("active")                      // Exact value "active"
v.nullable(v.string())                   // string | null (convenience method)

// Discriminated unions
v.union(
  v.object({ kind: v.literal("text"), value: v.string() }),
  v.object({ kind: v.literal("number"), value: v.number() })
)

// ═══════════════════════════════════════════════════════════════
// ANY TYPE (use sparingly)
// ═══════════════════════════════════════════════════════════════

v.any()                                  // any (avoid if possible)

// ═══════════════════════════════════════════════════════════════
// OBJECT VALIDATOR METHODS (for reusable validators)
// ═══════════════════════════════════════════════════════════════

const userValidator = v.object({
  name: v.string(),
  email: v.string(),
  age: v.number(),
  role: v.string(),
});

// .pick() - Select specific fields
userValidator.pick("name", "email")      // { name, email } only

// .omit() - Exclude specific fields
userValidator.omit("age")                // Exclude age field

// .extend() - Add new fields
userValidator.extend({ bio: v.string() }) // Add bio field

// .partial() - Make ALL fields optional
userValidator.partial()                  // All fields become v.optional()
```

### ⚠️ DEPRECATED / REMOVED VALIDATORS

```typescript
// ❌ DEPRECATED — Use v.int64() instead
v.bigint()    // Still works but will be removed

// ❌ REMOVED in Convex 0.19.0 — These DO NOT EXIST
v.map()       // Use v.record() or v.array(v.object({ key, value }))
v.set()       // Use v.array() with deduplication logic
```

### Index Definition

```typescript
defineTable({
  userId: v.id("users"),
  status: v.string(),
  createdAt: v.number(),
})
  // Single field index
  .index("by_userId", ["userId"])
  
  // Compound index (field order matters!)
  .index("by_userId_and_status", ["userId", "status"])
  
  // For sorting within a filter
  .index("by_status_and_createdAt", ["status", "createdAt"])
  
  // Staged index (async backfill for large tables)
  .index("by_channel", { fields: ["channel"], staged: true })
```

**Index Rules:**
- Index name like `by_field1_and_field2` is **RECOMMENDED** convention, not required
- Field order matters: filter fields first, then sort fields
- `_creationTime` is automatically indexed on all tables
- Compound indexes support prefix queries
- Max 16 fields per index, max 32 indexes per table

### Search Index

```typescript
.searchIndex("search_body", {
  searchField: "body",                // REQUIRED: must be string field
  filterFields: ["channel", "user"],  // OPTIONAL
})
```

### Vector Index

```typescript
.vectorIndex("by_embedding", {
  vectorField: "embedding",           // REQUIRED: v.array(v.float64())
  dimensions: 1536,                   // REQUIRED: 2-4096
  filterFields: ["cuisine"],          // OPTIONAL
})
```

### System Fields (Automatic)

Every document automatically has:
- `_id` — Document ID (validator: `v.id("tableName")`)
- `_creationTime` — Creation timestamp in ms (validator: `v.number()`)

---

## 5. Convex Functions (Complete)

### REQUIRED Function Syntax

**ALWAYS use this structure:**

```typescript
export const functionName = query({
  args: { /* validators */ },
  returns: /* validator */,           // ALWAYS include
  handler: async (ctx, args) => {
    // implementation
  },
});
```

### Query Functions

```typescript
// convex/tasks.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// Basic query
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

// Query with ID
export const getById = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(
    v.object({
      _id: v.id("tasks"),
      title: v.string(),
      completed: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

// Query with index (ALWAYS PREFER over filter)
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

// Query with compound index
export const getByUserAndStatus = query({
  args: { 
    userId: v.id("users"),
    completed: v.boolean(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId_and_completed", (q) => 
        q.eq("userId", args.userId).eq("completed", args.completed)
      )
      .collect();
  },
});

// Query with ordering
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .order("desc")  // By _creationTime (newest first)
      .take(args.limit ?? 10);
  },
});

// Query with range (time-based)
export const getInTimeRange = query({
  args: { 
    channelId: v.id("channels"),
    afterMs: v.number(),
    beforeMs: v.number(),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) =>
        q.eq("channel", args.channelId)
          .gt("_creationTime", args.afterMs)
          .lt("_creationTime", args.beforeMs)
      )
      .collect();
  },
});
```

### Mutation Functions

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create
export const create = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    )),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      userId: args.userId,
      completed: false,
      priority: args.priority ?? "medium",
    });
  },
});

// Update (patch - partial update)
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(taskId, cleanUpdates);
    }
  },
});

// Replace (entire document)
export const replace = mutation({
  args: {
    taskId: v.id("tasks"),
    task: v.object({
      title: v.string(),
      completed: v.boolean(),
      userId: v.id("users"),
      priority: v.string(),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.replace(args.taskId, args.task);
  },
});

// Delete
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

// Mutation with validation
export const complete = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    await ctx.db.patch(args.taskId, {
      completed: true,
      completedAt: Date.now(),
    });
    
    return { success: true };
  },
});
```

### Action Functions

**Actions can call external APIs. They do NOT have direct `ctx.db` access.**

```typescript
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Basic action (fetch DOES NOT need "use node")
export const fetchData = action({
  args: { url: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const response = await fetch(args.url);
    return await response.json();
  },
});

// Action that writes to database
export const processPayment = action({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  returns: v.object({ success: v.boolean(), transactionId: v.string() }),
  handler: async (ctx, args) => {
    // Call external API
    const response = await fetch("https://api.stripe.com/...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: args.amount }),
    });
    const result = await response.json();
    
    // Write to database via mutation (NOT ctx.db!)
    await ctx.runMutation(internal.payments.record, {
      userId: args.userId,
      amount: args.amount,
      stripeId: result.id,
    });
    
    return { success: true, transactionId: result.id };
  },
});

// Action with Node.js built-ins (REQUIRES "use node")
// NOTE: Put in separate file that ONLY contains actions
```

### "use node" Directive (CRITICAL)

```typescript
// nodeActions.ts — File with "use node"
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "node:crypto";  // Node.js built-in
import fs from "node:fs";          // Node.js built-in

export const hashData = action({
  args: { data: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    return crypto.createHash("sha256").update(args.data).digest("hex");
  },
});
```

**"use node" Rules:**
1. Add at **VERY TOP** of file before any imports
2. File can **ONLY contain actions** — NO queries or mutations
3. Files WITHOUT "use node" **CANNOT import** files WITH "use node"
4. **`fetch()` does NOT require "use node"** — it works in default runtime
5. These work WITHOUT "use node": Web Crypto API, TextEncoder/Decoder, Blob, Request, Response

### Internal Functions

```typescript
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Not exposed to clients
export const getSecretData = internalQuery({
  args: { userId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const recordPayment = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    stripeId: v.string(),
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      stripeId: args.stripeId,
      createdAt: Date.now(),
    });
  },
});

// Call internal functions from other functions
export const process = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Use internal.* for internal functions
    const data = await ctx.runQuery(internal.module.getSecretData, { userId });
    await ctx.runMutation(internal.module.recordPayment, { ... });
  },
});
```

---

## 6. Database Operations (Complete)

### Reading Data

```typescript
// Get single document by ID
const doc = await ctx.db.get(documentId);
// Returns: Document | null

// Query all documents (throws if >1024)
const all = await ctx.db.query("tableName").collect();

// Query with index (ALWAYS PREFER)
const filtered = await ctx.db
  .query("tableName")
  .withIndex("by_field", (q) => q.eq("field", value))
  .collect();

// Result methods
.collect()      // Returns Document[] (all results, throws if >1024)
.first()        // Returns Document | null (first match)
.unique()       // Returns Document | null (throws if multiple matches)
.take(n)        // Returns Document[] (up to n)

// Ordering
.order("asc")   // Oldest first (DEFAULT)
.order("desc")  // Newest first
```

### Index Range Methods

```typescript
.withIndex("index_name", (q) => 
  q.eq("field", value)           // Exact match
   .gt("field2", value)          // Greater than
   .gte("field2", value)         // Greater than or equal
   .lt("field2", value)          // Less than
   .lte("field2", value)         // Less than or equal
)
```

### Filter Operations (Use Sparingly — Prefer Indexes)

```typescript
.filter((q) => q.eq(q.field("name"), "Alex"))
.filter((q) => q.neq(q.field("status"), "deleted"))
.filter((q) => q.gt(q.field("age"), 18))
.filter((q) => q.and(
  q.eq(q.field("name"), "Alex"),
  q.gte(q.field("age"), 18)
))
.filter((q) => q.or(
  q.eq(q.field("name"), "Alex"),
  q.eq(q.field("name"), "Emma")
))
.filter((q) => q.not(q.eq(q.field("status"), "deleted")))
```

### Writing Data

```typescript
// Insert — returns Id<"tableName">
const id = await ctx.db.insert("tableName", { field: "value" });

// Patch (partial update)
await ctx.db.patch(id, { field: "newValue" });
// Remove field by setting to undefined
await ctx.db.patch(id, { optionalField: undefined });

// Replace (entire document — removes fields not specified)
await ctx.db.replace(id, { field: "value", otherField: "value" });

// Delete
await ctx.db.delete(id);
```

### System Tables

```typescript
// Query _storage system table (for file metadata)
const metadata = await ctx.db.system.get(storageId);
// Returns: { _id, _creationTime, sha256, size, contentType }
```

---

## 7. Next.js Integration (Complete)

### ConvexClientProvider (Without Auth)

```typescript
// app/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

### ConvexClientProvider (With Convex Auth)

```typescript
// app/ConvexClientProvider.tsx
"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";  // CORRECT IMPORT
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

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js and Convex",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

### React Hooks Reference

```typescript
"use client";

import { 
  useQuery, 
  useMutation, 
  useAction, 
  usePaginatedQuery,
  useConvex,
  useConvexAuth,
} from "convex/react";
import { api } from "@/convex/_generated/api";

// useQuery — real-time subscription
const data = useQuery(api.tasks.list);
// Returns: undefined (loading) | null (not found) | Data

// useQuery with args
const task = useQuery(api.tasks.getById, { taskId: "123" });

// useQuery with skip (conditional query)
const task = useQuery(
  api.tasks.getById, 
  shouldFetch ? { taskId } : "skip"
);

// useMutation
const createTask = useMutation(api.tasks.create);
await createTask({ title: "New task", userId });

// useAction
const processPayment = useAction(api.payments.process);
const result = await processPayment({ amount: 100 });

// useConvex (for one-off queries)
const convex = useConvex();
const result = await convex.query(api.tasks.list);

// useConvexAuth
const { isLoading, isAuthenticated } = useConvexAuth();
```

### Page with Route Parameters

```typescript
// app/tasks/[taskId]/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

export default function TaskPage() {
  const params = useParams();
  const taskId = params.taskId as Id<"tasks">;
  
  const task = useQuery(api.tasks.getById, { taskId });

  if (task === undefined) return <div>Loading...</div>;
  if (task === null) return <div>Task not found</div>;

  return (
    <div>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
    </div>
  );
}
```

### Page with Search Params

```typescript
// app/tasks/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "all";
  
  const tasks = useQuery(api.tasks.listByStatus, { status });

  if (tasks === undefined) return <div>Loading...</div>;

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

### Server-Side Data Fetching

```typescript
// Server Component with preloadQuery (for SSR with reactivity)
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TaskList } from "./TaskList";

export default async function TasksPage() {
  const preloadedTasks = await preloadQuery(api.tasks.list);
  return <TaskList preloadedTasks={preloadedTasks} />;
}

// Client component with usePreloadedQuery
"use client";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskList({ 
  preloadedTasks 
}: { 
  preloadedTasks: Preloaded<typeof api.tasks.list>;
}) {
  const tasks = usePreloadedQuery(preloadedTasks);
  // Initially uses server data, then becomes reactive
  return <ul>{tasks.map(t => <li key={t._id}>{t.title}</li>)}</ul>;
}

// Server-only fetch (non-reactive)
import { fetchQuery } from "convex/nextjs";

export async function getStaticData() {
  const tasks = await fetchQuery(api.tasks.list);
  return tasks;
}
```

---

## 8. Next.js 15 Breaking Changes (CRITICAL)

### params and searchParams are Now Promises

```typescript
// ❌ BEFORE (Next.js 14)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
}

// ✅ AFTER (Next.js 15)
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;  // MUST AWAIT
}

// ✅ searchParams also a Promise
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page = '1' } = await searchParams;  // MUST AWAIT
}
```

### In Client Components (use React's `use` hook)

```typescript
'use client'
import { use } from 'react'

export default function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params);  // use() hook for Client Components
}
```

### cookies() and headers() are Now Async

```typescript
// ❌ BEFORE (Next.js 14)
import { cookies, headers } from 'next/headers';
const cookieStore = cookies();
const headersList = headers();

// ✅ AFTER (Next.js 15)
import { cookies, headers } from 'next/headers';
const cookieStore = await cookies();  // MUST AWAIT
const headersList = await headers();  // MUST AWAIT
```

### Caching Defaults Changed

```typescript
// Next.js 15: fetch is NO LONGER CACHED by default

const a = await fetch('https://...');                           // NOT cached
const b = await fetch('https://...', { cache: 'force-cache' }); // Explicit cache

// GET Route Handlers also NOT cached by default
// To opt-in to caching:
export const dynamic = 'force-static';
```

### error.tsx MUST be Client Component

```typescript
// app/error.tsx
'use client'  // REQUIRED

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Dynamic Metadata (Next.js 15)

```typescript
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ id: string }>  // NOW A PROMISE
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params  // MUST AWAIT
  const product = await fetch(`https://.../${id}`).then(r => r.json())
  
  return {
    title: product.title,
  }
}
```

---

## 9. Authentication (Complete)

### 9.1 JWT Key Generation (REQUIRED for Password Auth)

**⚠️ CRITICAL: Password authentication requires RSA keys. This is the #1 cause of auth failures.**

#### Step 1: Generate RSA Key Pair

```bash
# Generate RSA 2048-bit private key in PKCS#8 format
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private_key.pem

# Extract public key
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

#### Step 2: Convert Private Key for Convex

```bash
# View the private key (copy this for JWT_PRIVATE_KEY)
cat private_key.pem
```

**Format for `JWT_PRIVATE_KEY` in Convex Dashboard:**
- Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace newlines with `\n` (literal backslash-n) when pasting into Convex Dashboard
- Example: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----`

#### Step 3: Generate JWKS (JSON Web Key Set)

```bash
# Install jose-util or use Node.js script
npm install -g jose
```

**Node.js script to generate JWKS from private key:**

```javascript
// generate-jwks.js
const crypto = require('crypto');
const fs = require('fs');

const privateKey = fs.readFileSync('private_key.pem', 'utf8');
const keyObject = crypto.createPrivateKey(privateKey);
const publicKey = crypto.createPublicKey(keyObject);

// Export as JWK
const jwk = publicKey.export({ format: 'jwk' });
jwk.alg = 'RS256';
jwk.use = 'sig';
jwk.kid = crypto.randomUUID();

const jwks = { keys: [jwk] };
console.log(JSON.stringify(jwks));
```

```bash
node generate-jwks.js
# Copy output for JWKS environment variable
```

#### Step 4: Set Environment Variables in Convex Dashboard

Go to **Convex Dashboard → Settings → Environment Variables** and set:

| Variable | Value |
|----------|-------|
| `SITE_URL` | `http://localhost:3000` (dev) or `https://yourdomain.com` (prod) |
| `JWT_PRIVATE_KEY` | Full PEM key with `\n` for newlines |
| `JWKS` | Full JSON output from generate-jwks.js |

### 9.2 Convex Auth Setup

```bash
npm install @convex-dev/auth @auth/core@0.37.0
npx @convex-dev/auth
```

### 9.3 Required Files Overview

| File | Purpose | Required For |
|------|---------|--------------|
| `convex/schema.ts` | Auth tables | All auth |
| `convex/auth.ts` | Provider configuration | All auth |
| `convex/auth.config.ts` | JWT provider config | Password auth |
| `convex/http.ts` | Auth HTTP routes | All auth |

### 9.4 Schema with Auth Tables

```typescript
// convex/schema.ts
import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Your other tables...
});
```

### 9.5 Auth Configuration (convex/auth.ts)

#### OAuth Only (GitHub, Google, etc.)

```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],
});
```

#### Password + OAuth (MOST COMMON)

```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,
    Password({
      // Profile function extracts user data from credentials
      profile(params) {
        return {
          email: params.email as string,
        };
      },
      // Custom password validation (optional but recommended)
      validatePasswordRequirements: (password: string) => {
        // Default requirements: min 8 chars, at least 1 number
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

**Default Password Requirements (if no custom validation):**
- Minimum 8 characters
- At least 1 number

### 9.6 Auth Config File (convex/auth.config.ts) — REQUIRED FOR PASSWORD AUTH

**⚠️ This file is REQUIRED for password authentication. Without it, you'll get "No auth provider found" errors.**

```typescript
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

**What this file does:**
- Configures JWT token verification
- Links to your JWKS for token validation
- `domain` uses `CONVEX_SITE_URL` (automatically set by Convex from SITE_URL)
- `applicationID` should be `"convex"` for Convex Auth

### 9.7 HTTP Routes for Auth

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
```

### 9.8 getAuthUserId — Server-Side Auth Check

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";  // CORRECT IMPORT
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const currentUser = query({
  args: {},
  returns: v.union(v.null(), v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const protectedMutation = mutation({
  args: { data: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    // Proceed with authenticated logic
  },
});
```

### 9.9 Client-Side Auth Components

```typescript
"use client";

import { useAuthActions } from "@convex-dev/auth/react";  // CORRECT IMPORT
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

// Sign In Button (OAuth)
export function SignInButton() {
  const { signIn } = useAuthActions();
  return (
    <button onClick={() => void signIn("github")}>
      Sign in with GitHub
    </button>
  );
}

// Sign Out Button
export function SignOutButton() {
  const { signOut } = useAuthActions();
  return <button onClick={() => void signOut()}>Sign out</button>;
}

// Auth-aware UI
export function AuthAwareUI() {
  return (
    <>
      <AuthLoading>
        <p>Loading...</p>
      </AuthLoading>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <SignOutButton />
        <p>You are logged in!</p>
      </Authenticated>
    </>
  );
}
```

### 9.10 Password/Email Sign In Form (Complete)

```typescript
"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function PasswordSignInForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("flow", mode);  // CRITICAL: Set signIn or signUp flow

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
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        disabled={isLoading}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        disabled={isLoading}
        minLength={8}  // Match server validation
      />

      {mode === "signUp" && (
        <p style={{ fontSize: "12px", color: "gray" }}>
          Min 8 characters, at least 1 number
        </p>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : mode === "signIn" ? "Sign In" : "Sign Up"}
      </button>

      <p>
        {mode === "signIn" ? (
          <>Don't have an account? <button type="button" onClick={() => setMode("signUp")}>Sign up</button></>
        ) : (
          <>Already have an account? <button type="button" onClick={() => setMode("signIn")}>Sign in</button></>
        )}
      </p>
    </form>
  );
}
```

**Key Points:**
- `formData.set("flow", "signUp")` for registration
- `formData.set("flow", "signIn")` for login
- Password validation happens server-side based on `validatePasswordRequirements`

### 9.11 Common Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing environment variable JWT_PRIVATE_KEY` | No JWT key set | Generate and set JWT_PRIVATE_KEY in Convex Dashboard |
| `"pkcs8" must be PKCS#8 formatted string` | Wrong key format | Use `openssl genpkey` not random base64 |
| `PrivateKeyInfo algorithm is not rsaEncryption` | Wrong algorithm | Use RSA, not Ed25519 or EC |
| `No auth provider found matching the given token` | Missing config | Create `auth.config.ts` and/or set JWKS |
| `Invalid password` | Default validation failed | Password needs 8+ chars and 1+ number |
| `Account already exists` | Email registered | Use "signIn" flow, not "signUp" |
| `InvalidAccountId` | Account not found | Use "signUp" flow to create account first |

### 9.12 Authentication Setup Checklist

```
□ npm install @convex-dev/auth @auth/core@0.37.0
□ Generated RSA key pair with OpenSSL
□ Generated JWKS from public key
□ Set SITE_URL in Convex Dashboard
□ Set JWT_PRIVATE_KEY in Convex Dashboard (with \n for newlines)
□ Set JWKS in Convex Dashboard
□ Created convex/schema.ts with ...authTables
□ Created convex/auth.ts with Password provider
□ Created convex/auth.config.ts with provider config
□ Created convex/http.ts with auth.addHttpRoutes(http)
□ Used ConvexAuthProvider in app (not ConvexProvider)
□ Tested sign up with new email
□ Tested sign in with existing email
```

---

## 10. File Storage (Complete)

### Generate Upload URL

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
```

### Save File Reference

```typescript
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      uploadedAt: Date.now(),
    });
  },
});
```

### Get File URL

```typescript
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

### Get File Metadata

**⚠️ `ctx.storage.getMetadata()` is DEPRECATED — Use system table instead:**

```typescript
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    // Query the _storage system table
    return await ctx.db.system.get(args.storageId);
    // Returns: { _id, _creationTime, sha256, size, contentType }
  },
});
```

### Delete File

```typescript
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
```

### Store Blob in Action

```typescript
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const storeFromUrl = action({
  args: { url: v.string() },
  returns: v.id("_storage"),
  handler: async (ctx, args) => {
    const response = await fetch(args.url);
    const blob = await response.blob();
    
    // Storage accepts Blob objects
    const storageId = await ctx.storage.store(blob);
    
    // Save reference via mutation
    await ctx.runMutation(internal.files.saveStorageId, { storageId });
    
    return storageId;
  },
});
```

### Client Upload Component

```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: POST file to upload URL
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Step 3: Save reference in database
      await saveFile({
        storageId,
        fileName: file.name,
        fileType: file.type,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        disabled={isUploading}
      />
      {isUploading && <span>Uploading...</span>}
    </div>
  );
}
```

---

## 11. Scheduled Functions & Crons

### Cron Jobs

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every minute
crons.interval("job name", { minutes: 1 }, internal.module.function);

// Run hourly at minute 30
crons.hourly("job name", { minuteUTC: 30 }, internal.module.function);

// Run daily at 5:30 PM UTC
crons.daily("job name", { hourUTC: 17, minuteUTC: 30 }, internal.module.function);

// Run weekly on Tuesday at 5:30 PM UTC
crons.weekly("job name", { dayOfWeek: "Tuesday", hourUTC: 17, minuteUTC: 30 }, internal.module.function);

// Run monthly on the 1st at 4 PM UTC
crons.monthly("job name", { day: 1, hourUTC: 16, minuteUTC: 0 }, internal.module.function);

// Cron expression (every Monday at 9 AM)
crons.cron("job name", "0 9 * * 1", internal.module.function);

// With arguments
crons.interval("cleanup", { hours: 1 }, internal.maintenance.cleanup, { maxAge: 86400000 });

export default crons;
```

### Schedule from Functions

```typescript
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const scheduleReminder = mutation({
  args: {
    taskId: v.id("tasks"),
    delayMs: v.number(),
  },
  returns: v.id("_scheduled_functions"),
  handler: async (ctx, args) => {
    // Schedule to run after delay
    const scheduledId = await ctx.scheduler.runAfter(
      args.delayMs,
      internal.notifications.sendReminder,
      { taskId: args.taskId }
    );
    return scheduledId;
  },
});

export const scheduleAtTime = mutation({
  args: {
    taskId: v.id("tasks"),
    timestamp: v.number(),  // Unix timestamp in ms
  },
  returns: v.id("_scheduled_functions"),
  handler: async (ctx, args) => {
    // Schedule to run at specific time
    return await ctx.scheduler.runAt(
      args.timestamp,
      internal.notifications.sendReminder,
      { taskId: args.taskId }
    );
  },
});

export const cancelScheduled = mutation({
  args: { scheduledId: v.id("_scheduled_functions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.scheduler.cancel(args.scheduledId);
  },
});
```

---

## 12. HTTP Endpoints

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// Basic GET endpoint
http.route({
  path: "/api/hello",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response("Hello World", { status: 200 });
  }),
});

// POST endpoint with JSON body
http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    // Call a mutation
    await ctx.runMutation(api.events.record, { data: body });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Path prefix (matches /users/*, /users/123, etc.)
http.route({
  pathPrefix: "/users/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.pathname.replace("/users/", "");
    
    return new Response(JSON.stringify({ userId }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// With CORS headers
http.route({
  path: "/api/data",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const data = await ctx.runQuery(api.data.list);
    
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// OPTIONS for CORS preflight
http.route({
  path: "/api/data",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
```

**Supported HTTP methods:** `"GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH"`

---

## 13. Real-Time Features

### Automatic Real-Time (useQuery)

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveTaskCount() {
  // This AUTOMATICALLY updates when tasks change
  const tasks = useQuery(api.tasks.list);
  
  return <span>Tasks: {tasks?.length ?? "..."}</span>;
}
```

### Presence / Live Cursors

```typescript
// convex/schema.ts
presence: defineTable({
  documentId: v.string(),
  odcumentId: v.id("users"),
  cursor: v.object({ x: v.number(), y: v.number() }),
  updatedAt: v.number(),
})
  .index("by_documentId", ["documentId"])
  .index("by_updatedAt", ["updatedAt"]),

// convex/presence.ts
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const updateCursor = mutation({
  args: {
    documentId: v.string(),
    cursor: v.object({ x: v.number(), y: v.number() }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    
    await ctx.db.insert("presence", {
      documentId: args.documentId,
      userId,
      cursor: args.cursor,
      updatedAt: Date.now(),
    });
  },
});

export const getPresence = query({
  args: { documentId: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const thirtySecondsAgo = Date.now() - 30000;
    
    return await ctx.db
      .query("presence")
      .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
      .filter((q) => q.gt(q.field("updatedAt"), thirtySecondsAgo))
      .collect();
  },
});
```

---

## 14. Pagination (Complete)

### Server-Side Paginated Query

```typescript
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const listPaginated = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    // Additional filter args
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("tasks");
    
    if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }
    
    return await q.order("desc").paginate(args.paginationOpts);
  },
});
```

### Client-Side Pagination

```typescript
"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PaginatedList() {
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.tasks.listPaginated,
    { status: "active" },
    { initialNumItems: 10 }
  );

  // status values:
  // "LoadingFirstPage" — Initial load
  // "CanLoadMore" — More items available
  // "LoadingMore" — Loading next page
  // "Exhausted" — No more items

  return (
    <div>
      <ul>
        {results.map((task) => (
          <li key={task._id}>{task.title}</li>
        ))}
      </ul>

      {status === "LoadingFirstPage" && <p>Loading...</p>}
      {status === "LoadingMore" && <p>Loading more...</p>}
      
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(10)}>
          Load More
        </button>
      )}
      
      {status === "Exhausted" && results.length > 0 && (
        <p>No more items</p>
      )}
    </div>
  );
}
```

---

## 15. Error Handling Patterns

### Function-Level Errors

```typescript
export const createTask = mutation({
  args: { title: v.string() },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // Authorization error
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    // Validation error
    if (args.title.length < 3) {
      throw new Error("Title must be at least 3 characters");
    }
    
    // Not found error
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    return await ctx.db.insert("tasks", {
      title: args.title,
      userId,
    });
  },
});
```

### Client-Side Error Handling

```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function CreateTaskForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useMutation(api.tasks.create);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    try {
      await createTask({ title });
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <input name="title" placeholder="Task title" required />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Error Boundary (Next.js)

```typescript
// app/error.tsx
'use client'  // REQUIRED

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

---

## 16. TypeScript Types & Inference

### Generated Types

```typescript
import { Doc, Id } from "./_generated/dataModel";

// Document type
type Task = Doc<"tasks">;
// { _id: Id<"tasks">, _creationTime: number, title: string, ... }

// ID type
type TaskId = Id<"tasks">;

// Using in functions
export const getTask = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args): Promise<Task | null> => {
    return await ctx.db.get(args.taskId);
  },
});
```

### Infer Types from Validators

```typescript
import { Infer, v } from "convex/values";

const userValidator = v.object({
  name: v.string(),
  email: v.string(),
  age: v.number(),
});

// Extract TypeScript type
type User = Infer<typeof userValidator>;
// { name: string; email: string; age: number }

// Use in function
export const createUser = mutation({
  args: userValidator.fields,  // Spread validator fields
  returns: v.id("users"),
  handler: async (ctx, args: User) => {
    return await ctx.db.insert("users", args);
  },
});
```

---

## 17. AI Coding Rules (CRITICAL)

### ✅ ALWAYS DO

1. **Use new function syntax** with `args`, `returns`, and `handler`
2. **Include `returns` validator** — use `v.null()` if no return value
3. **Use `v.int64()`** for large integers (NOT `v.bigint()`)
4. **Use `v.record()`** for dynamic object keys (NOT `v.map()` or `v.set()`)
5. **Add `"use client"`** directive for components using Convex hooks
6. **Handle all states**: `undefined` (loading), `null` (not found), data
7. **Use indexes** for filtered queries (`withIndex` over `filter`)
8. **Validate all inputs** even for internal functions
9. **Use `internal`** for functions called from other server functions
10. **Use `api`** for functions called from client
11. **Await params/searchParams** in Next.js 15
12. **Await cookies()/headers()** in Next.js 15

### ❌ NEVER DO

1. **Never use `v.bigint()`** — it's deprecated (use `v.int64()`)
2. **Never use `v.map()` or `v.set()`** — they don't exist
3. **Never use `ctx.db` in actions** — use `ctx.runQuery` or `ctx.runMutation`
4. **Never add `"use node"` for `fetch()`** — it works without it
5. **Never use `ctx.storage.getMetadata()`** — deprecated, use `ctx.db.system.get()`
6. **Never skip argument validation**
7. **Never import from `_generated` in client code** — use the generated `api` object
8. **Never mix queries/mutations with "use node" in same file**
9. **Never use `ConvexAuthProvider` from `convex/react`** — it's from `@convex-dev/auth/react`
10. **Never hardcode secrets** — use environment variables
11. **Never use synchronous params/cookies/headers** in Next.js 15

### State Handling Pattern (MEMORIZE THIS)

```typescript
"use client";

export function DataComponent() {
  const data = useQuery(api.data.get);

  // Loading state (data is undefined)
  if (data === undefined) {
    return <LoadingSkeleton />;
  }

  // Not found state (data is null)
  if (data === null) {
    return <NotFound />;
  }

  // Empty state (data is empty array)
  if (Array.isArray(data) && data.length === 0) {
    return <EmptyState />;
  }

  // Success state
  return <DataDisplay data={data} />;
}
```

---

## 18. Common Patterns Library

### Loading Skeleton

```typescript
export function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}
```

### Protected Page

```typescript
"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### Optimistic Update Pattern

```typescript
"use client";

export function TaskItem({ taskId }: { taskId: Id<"tasks"> }) {
  const task = useQuery(api.tasks.getById, { taskId });
  const toggleComplete = useMutation(api.tasks.toggleComplete);

  // No need for local optimistic state — Convex updates are fast and reactive
  const handleToggle = async () => {
    await toggleComplete({ taskId });
  };

  if (!task) return null;

  return (
    <div onClick={handleToggle}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
      />
      <span>{task.title}</span>
    </div>
  );
}
```

### Nested Layout

```typescript
// app/dashboard/layout.tsx
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## 19. Deployment Guide

### Pre-Deployment Checklist

- [ ] All TypeScript errors resolved: `npm run build`
- [ ] Schema validated: `npx convex dev --once`
- [ ] All functions have argument validators
- [ ] All functions have return validators
- [ ] Authentication properly configured
- [ ] `SITE_URL` set in Convex for auth redirects

### Deploy Convex

```bash
# Deploy to production
npx convex deploy

# Deploy with build command
npx convex deploy --cmd "npm run build"

# Create preview deployment
npx convex deploy --preview-create my-branch

# Environment variables
npx convex env list
npx convex env set KEY value
npx convex env get KEY
npx convex env remove KEY
```

### Deploy to Vercel

**Option A: GitHub Integration (Recommended)**

1. Push to GitHub
2. Import at vercel.com/new
3. Set Build Command: `npx convex deploy --cmd 'npm run build'`
4. Add Environment Variables:
   - `CONVEX_DEPLOY_KEY` (Production only)
   - `NEXT_PUBLIC_CONVEX_URL` (All environments)

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel              # Preview
vercel --prod       # Production
vercel --force      # Skip cache
```

### Custom Domain DNS

**Apex domain (example.com):**
- Type: `A`
- Name: `@`
- Value: IP from Vercel dashboard

**Subdomain (www.example.com):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Runtime Configuration

Use **Serverless Functions** for Convex (not Edge):

```typescript
// Force Node.js runtime if needed
export const runtime = 'nodejs';
```

---

## 20. Production Checklist

### Security
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] All mutations have authorization checks
- [ ] Input validation on all functions
- [ ] Rate limiting on HTTP endpoints
- [ ] CORS configured properly

### Performance
- [ ] Database indexes for common queries
- [ ] Pagination for large lists
- [ ] Images optimized (next/image)
- [ ] Bundle size reasonable

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Convex logs monitored
- [ ] Vercel analytics enabled

---

## 21. Troubleshooting

### General Issues

| Issue | Solution |
|-------|----------|
| "Module not found: convex/_generated" | Run `npx convex dev` |
| `useQuery` returns `undefined` forever | Check ConvexProvider wraps component |
| "Invalid validator" | Check syntax, use `v.*` from "convex/values" |
| Types not updating | Restart `npx convex dev` |
| "use node" errors | File must ONLY contain actions |
| Next.js 15 params error | Add `await` before `params` |

### Authentication Issues (MOST COMMON)

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing environment variable JWT_PRIVATE_KEY` | Password auth needs JWT key | Generate RSA key with OpenSSL (Section 9.1), set in Convex Dashboard |
| `"pkcs8" must be PKCS#8 formatted string` | Wrong key format | Key must be PEM format from `openssl genpkey`, not random base64 |
| `PrivateKeyInfo algorithm is not rsaEncryption` | Wrong algorithm | MUST use RSA algorithm. Ed25519 and EC keys will NOT work |
| `No auth provider found matching the given token` | Missing JWKS or config | 1) Set JWKS env var, 2) Create `convex/auth.config.ts` |
| `Invalid password` | Password validation failed | Default requires 8+ chars AND 1+ number |
| `Account already exists` | Trying to sign up with existing email | Use "signIn" flow instead of "signUp" |
| `InvalidAccountId` | Trying to sign in with non-existent account | Use "signUp" flow to create account first |
| Auth not redirecting | SITE_URL wrong | Check `SITE_URL` in Convex Dashboard matches your domain exactly |
| Session not persisting | Token verification failing | Ensure JWKS matches JWT_PRIVATE_KEY (same key pair) |

### Authentication Key Generation Quick Reference

```bash
# Generate RSA private key (PKCS#8 format) - REQUIRED FORMAT
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private_key.pem

# Extract public key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# View key for copying (replace newlines with \n when pasting to Convex)
cat private_key.pem
```

**Key Format Errors to Avoid:**
- ❌ Random base64 string → Must be proper PEM key
- ❌ `openssl ecparam -genkey` (EC key) → Must use RSA
- ❌ `openssl genpkey -algorithm ed25519` (Ed25519) → Must use RSA
- ✅ `openssl genpkey -algorithm RSA` → Correct

### Debug Commands

```bash
npx convex logs              # View logs (check for auth errors here)
npx convex dashboard         # Open dashboard
npx convex env list          # List environment variables
npx convex env get JWT_PRIVATE_KEY  # Check if key is set
npx convex dev --once --debug-node-apis  # Check Node.js usage
rm -rf .convex && npx convex dev         # Reset local state
```

### Auth Debugging Checklist

```
□ SITE_URL set correctly in Convex Dashboard?
□ JWT_PRIVATE_KEY set (with \n for newlines)?
□ JWKS set (JSON format with public key)?
□ convex/auth.config.ts exists?
□ convex/http.ts has auth.addHttpRoutes(http)?
□ Using ConvexAuthProvider (not ConvexProvider)?
□ Password meets requirements (8+ chars, 1+ number)?
□ Using correct flow ("signUp" vs "signIn")?
```

---

## 22. Real-World Examples

### Complete Chat App Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),

  messages: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    body: v.string(),
  })
    .index("by_channelId", ["channelId"])
    .index("by_userId", ["userId"]),
});
```

### Complete Chat App Functions

```typescript
// convex/messages.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByChannel = query({
  args: { channelId: v.id("channels") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        return { ...message, user };
      })
    );
  },
});

export const send = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.id("users"),
    body: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    if (args.body.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      userId: args.userId,
      body: args.body,
    });
  },
});
```

---

## 23. Import Reference Cheatsheet

| What | Import From |
|------|-------------|
| query, mutation, action | `"./_generated/server"` |
| internalQuery, internalMutation, internalAction | `"./_generated/server"` |
| httpAction | `"./_generated/server"` |
| httpRouter | `"convex/server"` |
| api, internal | `"./_generated/api"` |
| v (validators) | `"convex/values"` |
| Infer | `"convex/values"` |
| defineSchema, defineTable | `"convex/server"` |
| paginationOptsValidator | `"convex/server"` |
| cronJobs | `"convex/server"` |
| ConvexProvider | `"convex/react"` |
| useQuery, useMutation, useAction | `"convex/react"` |
| usePaginatedQuery | `"convex/react"` |
| useConvex, useConvexAuth | `"convex/react"` |
| Authenticated, Unauthenticated, AuthLoading | `"convex/react"` |
| preloadQuery, fetchQuery, fetchMutation | `"convex/nextjs"` |
| ConvexAuthProvider | `"@convex-dev/auth/react"` |
| useAuthActions | `"@convex-dev/auth/react"` |
| getAuthUserId, getAuthSessionId | `"@convex-dev/auth/server"` |
| Doc, Id | `"./_generated/dataModel"` |

---

## 24. Prompt Templates for AI Agents

### New Project Bootstrap

```
Using the tech stack from the ULTIMATE reference:
- Next.js 15 App Router
- Convex for database/backend
- TypeScript
- Tailwind CSS + shadcn/ui

Bootstrap a new project with:
1. ConvexClientProvider setup
2. Root layout with provider
3. Basic schema.ts
4. Home page

Follow project structure exactly. Handle Next.js 15 breaking changes.
```

### New Feature Implementation

```
Reference the ULTIMATE context document.

Implement [FEATURE NAME] with:
- Schema: [describe tables/fields]
- Functions: [describe queries/mutations needed]
- UI: [describe components/pages]

Follow ALL Convex coding rules. Use new function syntax with validators.
Handle all states: loading, empty, error, success.
```

### Schema Design

```
Reference the ULTIMATE context document - Schema section.

Design a schema for [DOMAIN] with:
- Entities: [list entities]
- Relationships: [describe]
- Indexes needed for: [describe queries]

Follow index naming conventions. Include all validators.
```

### Debug Help

```
Reference the ULTIMATE context document - Troubleshooting section.

I'm getting this error: [ERROR MESSAGE]

Context:
- File: [filename]
- Code: [relevant code]

What's wrong and how do I fix it?
```

---

## Official Resources

- **Convex Docs**: https://docs.convex.dev
- **Convex Auth**: https://labs.convex.dev/auth
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **AI Guidelines**: https://convex.link/convex_rules.txt
- **LLMs.txt**: https://docs.convex.dev/llms.txt

---

**END OF DOCUMENT**

*This document consolidates ALL patterns from 7 previous documents plus comprehensive research verification. Every pattern is triple-verified against official documentation as of December 2025. When official docs conflict with this document, prefer the official documentation.*