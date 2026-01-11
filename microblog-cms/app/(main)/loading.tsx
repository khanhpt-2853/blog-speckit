import { LoadingSkeleton } from "@/components/ui/Loading";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,320px]">
        {/* Main content skeleton */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div className="h-9 w-48 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
          <LoadingSkeleton />
        </div>

        {/* Sidebar skeleton */}
        <div className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div className="animate-pulse rounded-lg border bg-white p-6">
              <div className="mb-4 h-6 w-24 rounded bg-gray-200"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 rounded bg-gray-200"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
