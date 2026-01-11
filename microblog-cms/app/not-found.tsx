"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>

        <h2 className="mb-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mb-8 max-w-md text-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or
          never existed.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
