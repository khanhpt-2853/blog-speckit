"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  initialUserLiked?: boolean;
}

export function LikeButton({
  postId,
  initialLikeCount = 0,
  initialUserLiked = false,
}: LikeButtonProps) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial like state
    const fetchLikeState = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/likes`);
        if (response.ok) {
          const data = await response.json();
          setLikeCount(data.data.like_count);
          setUserLiked(data.data.user_liked);
        }
      } catch (err) {
        console.error("Error fetching like state:", err);
      }
    };

    fetchLikeState();
  }, [postId]);

  const handleLike = async () => {
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    // Optimistic update
    const previousLikeCount = likeCount;
    const previousUserLiked = userLiked;
    setUserLiked(!userLiked);
    setLikeCount(userLiked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id: postId }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Revert optimistic update on error
        setUserLiked(previousUserLiked);
        setLikeCount(previousLikeCount);

        if (response.status === 401) {
          setError("Please sign in to like posts");
          router.push("/login");
        } else if (response.status === 429) {
          setError("Too many requests. Please try again later.");
        } else {
          setError(result.error?.message || "Failed to update like");
        }
        return;
      }

      // Update with server response
      setUserLiked(result.data.liked);
      setLikeCount(result.data.like_count);
    } catch (err) {
      // Revert optimistic update on error
      setUserLiked(previousUserLiked);
      setLikeCount(previousLikeCount);
      setError("Network error. Please try again.");
      console.error("Error liking post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex min-h-11 min-w-11 items-center gap-2 rounded-lg border px-4 py-2 transition-all ${
          userLiked
            ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-gray-300 hover:border-red-500 hover:bg-red-50"
        } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        aria-label={userLiked ? "Unlike post" : "Like post"}
      >
        <svg
          className={`h-5 w-5 transition-transform ${userLiked ? "scale-110" : ""}`}
          fill={userLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">{likeCount}</span>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
