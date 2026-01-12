"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface UserProfileCardProps {
  user: User | null;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchPendingCount();
    }
  }, [user]);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch("/api/moderation/comments?status=pending&per_page=1");
      if (response.ok) {
        const result = await response.json();
        setPendingCount(result.data?.meta?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pending comments:", err);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Welcome!</h2>
        <p className="mb-4 text-sm text-gray-600">
          Join our community to share your stories and connect with others.
        </p>
        <Link
          href="/login"
          className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Profile</h2>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white">
          {user.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {user.user_metadata?.name || user.email?.split("@")[0] || "User"}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <Link
          href="/posts/drafts"
          className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          📝 My Posts
        </Link>
        <Link
          href="/posts/new"
          className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          ✍️ Write New Post
        </Link>
        <Link
          href="/moderation"
          className="flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <span>🛡️ Moderation</span>
          {pendingCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
