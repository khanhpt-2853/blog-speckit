import { LoadingSkeleton } from "@/components/ui/Loading";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-10 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>

      <div className="animate-pulse rounded-lg border bg-white p-6">
        <div className="mb-4 h-8 w-3/4 rounded bg-gray-200"></div>
        <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
        <div className="mb-2 h-4 w-5/6 rounded bg-gray-200"></div>
        <div className="h-4 w-4/6 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
