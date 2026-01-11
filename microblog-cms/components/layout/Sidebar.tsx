"use client";

import { PopularTags } from "@/components/tags/PopularTags";
import { FilterPanel } from "./FilterPanel";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SidebarProps {
  showFilters?: boolean;
  onFilterClose?: () => void;
}

export function Sidebar({ showFilters = false, onFilterClose }: SidebarProps) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth status and fetch pending comment count
    const fetchData = async () => {
      try {
        const response = await fetch("/api/moderation/comments?status=pending&per_page=1");
        if (response.ok) {
          const result = await response.json();
          setPendingCount(result.data?.meta?.total || 0);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // User not authenticated or error
        setIsAuthenticated(false);
      }
    };

    fetchData();
  }, []);

  return (
    <aside className="space-y-6">
      {showFilters && <FilterPanel onClose={onFilterClose} />}

      {isAuthenticated && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Moderation</h2>
          <Link
            href="/moderation"
            className="flex items-center justify-between rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50"
          >
            <span>Pending Comments</span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                {pendingCount}
              </span>
            )}
          </Link>
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Popular Tags</h2>
        <PopularTags limit={10} />
      </div>
    </aside>
  );
}
