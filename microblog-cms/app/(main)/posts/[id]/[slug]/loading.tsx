import { LoadingSkeleton } from "@/components/ui/Loading";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-lg max-w-none animate-pulse">
        <div className="mb-8">
          <div className="mb-4 h-10 w-3/4 rounded bg-gray-200"></div>
          <div className="mb-4 h-4 w-32 rounded bg-gray-200"></div>
          <div className="mb-6 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            <div className="h-6 w-24 rounded-full bg-gray-200"></div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-8">
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-5/6 rounded bg-gray-200"></div>
          <div className="h-4 w-4/6 rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
