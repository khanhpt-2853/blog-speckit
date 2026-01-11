"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/posts/PostEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: { title: string; content: string; tags: string[] }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
        }

        throw new Error(errorData.error?.message || "Failed to create post");
      }

      const result = await response.json();
      router.push(`/posts/${result.data.id}/edit?success=created`);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/posts/drafts");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Post</h1>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <PostEditor
        onSave={handleSave}
        onCancel={handleCancel}
        saveButtonText="Save Draft"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
