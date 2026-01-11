"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Error boundary caught:", error);

    // In production, you could send this to an error tracking service like Sentry
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-4 text-3xl font-bold text-gray-900">Something Went Wrong</h2>
        <p className="mb-2 text-gray-600">
          We're sorry, but an unexpected error occurred. Our team has been notified and is working
          on a fix.
        </p>

        {error.digest && <p className="mb-8 text-sm text-gray-500">Error ID: {error.digest}</p>}

        <div className="flex flex-col gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
