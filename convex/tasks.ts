/**
 * =============================================================================
 * EXAMPLE: TASKS CONVEX FUNCTIONS
 * =============================================================================
 *
 * This file demonstrates EXAMPLE Convex functions for a tasks CRUD application.
 * Use these patterns as a reference for building your own functions.
 *
 * PATTERNS DEMONSTRATED:
 *   1. Authentication: Using getAuthUserId() to get the current user
 *   2. Authorization: Checking if user owns the resource before operations
 *   3. Queries: Read-only operations that return data
 *   4. Mutations: Write operations that modify database
 *   5. Validators: Type-safe args and returns with v.* validators
 *   6. Index usage: Efficient queries using .withIndex()
 *   7. Error handling: Throwing errors for unauthorized/invalid operations
 *
 * TO USE AS TEMPLATE:
 *   1. Copy the patterns you need
 *   2. Replace "tasks" with your table name
 *   3. Update field names to match your schema
 *   4. Delete this file when you have your own functions
 *
 * Documentation: See convex-docs.md Section 5 (Convex Functions)
 */

import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * ---------------------------------------------------------------------------
 * QUERY: List all tasks for current user
 * ---------------------------------------------------------------------------
 *
 * PATTERNS:
 *   - Authentication check at start of handler
 *   - Returns empty array if not authenticated (graceful handling)
 *   - Uses index for efficient user-specific queries
 *   - Orders by newest first with .order("desc")
 *   - .collect() returns all matching documents as array
 *
 * USAGE (React component):
 *   const tasks = useQuery(api.tasks.list);
 *   if (tasks === undefined) return <Loading />;
 */
export const list = query({
  // No arguments required - uses auth context
  args: {},

  // Return type validator - MUST match what handler returns
  // This enables full type safety in React components
  returns: v.array(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      completed: v.boolean(),
      userId: v.id("users"),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    })
  ),

  handler: async (ctx) => {
    // AUTHENTICATION: Get current user ID from auth context
    // Returns null if user is not logged in
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      // Return empty array for unauthenticated users (graceful handling)
      // Alternative: throw new Error("Not authenticated") for strict handling
      return [];
    }

    // QUERY: Get all tasks for this user using index
    // .withIndex() uses the index defined in schema.ts for O(log n) lookup
    // .order("desc") orders by _creationTime descending (newest first)
    // .collect() returns all results as an array
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * ---------------------------------------------------------------------------
 * QUERY: Get single task by ID
 * ---------------------------------------------------------------------------
 *
 * PATTERNS:
 *   - Accepts ID parameter with v.id("tableName") validator
 *   - Returns union of document or null (for not found/unauthorized)
 *   - Authorization check: verifies user owns the task
 *   - Uses ctx.db.get() for direct ID lookup (fastest query type)
 *
 * USAGE (React component):
 *   const task = useQuery(api.tasks.getById, { taskId: "k17abc123..." });
 */
export const getById = query({
  // v.id("tasks") ensures only valid task IDs are accepted
  args: { taskId: v.id("tasks") },

  // v.union allows returning either the full object OR null
  returns: v.union(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      completed: v.boolean(),
      userId: v.id("users"),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }),
    v.null()
  ),

  handler: async (ctx, args) => {
    // AUTHENTICATION
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    // FETCH: ctx.db.get() is the fastest way to fetch by ID
    // Returns null if document doesn't exist
    const task = await ctx.db.get(args.taskId);

    // AUTHORIZATION: Verify user owns this task
    // IMPORTANT: Always check ownership before returning data
    if (!task || task.userId !== userId) {
      return null; // Don't reveal if task exists to non-owners
    }

    return task;
  },
});

/**
 * ---------------------------------------------------------------------------
 * MUTATION: Create new task
 * ---------------------------------------------------------------------------
 *
 * PATTERNS:
 *   - Validates input with args validators
 *   - Throws error if not authenticated (strict handling for writes)
 *   - Uses v.optional() for optional arguments with default values
 *   - ctx.db.insert() returns the new document ID
 *   - Sets createdAt timestamp automatically
 *
 * USAGE (React component):
 *   const createTask = useMutation(api.tasks.create);
 *   await createTask({ title: "My task" });
 */
