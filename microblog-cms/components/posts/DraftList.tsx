"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/posts/PostCard";

interface DraftPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags?: Array<{ name: string; display_name: string }>;
}

interface DraftListProps {
  status?: "drafts" | "published";
}

export function DraftList({ status = "drafts" }: DraftListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [status]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiStatus = status === "drafts" ? "draft" : "published";
      const response = await fetch(`/api/posts?status=${apiStatus}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${status}`);
      }

      const data = await response.json();
      setPosts(data.data.data || []);
    } catch (err: any) {
      setError(err.message || `Failed to load ${status}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/posts/${postId}/edit`);
  };

  const handleDelete = async (postId: string) => {
    const isDraft = status === "drafts";
    if (!confirm(`Are you sure you want to delete this ${isDraft ? "draft" : "post"}?`)) {
      return;
    }

    try {
      setDeletingId(postId);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${isDraft ? "draft" : "post"}`);
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err: any) {
      alert(err.message || `Failed to delete ${isDraft ? "draft" : "post"}`);
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

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">
          {status === "drafts" ? "No drafts yet" : "No published posts yet"}
        </p>
        {status === "drafts" && (
          <button
            onClick={() => router.push("/posts/new")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Your First Post
          </button>
        )}
      </div>
    );
  }

  const isDraft = status === "drafts";

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="relative">
          <PostCard post={post} showExcerpt={true} />

          <div className="mt-4 flex gap-3">
            {isDraft && (
              <>
                <button
                  onClick={() => handleEdit(post.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handlePublish(post.id)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  Publish
                </button>
              </>
            )}
            {!isDraft && (
              <button
                onClick={() => router.push(`/posts/${post.id}/${post.slug}`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                View Post
              </button>
            )}
            <button
              onClick={() => handleDelete(post.id)}
              disabled={deletingId === post.id}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deletingId === post.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
