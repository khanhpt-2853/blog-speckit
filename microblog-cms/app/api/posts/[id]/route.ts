import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSuccessResponse,
  unauthorizedError,
  notFoundError,
  forbiddenError,
  validationError,
  internalError,
} from "@/lib/utils/errors";
import { generateSlug } from "@/lib/utils/slugify";

// GET /api/posts/[id] - Get single post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: post, error } = await supabase.from("posts").select("*").eq("id", id).single();

    if (error || !post) {
      return notFoundError("Post not found");
    }

    // Check if user can view this post
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (post.status === "draft") {
      if (!user || user.id !== post.author_id) {
        return forbiddenError("Cannot view draft posts");
      }
    }

    // Fetch tags
    const { data: postTags } = await supabase
      .from("post_tags")
      .select("tags(name, display_name)")
      .eq("post_id", post.id);

    const tags = postTags?.map((pt: any) => pt.tags.name) || [];

    return createSuccessResponse({ ...post, tags });
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}

// PATCH /api/posts/[id] - Update draft post
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      return forbiddenError("You can only edit your own posts");
    }

    // Check if draft
    if (existingPost.status !== "draft") {
      return forbiddenError("Cannot edit published posts");
    }

    // Parse request body
    const body = await request.json();
    const { title, content, tags } = body;

    // Validate
    const errors: Record<string, string[]> = {};
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        errors.title = ["Title is required"];
      } else if (title.length > 200) {
        errors.title = ["Title must be 200 characters or less"];
      }
    }

    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        errors.content = ["Content is required"];
      } else if (content.length > 50000) {
        errors.content = ["Content must be 50,000 characters or less"];
      }
    }

    if (tags !== undefined && tags.length > 5) {
      errors.tags = ["Maximum 5 tags allowed"];
    }

    if (Object.keys(errors).length > 0) {
      return validationError("Validation failed", errors);
    }

    // Update post
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updateData.title = title.trim();
      updateData.slug = generateSlug(title);
    }
    if (content !== undefined) {
      updateData.content = content.trim();
    }

    const { data: post, error: updateError } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating post:", updateError);
      return internalError("Failed to update post");
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await supabase.from("post_tags").delete().eq("post_id", id);

      // Add new tags
      if (tags.length > 0) {
        const { normalizeTags } = await import("@/lib/utils/tags");
        const normalizedTags = normalizeTags(tags);

        for (const tagName of normalizedTags) {
          const displayName = tags.find((t: string) => {
            const normalized = normalizeTags([t]);
            return normalized[0] === tagName;
          });

          const { data: tag } = await supabase
            .from("tags")
            .upsert({ name: tagName, display_name: displayName || tagName }, { onConflict: "name" })
            .select()
            .single();

          if (tag) {
            await supabase.from("post_tags").insert({
              post_id: id,
              tag_id: tag.id,
            });
          }
        }
      }
    }

    return createSuccessResponse(post);
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}

// DELETE /api/posts/[id] - Delete draft post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return forbiddenError("You can only delete your own posts");
    }

    // Check if draft
    if (existingPost.status !== "draft") {
      return forbiddenError("Cannot delete published posts");
    }

    // Delete post
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
      return internalError("Failed to delete post");
    }

    return createSuccessResponse({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
