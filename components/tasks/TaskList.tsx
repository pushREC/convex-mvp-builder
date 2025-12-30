/**
 * =============================================================================
 * EXAMPLE: TASK LIST REACT COMPONENT
 * =============================================================================
 *
 * This component demonstrates EXAMPLE React patterns for Convex integration.
 * Use these patterns as a reference for building your own components.
 *
 * PATTERNS DEMONSTRATED:
 *   1. useQuery: Fetching data with automatic real-time updates
 *   2. useMutation: Executing write operations
 *   3. Loading states: Handling undefined (loading) state
 *   4. Error handling: Try/catch with toast notifications
 *   5. Optimistic updates: Convex handles this automatically
 *   6. Type safety: Using typed IDs from dataModel
 *
 * TO USE AS TEMPLATE:
 *   1. Copy the patterns you need
 *   2. Replace api.tasks.* with your API endpoints
 *   3. Update the Task type to match your schema
 *   4. Delete this file when you have your own components
 *
 * Documentation: See convex-docs.md Section 7 (React Hooks Reference)
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Id } from "@/convex/_generated/dataModel";

/**
 * TYPE DEFINITION
 *
 * In production, import from convex/_generated/dataModel:
 *   import { Doc } from "@/convex/_generated/dataModel";
 *   type Task = Doc<"tasks">;
 *
 * This provides automatic type inference from your schema.
 * The Id<"tableName"> type ensures type-safe document references.
 */

export function TaskList() {
  /**
   * useQuery HOOK
   *
   * - Fetches data from Convex and subscribes to real-time updates
   * - Returns `undefined` while loading (MUST handle this!)
   * - Returns the data type when loaded
   * - Automatically re-renders when data changes on the server
   * - No need for useEffect or manual refetching
   *
   * Type is inferred automatically from the Convex function's `returns` validator.
   * No manual type assertion needed - TypeScript knows the exact return type.
   */
  const tasks = useQuery(api.tasks.list);

  /**
   * useMutation HOOKS
   *
   * - Returns an async function to call the mutation
   * - Does NOT return loading/error state (handle manually)
   * - Mutations trigger automatic query re-fetches
   * - Use try/catch for error handling
   */
  const createTask = useMutation(api.tasks.create);
  const toggleComplete = useMutation(api.tasks.toggleComplete);
  const removeTask = useMutation(api.tasks.remove);

  // Local state for form input
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  /**
   * LOADING STATE HANDLING
   *
   * CRITICAL: useQuery returns `undefined` while loading.
   * You MUST check for this before accessing the data.
   *
   * Common patterns:
   *   - if (data === undefined) return <Loading />  // Full loading state
   *   - if (!data) return null                      // Silent loading
   *   - data ?? []                                  // Default to empty (use carefully)
   */
  if (tasks === undefined) {
    return <LoadingSkeleton />;
  }

  /**
   * CREATE HANDLER
   *
   * Pattern for mutation with loading state:
   *   1. Prevent default form behavior
   *   2. Validate input
   *   3. Set loading state
   *   4. Try the mutation
   *   5. Handle success (clear form)
   *   6. Handle error (show toast)
   *   7. Clear loading state in finally
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      await createTask({ title: newTaskTitle.trim() });
      setNewTaskTitle(""); // Clear form on success
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task"
      );
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * TOGGLE HANDLER
   *
   * Simpler pattern for mutations without form state:
   *   - Just try/catch for error handling
   *   - No local loading state needed (UI updates automatically)
   */
  const handleToggle = async (taskId: Id<"tasks">) => {
    try {
      await toggleComplete({ taskId });
      // No need to refetch - Convex updates queries automatically!
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task"
      );
    }
  };

  /**
   * DELETE HANDLER
   *
   * Same pattern as toggle - simple try/catch.
   * Consider adding a confirmation dialog for destructive actions.
   */
  const handleDelete = async (taskId: Id<"tasks">) => {
    try {
      await removeTask({ taskId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* CREATE FORM */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-6">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              disabled={isCreating}
            />
            <Button type="submit" disabled={isCreating || !newTaskTitle.trim()}>
              {isCreating ? "Adding..." : "Add"}
            </Button>
          </form>

          {/* EMPTY STATE - Good UX practice */}
          {tasks.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No tasks yet. Create your first task above!
            </p>
          )}

          {/* TASK LIST - Always use key prop with unique _id */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task._id} // IMPORTANT: Always use _id as key
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <input
                  type="checkbox"
                  id={`task-${task._id}`}
                  checked={task.completed}
                  onChange={() => handleToggle(task._id)}
                  aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <span
                  className={`flex-1 ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {task.priority}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
