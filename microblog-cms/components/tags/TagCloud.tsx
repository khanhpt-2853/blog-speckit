"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tag {
  name: string;
  display_name: string;
  post_count: number;
}

interface TagCloudProps {
  limit?: number;
  minFontSize?: number;
  maxFontSize?: number;
}

export function TagCloud({ limit = 20, minFontSize = 12, maxFontSize = 28 }: TagCloudProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }

      const data = await response.json();
      const allTags = data.data || [];

      // Filter tags with at least 1 post and limit
      const popularTags = allTags.filter((t: Tag) => t.post_count > 0).slice(0, limit);

      setTags(popularTags);
    } catch (err: any) {
      setError(err.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const getFontSize = (postCount: number, maxCount: number) => {
    if (maxCount === 0) return minFontSize;
    const ratio = postCount / maxCount;
    return minFontSize + ratio * (maxFontSize - minFontSize);
  };

  if (loading) {
    return <div className="py-4 text-center text-gray-600">Loading tags...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-sm text-red-600">{error}</div>;
  }

  if (tags.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-600">No tags yet</div>;
  }

  const maxCount = Math.max(...tags.map((t) => t.post_count));

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {tags.map((tag) => {
        const fontSize = getFontSize(tag.post_count, maxCount);
        return (
          <Link
            key={tag.name}
            href={`/tags/${tag.name}`}
            className="transition-colors hover:text-blue-600"
            style={{ fontSize: `${fontSize}px` }}
            title={`${tag.post_count} post${tag.post_count !== 1 ? "s" : ""}`}
          >
            {tag.display_name}
          </Link>
        );
      })}
    </div>
  );
}
