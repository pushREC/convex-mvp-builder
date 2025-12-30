/**
 * =============================================================================
 * CONVEX SCHEMA DEFINITION
 * =============================================================================
 *
 * This file defines your database schema. Convex uses TypeScript for schema
 * definitions, which provides full type safety across your entire application.
 *
 * IMPORTANT: After any schema changes, run `npx convex dev` to regenerate types.
 *
 * Documentation: See convex-docs.md Section 4 (Schema & Validators)
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  /**
   * ---------------------------------------------------------------------------
   * AUTH TABLES (REQUIRED)
   * ---------------------------------------------------------------------------
   * These tables are required for @convex-dev/auth to work. They include:
   *   - users: User profiles
   *   - sessions: Active login sessions
   *   - accounts: OAuth/credential accounts linked to users
   *   - verificationTokens: Email verification tokens
   *   - authenticators: WebAuthn/passkey authenticators
   *
   * DO NOT remove this spread operator unless you're removing authentication.
   */
  ...authTables,

  /**
   * ---------------------------------------------------------------------------
   * EXAMPLE: TASKS TABLE
   * ---------------------------------------------------------------------------
   * This is an EXAMPLE table demonstrating common patterns. You can:
   *   - Use this as a reference for creating your own tables
   *   - Modify it for your use case
   *   - Delete it entirely when building your own app
   *
   * PATTERNS DEMONSTRATED:
   *   1. Required fields: title, completed, userId, priority, createdAt
   *   2. Optional fields: description, updatedAt (using v.optional())
   *   3. User ownership: userId links to the users table
   *   4. Union types: priority with literal values
   *   5. Timestamps: createdAt/updatedAt as Unix timestamps
   *   6. Indexes: for efficient queries
   */
  tasks: defineTable({
    // Required string field
    title: v.string(),

    // Optional string field - use v.optional() wrapper
    description: v.optional(v.string()),

    // Boolean field for task completion status
    completed: v.boolean(),

    // Foreign key linking to users table
    // v.id("tableName") creates a typed reference
    userId: v.id("users"),

    // Union type with literal values - creates an enum-like field
    // Only "low", "medium", or "high" are valid values
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),

    // Timestamps stored as Unix milliseconds (Date.now())
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    /**
     * INDEX: by_userId
     * Purpose: Query all tasks for a specific user efficiently
     * Usage: .withIndex("by_userId", q => q.eq("userId", userId))
     *
     * WHY: Without an index, Convex would scan ALL tasks to find a user's tasks.
     * With this index, it directly looks up tasks by userId = O(log n) vs O(n).
     */
    .index("by_userId", ["userId"])

    /**
     * INDEX: by_userId_and_completed
     * Purpose: Query a user's tasks filtered by completion status
     * Usage: .withIndex("by_userId_and_completed", q => q.eq("userId", userId).eq("completed", false))
     *
     * WHY: Compound indexes allow filtering on multiple fields efficiently.
     * Order matters: userId first (for the primary filter), then completed.
     */
    .index("by_userId_and_completed", ["userId", "completed"]),

  /**
   * ---------------------------------------------------------------------------
   * ADD YOUR OWN TABLES BELOW
   * ---------------------------------------------------------------------------
   *
   * Example: A products table for an e-commerce app
   *
   * products: defineTable({
   *   name: v.string(),
   *   price: v.number(),
   *   description: v.optional(v.string()),
   *   category: v.string(),
   *   inStock: v.boolean(),
   *   sellerId: v.id("users"),
   *   images: v.array(v.string()),
   *   createdAt: v.number(),
   * })
   *   .index("by_sellerId", ["sellerId"])
   *   .index("by_category", ["category"])
   *   .searchIndex("search_name", { searchField: "name" }),
   *
   * VALIDATOR REFERENCE:
   *   v.string()                    - String
   *   v.number()                    - Number (int or float)
   *   v.boolean()                   - Boolean
   *   v.int64()                     - 64-bit integer
   *   v.id("tableName")             - Document ID reference
   *   v.null()                      - Null value
   *   v.array(v.string())           - Array of strings
   *   v.object({ key: v.string() }) - Nested object
   *   v.optional(v.string())        - Optional field
   *   v.union(v.string(), v.null()) - Union type
   *   v.literal("value")            - Exact string literal
   *   v.any()                       - Any type (avoid if possible)
   *   v.record(v.string(), v.number()) - Object with string keys, number values
   */
});
