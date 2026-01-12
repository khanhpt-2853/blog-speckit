import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSuccessResponse, internalError, notFoundError } from "@/lib/utils/errors";

// GET /api/tags/[tag]/posts - Get all posts for a specific tag
export async function GET(request: NextRequest, { params }: { params: Promise<{ tag: string }> }) {
  try {
    const { tag } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "10"), 50);

    // Verify tag exists
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id, name, display_name")
      .eq("name", tag)
      .single();

    if (tagError || !tagData) {
      return notFoundError("Tag not found");
    }

    // Get post IDs for this tag (only published posts)
    const { data: postTags, error: postTagsError } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagData.id);

    if (postTagsError) {
      console.error("Error fetching post tags:", postTagsError);
      return internalError("Failed to fetch posts for tag");
    }

    const postIds = postTags?.map((pt) => pt.post_id) || [];

    if (postIds.length === 0) {
      return createSuccessResponse(
        {
          tag: tagData,
          data: [],
          meta: {
            page,
            per_page: perPage,
            total: 0,
            total_pages: 0,
          },
        },
        undefined
      );
    }

    // Fetch published posts with pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const {
      data: posts,
      error: postsError,
      count,
    } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .in("id", postIds)
      .order("published_at", { ascending: false })
      .range(from, to);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return internalError("Failed to fetch posts");
    }

    // Fetch tags for each post
    const postsWithTags = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: postTags } = await supabase
          .from("post_tags")
          .select("tags(name, display_name)")
          .eq("post_id", post.id);

        return {
          ...post,
          tags: postTags?.map((pt: any) => pt.tags).filter(Boolean) || [],
        };
      })
    );

    const totalPages = count ? Math.ceil(count / perPage) : 0;

    return createSuccessResponse(
      {
        tag: tagData,
        data: postsWithTags,
        meta: {
          page,
          per_page: perPage,
          total: count || 0,
          total_pages: totalPages,
        },
      },
      undefined
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
