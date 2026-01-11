"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: string;
  onCommentSubmitted?: () => void;
}

export function CommentForm({ postId, onCommentSubmitted }: CommentFormProps) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (!authorName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (authorName.length > 100) {
      setError("Name must be 100 characters or less");
      return;
    }
    if (!content.trim()) {
      setError("Please enter your comment");
      return;
    }
    if (content.length > 2000) {
      setError("Comment must be 2000 characters or less");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          author_name: authorName.trim(),
          content: content.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to comment");
          router.push("/login");
        } else if (response.status === 429) {
          setError("Too many comments. Please try again later.");
        } else {
          setError(result.error?.message || "Failed to submit comment");
        }
        return;
      }

      // Success
      setSuccess(true);
      setAuthorName("");
      setContent("");
      onCommentSubmitted?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">Leave a Comment</h3>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-medium">✓ Comment submitted successfully!</p>
          <p className="text-sm">
            Your comment is pending moderation and will appear once approved.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div>
        <label htmlFor="author-name" className="mb-1 block text-sm font-medium text-gray-700">
          Your Name
        </label>
        <input
          id="author-name"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Enter your name"
          maxLength={100}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500">{authorName.length}/100 characters</p>
      </div>

      <div>
        <label htmlFor="comment-content" className="mb-1 block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          maxLength={2000}
          required
          disabled={isSubmitting}
          className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500">{content.length}/2000 characters</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 min-w-11 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? "Submitting..." : "Submit Comment"}
      </button>
    </form>
  );
}
