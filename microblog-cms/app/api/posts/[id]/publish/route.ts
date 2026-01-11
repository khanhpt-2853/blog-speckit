import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSuccessResponse,
  unauthorizedError,
  notFoundError,
  forbiddenError,
  internalError,
} from "@/lib/utils/errors";

// POST /api/posts/[id]/publish - Publish draft post
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedError();
    }

    // Get existing post
    const { data: existingPost } = await supabase.from("posts").select("*").eq("id", id).single();

    if (!existingPost) {
      return notFoundError("Post not found");
    }

    // Check ownership
    if (existingPost.author_id !== user.id) {
      return forbiddenError("You can only publish your own posts");
    }

    // Check if already published
    if (existingPost.status === "published") {
      return forbiddenError("Post is already published");
    }

    // Publish post
    const { data: post, error: publishError } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (publishError) {
      console.error("Error publishing post:", publishError);
      return internalError("Failed to publish post");
    }

    // Fetch tags
    const { data: postTags } = await supabase
      .from("post_tags")
      .select("tags(name)")
      .eq("post_id", post.id);

    const tags = postTags?.map((pt: any) => pt.tags.name) || [];

    return createSuccessResponse({ ...post, tags });
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
