# Agent Guardrails for Convex MVP Builder

This document defines what the autonomous agent CAN and CANNOT modify.
These rules are enforced both in this documentation and in `utils/security.py`.

---

## NEVER MODIFY (Protected Files)

These files are critical infrastructure. Modifying them will break authentication
or core functionality. The agent is BLOCKED from writing to these files.

| File | Purpose | Why Protected |
|------|---------|---------------|
| `convex/auth.ts` | Authentication configuration | Breaking this breaks all auth |
| `convex/auth.config.ts` | JWT provider config | Required for password auth |
| `convex/_generated/*` | Auto-generated types | Managed by Convex CLI |
| `app/ConvexClientProvider.tsx` | React context provider | Core infrastructure |
| `app/layout.tsx` | Root layout with providers | Contains provider wrapper |

### What happens if agent tries to modify these?

The security hook in `utils/security.py` will BLOCK the write and return an error:
```
BLOCKED: Cannot modify protected file: convex/auth.ts
```

---

## EXTEND ONLY (Follow Existing Patterns)

These files can be modified, but only to ADD content. Never remove existing definitions.

### convex/schema.ts

**DO:**
```typescript
// ADD new tables to existing schema
products: defineTable({
  name: v.string(),
  price: v.number(),
  createdBy: v.id("users"),
}).index("by_createdBy", ["createdBy"]),
```

**DON'T:**
```typescript
// NEVER remove existing tables
// NEVER remove authTables spread
// NEVER remove users table
```

### convex/http.ts

**DO:**
- Add new HTTP routes if needed for webhooks

**DON'T:**
- Remove `auth.addHttpRoutes(http)` line
- Remove existing routes

---

## SAFE TO CREATE (New Files)

The agent can freely create new files in these locations:

### Convex Functions
```
convex/*.ts (except auth.ts, auth.config.ts)
```
Examples: `convex/products.ts`, `convex/orders.ts`, `convex/analytics.ts`

### React Components
```
components/*.tsx
components/**/*.tsx
```
Examples: `components/products/ProductList.tsx`, `components/orders/OrderForm.tsx`

### App Routes
```
app/**/page.tsx
app/**/layout.tsx (except root layout.tsx)
```
Examples: `app/products/page.tsx`, `app/dashboard/page.tsx`

### Utilities
```
lib/*.ts
```
Examples: `lib/formatting.ts`, `lib/validation.ts`

---

## PATTERNS TO FOLLOW

When creating new files, reference these existing patterns:

### Database Schema Pattern
See: `convex/schema.ts`
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,  // KEEP THIS

  // Add new tables here following this pattern:
  tableName: defineTable({
    field: v.string(),
    userId: v.id("users"),  // Link to users table
  })
    .index("by_userId", ["userId"]),
});
```

### Query/Mutation Pattern
See: `convex/tasks.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

### React Component Pattern
See: `components/tasks/TaskList.tsx`
```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskList() {
  const tasks = useQuery(api.tasks.list);

  if (tasks === undefined) return <div>Loading...</div>;
  if (tasks.length === 0) return <div>No tasks yet</div>;

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

---

## VALIDATION CHECKLIST

Before committing any change, verify:

- [ ] Did NOT modify any protected files
- [ ] Schema changes only ADD tables (no removals)
- [ ] New Convex functions include `returns` validator
- [ ] React components handle loading state (undefined check)
- [ ] New components have `"use client"` if using hooks
- [ ] Imports match the patterns in `convex-docs.md`

---

## ERROR RECOVERY

If you accidentally break something:

### Auth not working
1. Check `convex/auth.ts` wasn't modified
2. Check `convex/auth.config.ts` exists
3. Verify environment variables in Convex Dashboard

### Types not generating
```bash
npx convex dev
```

### Build errors
```bash
npm run typecheck
npm run build
```

---

## Available Bash Commands

The agent runs in a security sandbox. Here's what's allowed:

### Always Allowed

**File Operations:**
- `ls`, `cat`, `head`, `tail`, `wc`, `grep`, `find`
- `cp`, `mkdir`, `touch`
- `pwd`, `cd`

**Development:**
- `npm`, `node`, `npx`
- `python`, `python3`, `pip`, `pip3`, `uv`
- `git` (all subcommands)
- `make`, `cargo`, `go`

**Utilities:**
- `curl`, `jq`
- `echo`, `printf`, `tee`
- `sort`, `uniq`, `tr`, `cut`, `sed`, `awk`
- `xargs`, `date`, `env`, `which`
- `basename`, `dirname`, `realpath`
- `test`, `[`, `true`, `false`
- `ps`, `lsof`, `sleep`, `timeout`

### Restricted (Extra Validation)

- `pkill` - Only dev processes allowed: `node`, `npm`, `npx`, `vite`, `next`, `python`, `python3`, `uvicorn`, `gunicorn`
- `chmod` - Only `+x` mode allowed (making files executable)
- `init.sh` - Only `./init.sh`, `bash init.sh`, or `sh init.sh`

### Blocked (Not Allowed)

- `rm`, `rmdir` - Prevents accidental file deletion
- `sudo`, `su` - No privilege escalation
- `wget` - Use `curl` instead
- `ssh`, `scp` - No remote access
- `dd`, `mkfs` - No disk operations

---

*This document is the single source of truth for agent guardrails.*
*See also: `utils/security.py` for programmatic enforcement.*
