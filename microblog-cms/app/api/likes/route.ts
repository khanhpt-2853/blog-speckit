import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit/limiter";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  createSuccessResponse,
  unauthorizedError,
  rateLimitError,
  internalError,
  notFoundError,
} from "@/lib/utils/errors";

// Like rate limiter: 100 likes per hour
const likeLimiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(100, "1 h"),
        analytics: true,
      })
    : null;

// POST /api/likes - Toggle like/unlike on a post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedError();
    }

    // Check rate limit
    if (likeLimiter) {
      const { success: rateLimitOk, reset } = await checkRateLimit(likeLimiter, user.id);
      if (!rateLimitOk) {
        return rateLimitError(Math.floor((reset - Date.now()) / 1000));
      }
    }

    // Parse request body
    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      return createSuccessResponse({ error: "post_id is required" }, undefined);
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      return notFoundError("Post not found");
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // Unlike: Delete existing like
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("Error deleting like:", deleteError);
        return internalError("Failed to unlike post");
      }

      // Get updated like count
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post_id);

      return createSuccessResponse({
        liked: false,
        like_count: count || 0,
      });
    } else {
      // Like: Create new like
      const { error: insertError } = await supabase.from("likes").insert({
        post_id,
        user_id: user.id,
      });

      if (insertError) {
        console.error("Error creating like:", insertError);
        return internalError("Failed to like post");
      }

      // Get updated like count
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post_id);

      return createSuccessResponse({
        liked: true,
        like_count: count || 0,
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
