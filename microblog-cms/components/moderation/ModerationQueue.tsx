"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  status: string;
  posts: {
    id: string;
    title: string;
    slug: string;
  };
}

interface ModerationQueueProps {
  initialComments: Comment[];
  onUpdate?: () => void;
}

export function ModerationQueue({ initialComments, onUpdate }: ModerationQueueProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleModerate = async (commentId: string, status: "approved" | "rejected" | "flagged") => {
    setLoading(commentId);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}/moderate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || "Failed to moderate comment");
      }

      // Remove comment from list
      setComments(comments.filter((c) => c.id !== commentId));
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to moderate comment");
      console.error("Error moderating comment:", err);
    } finally {
      setLoading(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold">All caught up!</h3>
        <p className="text-gray-600">No pending comments to moderate.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="rounded-lg border bg-white p-6">
          <div className="mb-4">
            <Link
              href={`/posts/${comment.posts.id}/${comment.posts.slug}`}
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              {comment.posts.title}
            </Link>
          </div>

          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-medium text-gray-900">{comment.author_name}</p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleModerate(comment.id, "approved")}
              disabled={loading === comment.id}
              className="min-h-11 flex-1 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading === comment.id ? "Processing..." : "✓ Approve"}
            </button>
            <button
              onClick={() => handleModerate(comment.id, "rejected")}
              disabled={loading === comment.id}
              className="min-h-11 flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading === comment.id ? "Processing..." : "✗ Reject"}
            </button>
            <button
              onClick={() => handleModerate(comment.id, "flagged")}
              disabled={loading === comment.id}
              className="min-h-11 rounded-lg border border-yellow-600 px-4 py-2 text-yellow-600 transition-colors hover:bg-yellow-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {loading === comment.id ? "Processing..." : "⚠ Flag"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
