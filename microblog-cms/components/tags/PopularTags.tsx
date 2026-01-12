"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tag {
  name: string;
  display_name: string;
  post_count: number;
}

interface PopularTagsProps {
  limit?: number;
}

export function PopularTags({ limit = 10 }: PopularTagsProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        const popularTags = (data.data.data || [])
          .filter((t: Tag) => t.post_count > 0)
          .slice(0, limit);
        setTags(popularTags);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 rounded bg-gray-200"></div>
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return <p className="text-sm text-gray-600">No tags yet</p>;
  }

  return (
    <div className="space-y-2">
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={`/tags/${tag.name}`}
          className="group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
        >
          <span className="text-sm font-medium group-hover:text-blue-600">{tag.display_name}</span>
          <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500">
            {tag.post_count}
          </span>
        </Link>
      ))}
    </div>
  );
}