export const create = mutation({
  args: {
    title: v.string(), // Required
    description: v.optional(v.string()), // Optional
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ), // Optional with allowed values
  },

  // Returns the new document ID
  returns: v.id("tasks"),

  handler: async (ctx, args) => {
    // AUTHENTICATION: Strict check for mutations
    // ALWAYS throw for writes to prevent unauthorized data modification
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // INPUT VALIDATION: Enforce length limits to prevent DoS
    // Convex documents have a 256KB limit; these limits are conservative
    if (args.title.length > 500) {
      throw new Error("Title must be 500 characters or less");
    }
    if (args.description && args.description.length > 5000) {
      throw new Error("Description must be 5000 characters or less");
    }

    // INSERT: Create new document with ctx.db.insert()
    // First arg: table name, Second arg: document data
    // Returns: ID of newly created document
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description, // undefined if not provided
      completed: false, // Default value
      userId, // Set owner to current user
      priority: args.priority ?? "medium", // Default to medium if not provided
      createdAt: Date.now(), // Unix timestamp in milliseconds
    });
  },
});

/**
 * ---------------------------------------------------------------------------
 * MUTATION: Update task
 * ---------------------------------------------------------------------------
 *
 * PATTERNS:
 *   - All update fields are optional (using v.optional)
 *   - Verifies document exists AND user owns it before update
 *   - Uses ctx.db.patch() for partial updates (only updates provided fields)
 *   - Filters out undefined values to avoid overwriting with undefined
 *   - Updates updatedAt timestamp on every change
 *
 * USAGE (React component):
 *   const updateTask = useMutation(api.tasks.update);
 *   await updateTask({ taskId, title: "New title" }); // Only updates title
 */
export const update = mutation({
  args: {
    taskId: v.id("tasks"), // Required: which task to update
    // All update fields are optional - only provided fields will be updated
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
  },

  // Returns null (void mutation)
  returns: v.null(),

  handler: async (ctx, args) => {
    // AUTHENTICATION
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // FETCH & AUTHORIZE
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found"); // Generic message for security
    }

    // INPUT VALIDATION: Enforce length limits
    if (args.title !== undefined && args.title.length > 500) {
      throw new Error("Title must be 500 characters or less");
    }
    if (args.description !== undefined && args.description.length > 5000) {
      throw new Error("Description must be 5000 characters or less");
    }

    // PREPARE UPDATES: Build typed update object
    // NOTE: Explicit typing preserves type safety (Object.fromEntries loses types)
    const cleanUpdates: {
      title?: string;
      description?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
    } = {};

    if (args.title !== undefined) cleanUpdates.title = args.title;
    if (args.description !== undefined) cleanUpdates.description = args.description;
    if (args.completed !== undefined) cleanUpdates.completed = args.completed;
    if (args.priority !== undefined) cleanUpdates.priority = args.priority;

    // PATCH: Update only if there are changes
    // ctx.db.patch() only updates specified fields (unlike replace)
    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(args.taskId, {
        ...cleanUpdates,
        updatedAt: Date.now(), // Always update timestamp on changes
      });
    }

    return null;
  },
});

/**
 * ---------------------------------------------------------------------------
 * MUTATION: Delete task
 * ---------------------------------------------------------------------------
 *
 * PATTERNS:
 *   - Requires document ID
 *   - Verifies ownership before deletion
 *   - Uses ctx.db.delete() to remove document
 *   - Returns null after successful deletion
 *
 * USAGE (React component):
 *   const removeTask = useMutation(api.tasks.remove);
 *   await removeTask({ taskId });
 */
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),

  handler: async (ctx, args) => {
    // AUTHENTICATION
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // FETCH & AUTHORIZE
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    // DELETE: Permanently removes document from database
    await ctx.db.delete(args.taskId);
    return null;
  },
});

/**
 * ---------------------------------------------------------------------------
 * MUTATION: Toggle task completion status
 * ---------------------------------------------------------------------------
 *
 * PATTERNS:
 *   - Convenience mutation for common operation
 *   - Reads current state, then inverts it
 *   - Single-field update with ctx.db.patch()
 *
 * USAGE (React component):
 *   const toggleComplete = useMutation(api.tasks.toggleComplete);
 *   await toggleComplete({ taskId });
 */
export const toggleComplete = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),

  handler: async (ctx, args) => {
    // AUTHENTICATION
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // FETCH & AUTHORIZE
    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    // TOGGLE: Invert the completed status
    await ctx.db.patch(args.taskId, {
      completed: !task.completed, // Flip the boolean
      updatedAt: Date.now(),
    });

    return null;
  },
});
