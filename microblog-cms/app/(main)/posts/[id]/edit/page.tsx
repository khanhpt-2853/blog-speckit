"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { PostEditor } from "@/components/posts/PostEditor";
import { PublishConfirmDialog } from "@/components/posts/PublishConfirmDialog";

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  tags: Array<{ name: string; display_name: string }>;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const postId = params.id as string;
  const showPublishDialog = searchParams.get("action") === "publish";

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(showPublishDialog);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/posts/${postId}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to edit this post");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error("Failed to load post");
      }

      const data = await response.json();

      if (data.data.status === "published") {
        setError("This post has been published and cannot be edited");
        return;
      }

      setPost(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { title: string; content: string; tags: string[] }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update post");
      }

      const result = await response.json();
      setPost(result.data);

      // Show success message (could use toast notification)
      alert("Post updated successfully");
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      setError(null);

      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to publish post");
      }

      const result = await response.json();
      router.push(`/posts/${result.data.id}/${result.data.slug}`);
    } catch (err: any) {
      setError(err.message);
      setIsPublishDialogOpen(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    router.push("/posts/drafts");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-gray-600">Loading post...</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
        <button
          onClick={() => router.push("/posts/drafts")}
          className="mt-4 rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Back to Drafts
        </button>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Draft</h1>
        <button
          onClick={() => setIsPublishDialogOpen(true)}
          disabled={isSubmitting}
          className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Publish
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <PostEditor
        initialTitle={post.title}
        initialContent={post.content}
        initialTags={post.tags.map((t) => t.display_name)}
        onSave={handleSave}
        onCancel={handleCancel}
        saveButtonText="Save Changes"
        isSubmitting={isSubmitting}
      />

      <PublishConfirmDialog
        isOpen={isPublishDialogOpen}
        onConfirm={handlePublish}
        onCancel={() => setIsPublishDialogOpen(false)}
        isPublishing={isPublishing}
      />
    </div>
  );
}
