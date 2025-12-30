import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      className="space-y-4 w-full max-w-md mx-auto"
    >
      {/* Screen reader announcement */}
      <span className="sr-only">Loading...</span>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2 pt-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
