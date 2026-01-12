"use client";

import { PopularTags } from "@/components/tags/PopularTags";
import { FilterPanel } from "./FilterPanel";

interface SidebarProps {
  showFilters?: boolean;
  onFilterClose?: () => void;
}

export function Sidebar({ showFilters = false, onFilterClose }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {showFilters && <FilterPanel onClose={onFilterClose} />}

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Popular Tags</h2>
        <PopularTags limit={10} />
      </div>
    </aside>
  );
}
