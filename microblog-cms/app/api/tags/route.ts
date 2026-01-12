import { createClient } from "@/lib/supabase/server";
import { createSuccessResponse, internalError } from "@/lib/utils/errors";

// GET /api/tags - Get all tags with post counts
export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all tags with their post counts
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name, display_name")
      .order("name");

    if (error) {
      console.error("Error fetching tags:", error);
      return internalError("Failed to fetch tags");
    }

    // Get post counts for each tag (only published posts)
    const tagsWithCounts = await Promise.all(
      (tags || []).map(async (tag) => {
        // First get all published post IDs
        const { data: publishedPosts } = await supabase
          .from("posts")
          .select("id")
          .eq("status", "published");

        const publishedPostIds = publishedPosts?.map((p) => p.id) || [];

        // Then count post_tags for this tag that reference published posts
        const { count } = await supabase
          .from("post_tags")
          .select("*", { count: "exact", head: true })
          .eq("tag_id", tag.id)
          .in("post_id", publishedPostIds);

        return {
          name: tag.name,
          display_name: tag.display_name,
          post_count: count || 0,
        };
      })
    );

    // Sort by post count descending
    tagsWithCounts.sort((a, b) => b.post_count - a.post_count);

    return createSuccessResponse(
      {
        data: tagsWithCounts,
        meta: {
          total: tagsWithCounts.length,
        },
      },
      undefined
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
