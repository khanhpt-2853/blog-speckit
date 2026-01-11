"use client";

import { useEffect, useState } from "react";
import { CommentCard } from "./CommentCard";
import { LoadingSpinner } from "@/components/ui/Loading";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  status: string;
}

interface CommentListProps {
  postId: string;
  refreshTrigger?: number;
}

export function CommentList({ postId, refreshTrigger = 0 }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/comments?post_id=${postId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const result = await response.json();
        setComments(result.data || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
