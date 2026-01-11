import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit/limiter";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  createSuccessResponse,
  unauthorizedError,
  validationError,
  rateLimitError,
  internalError,
  notFoundError,
} from "@/lib/utils/errors";

// Comment rate limiter: 30 comments per hour
const commentLimiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(30, "1 h"),
        analytics: true,
      })
    : null;

// POST /api/comments - Create a pending comment
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
    if (commentLimiter) {
      const { success: rateLimitOk, reset } = await checkRateLimit(commentLimiter, user.id);
      if (!rateLimitOk) {
        return rateLimitError(Math.floor((reset - Date.now()) / 1000));
      }
    }

    // Parse request body
    const body = await request.json();
    const { post_id, content, author_name } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    if (!post_id) {
      errors.post_id = ["Post ID is required"];
    }
    if (!content || content.trim().length === 0) {
      errors.content = ["Comment content is required"];
    } else if (content.length > 2000) {
      errors.content = ["Comment must be 2000 characters or less"];
    }

    if (!author_name || author_name.trim().length === 0) {
      errors.author_name = ["Author name is required"];
    } else if (author_name.length > 100) {
      errors.author_name = ["Author name must be 100 characters or less"];
    }

    if (Object.keys(errors).length > 0) {
      return validationError("Validation failed", errors);
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

    // Create comment with pending status
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id,
        user_id: user.id,
        author_name: author_name.trim(),
        content: content.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      return internalError("Failed to create comment");
    }

    return createSuccessResponse(comment);
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}

// GET /api/comments - Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const postId = searchParams.get("post_id");
    const status = searchParams.get("status"); // 'pending', 'approved', 'rejected', 'flagged'

    if (!postId) {
      return validationError("post_id query parameter is required");
    }

    // Check if user is authenticated (for moderators)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    // Non-authenticated or regular users only see approved comments
    if (!user) {
      query = query.eq("status", "approved");
    } else if (status) {
      // Authenticated users can filter by status if provided
      query = query.eq("status", status);
    } else {
      // Default: show approved comments
      query = query.eq("status", "approved");
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error("Error fetching comments:", error);
      return internalError("Failed to fetch comments");
    }

    return createSuccessResponse(comments || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
