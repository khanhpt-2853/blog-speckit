export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-9 w-64 rounded bg-gray-200"></div>
        <div className="mt-2 h-4 w-48 rounded bg-gray-200"></div>
      </div>

      <div className="mb-6 h-12 animate-pulse rounded-lg bg-gray-200"></div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-white p-6">
            <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
