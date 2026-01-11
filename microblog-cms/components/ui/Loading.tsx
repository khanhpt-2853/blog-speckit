export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-blue-600 border-t-transparent`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border bg-white p-6">
          <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-5/6 rounded bg-gray-200"></div>
          <div className="h-4 w-4/6 rounded bg-gray-200"></div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
