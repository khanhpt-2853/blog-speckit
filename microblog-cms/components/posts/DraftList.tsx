"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/posts/PostCard";

interface DraftPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: Array<{ name: string; display_name: string }>;
}

export function DraftList() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/posts?status=draft");

      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }

      const data = await response.json();
      setDrafts(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/posts/${postId}/edit`);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) {
      return;
    }

    try {
      setDeletingId(postId);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete draft");
      }

      setDrafts((prev) => prev.filter((draft) => draft.id !== postId));
    } catch (err: any) {
      alert(err.message || "Failed to delete draft");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = (postId: string) => {
    router.push(`/posts/${postId}/edit?action=publish`);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading drafts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">No drafts yet</p>
        <button
          onClick={() => router.push("/posts/new")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Your First Post
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {drafts.map((draft) => (
        <div key={draft.id} className="relative">
          <PostCard post={draft} showExcerpt={true} />

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleEdit(draft.id)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handlePublish(draft.id)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              Publish
            </button>
            <button
              onClick={() => handleDelete(draft.id)}
              disabled={deletingId === draft.id}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deletingId === draft.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
