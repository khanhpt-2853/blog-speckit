import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSuccessResponse, internalError, notFoundError } from "@/lib/utils/errors";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/posts/[id]/likes - Get like count and user's like status
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      return notFoundError("Post not found");
    }

    // Get like count
    const { count, error: countError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) {
      console.error("Error fetching like count:", countError);
      return internalError("Failed to fetch like count");
    }

    // Check if current user liked this post
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userLiked = false;
    if (user) {
      const { data: userLike } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      userLiked = !!userLike;
    }

    return createSuccessResponse({
      like_count: count || 0,
      user_liked: userLiked,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
