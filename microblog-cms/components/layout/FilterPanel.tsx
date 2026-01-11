"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface FilterPanelProps {
  onClose?: () => void;
}

export function FilterPanel({ onClose }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") || "");

  useEffect(() => {
    setTag(searchParams.get("tag") || "");
    setDateFrom(searchParams.get("date_from") || "");
    setDateTo(searchParams.get("date_to") || "");
  }, [searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams();

    if (tag) params.set("tag", tag);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);

    router.push(`/?${params.toString()}`);
    onClose?.();
  };

  const handleClear = () => {
    setTag("");
    setDateFrom("");
    setDateTo("");
    router.push("/");
    onClose?.();
  };

  const hasActiveFilters = tag || dateFrom || dateTo;

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 lg:hidden"
            aria-label="Close filters"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Tag filter */}
        <div>
          <label htmlFor="tag-filter" className="mb-1 block text-sm font-medium text-gray-700">
            Tag
          </label>
          <input
            id="tag-filter"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., web-dev"
            className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">Enter tag name (lowercase, hyphenated)</p>
        </div>

        {/* Date from filter */}
        <div>
          <label htmlFor="date-from" className="mb-1 block text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Date to filter */}
        <div>
          <label htmlFor="date-to" className="mb-1 block text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Apply
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="flex-1 rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
