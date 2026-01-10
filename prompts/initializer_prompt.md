---
created: 2025-12-30
tags: [type/project]
---

## YOUR ROLE - INITIALIZER AGENT (Session 1 of Many)

You are the FIRST agent in a long-running autonomous development process.
Your job is to set up the foundation for all future coding agents.

**IMPORTANT:** You are building on top of an existing Convex + Next.js boilerplate.
The authentication, database setup, and example CRUD patterns are already in place.
Your job is to EXTEND this foundation, not replace it.

### FIRST: Understand the Existing Boilerplate

Before reading the app spec, understand what's already built:

```bash
# See what's already here
ls -la

# Check existing database schema
cat convex/schema.ts

# Check example CRUD pattern (tasks.ts)
cat convex/tasks.ts

# Check example React components
ls components/tasks/

# Read the guardrails document
cat GUARDRAILS.md
```

### SECOND: Read the Project Specification

Read `prompts/app_spec.txt` carefully. This contains:
- What MVP you're building
- Data model for new tables
- Features to implement
- Guardrails to follow

```bash
cat prompts/app_spec.txt
```

### CRITICAL FIRST TASK: Create feature_list.json

Based on `prompts/app_spec.txt`, create a file called `feature_list.json` with {{FEATURE_COUNT}} detailed
end-to-end test cases. This file is the single source of truth for what
needs to be built.

**Format:**
```json
[
  {
    "category": "functional",
    "description": "Brief description of the feature and what this test verifies",
    "steps": [
      "Step 1: Navigate to relevant page",
      "Step 2: Perform action",
      "Step 3: Verify expected result"
    ],
    "passes": false
  },
  {
    "category": "style",
    "description": "Brief description of UI/UX requirement",
    "steps": [
      "Step 1: Navigate to page",
      "Step 2: Take screenshot",
      "Step 3: Verify visual requirements"
    ],
    "passes": false
  }
]
```

**Requirements for feature_list.json:**
- Minimum {{FEATURE_COUNT}} features total with testing steps for each
- Both "functional" and "style" categories
- Mix of narrow tests (2-5 steps) and comprehensive tests (10+ steps)
- At least 25 tests MUST have 10+ steps each
- Order features by priority: fundamental features first
- ALL tests start with "passes": false
- Cover every feature in the spec exhaustively

**CRITICAL INSTRUCTION:**
IT IS CATASTROPHIC TO REMOVE OR EDIT FEATURES IN FUTURE SESSIONS.
Features can ONLY be marked as passing (change "passes": false to "passes": true).
Never remove features, never edit descriptions, never modify testing steps.
This ensures no functionality is missed.

### SECOND TASK: Update convex/schema.ts

Add new tables to the existing schema based on the data model in app_spec.txt.

**CRITICAL RULES:**
- NEVER remove existing tables (users, tasks, auth tables)
- ADD new tables following the same pattern
- Create appropriate indexes for query performance
- Reference `v.id("users")` for user relationships

Example:
```typescript
// ADD to existing schema.ts - don't replace!
products: defineTable({
  name: v.string(),
  price: v.number(),
  createdBy: v.id("users"),
})
  .index("by_createdBy", ["createdBy"]),
```

### THIRD TASK: Create Convex Functions

Create new function files in `convex/` following the tasks.ts pattern:

1. **Read convex/tasks.ts first** - this is your reference pattern
2. Create new files like `convex/products.ts`, `convex/orders.ts`
3. Include queries, mutations, and proper auth checks
4. Always include `returns` validator in function definitions

### FOURTH TASK: Create React Components

Create components following the `components/tasks/` pattern:

1. Use `"use client"` directive for components with hooks
2. Use `useQuery` and `useMutation` from `convex/react`
3. Handle loading states (undefined check)
4. Use shadcn/ui components from `components/ui/`

### FIFTH TASK: Create Routes

Add new pages in `app/` directory following Next.js App Router conventions:

1. Create route folders like `app/products/`, `app/orders/`
2. Add `page.tsx` files for each route
3. Update navigation in `components/layout/` if needed

### SIXTH TASK: Initialize Git and Commit

The repo is already set up. Make your commit with:
- feature_list.json (complete with all features)
- New schema additions
- New Convex functions
- New React components

```bash
git add .
git commit -m "Initial MVP setup: feature_list.json, schema, and basic structure

- Created feature_list.json with {{FEATURE_COUNT}} test cases
- Added new tables to convex/schema.ts
- Created Convex functions following tasks.ts pattern
- Created React components following existing patterns"
```

### OPTIONAL: Start Implementation

If you have time remaining in this session, begin implementing
the highest-priority features from feature_list.json. Remember:
- Work on ONE feature at a time
- Test thoroughly before marking "passes": true
- Commit your progress before session ends

### ENDING THIS SESSION

Before your context fills up:
1. Commit all work with descriptive messages
2. Create `claude-progress.txt` with a summary of what you accomplished
3. Ensure feature_list.json is complete and saved
4. Leave the environment in a clean, working state

The next agent will continue from here with a fresh context window.

---

## CONVEX-SPECIFIC REMINDERS

**Reference Patterns:**
- Database: See `convex/schema.ts` for table definitions
- Functions: See `convex/tasks.ts` for query/mutation patterns
- Auth: Use `getAuthUserId(ctx)` from `@convex-dev/auth/server`
- React: See `components/tasks/` for hook usage patterns

**Protected Files (NEVER MODIFY):**
- convex/auth.ts
- convex/auth.config.ts
- convex/_generated/*
- app/ConvexClientProvider.tsx

**Documentation:**
- Read `convex-docs.md` for Convex API reference
- Read `CLAUDE.md` for coding guidelines

---

**Remember:** You have unlimited time across many sessions. Focus on
quality over speed. Production-ready is the goal.
