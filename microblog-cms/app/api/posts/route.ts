import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, postLimiter } from "@/lib/rate-limit/limiter";
import { generateSlug } from "@/lib/utils/slugify";
import { normalizeTags } from "@/lib/utils/tags";
import {
  createSuccessResponse,
  unauthorizedError,
  validationError,
  rateLimitError,
  internalError,
} from "@/lib/utils/errors";

// POST /api/posts - Create draft post
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
    const { success: rateLimitOk, reset } = await checkRateLimit(postLimiter, user.id);
    if (!rateLimitOk) {
      return rateLimitError(Math.floor((reset - Date.now()) / 1000));
    }

    // Parse request body
    const body = await request.json();
    const { title, content, tags = [] } = body;

    // Validate input
    const errors: Record<string, string[]> = {};
    if (!title || title.trim().length === 0) {
      errors.title = ["Title is required"];
    } else if (title.length > 200) {
      errors.title = ["Title must be 200 characters or less"];
    }

    if (!content || content.trim().length === 0) {
      errors.content = ["Content is required"];
    } else if (content.length > 50000) {
      errors.content = ["Content must be 50,000 characters or less"];
    }

    if (tags.length > 5) {
      errors.tags = ["Maximum 5 tags allowed"];
    }

    if (Object.keys(errors).length > 0) {
      return validationError("Validation failed", errors);
    }

    // Generate slug
    const slug = generateSlug(title);

    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        status: "draft",
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      return internalError("Failed to create post");
    }

    // Handle tags if provided
    let postTags: string[] = [];
    if (tags.length > 0) {
      try {
        const normalizedTags = normalizeTags(tags);
        postTags = normalizedTags;

        // Insert or get existing tags
        for (const tagName of normalizedTags) {
          const displayName =
            tags.find((t: string) => normalizeTags([t])[0] === tagName) || tagName;

          // Upsert tag
          const { data: tag } = await supabase
            .from("tags")
            .upsert(
              { name: tagName, display_name: displayName },
              { onConflict: "name", ignoreDuplicates: false }
            )
            .select()
            .single();

          if (tag) {
            // Link post to tag
            await supabase.from("post_tags").insert({
              post_id: post.id,
              tag_id: tag.id,
            });
          }
        }
      } catch (tagError) {
        console.error("Error processing tags:", tagError);
        // Continue without tags - post already created
      }
    }

    return createSuccessResponse(
      {
        ...post,
        tags: postTags,
      },
      undefined
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}

// GET /api/posts - Get published posts with pagination (or drafts for authenticated users)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "10"), 50);
    const tag = searchParams.get("tag");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const status = searchParams.get("status"); // 'draft' or 'published'

    // If requesting drafts or user's published posts, user must be authenticated
    if (status === "draft" || status === "published") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return unauthorizedError();
      }

      // Fetch only authenticated user's posts (drafts or published)
      let query = supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("status", status)
        .eq("author_id", user.id)
        .order(status === "draft" ? "updated_at" : "published_at", { ascending: false });

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data: posts, error, count } = await query;

      if (error) {
        console.error(`Error fetching ${status} posts:`, error);
        return internalError(`Failed to fetch ${status} posts`);
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
            tags: postTags?.map((pt) => pt.tags).filter(Boolean) || [],
          };
        })
      );

      const totalPages = count ? Math.ceil(count / perPage) : 0;

      return createSuccessResponse(
        {
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
    }

    // Default: fetch published posts
    let query = supabase
      .from("posts")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });

    // Apply filters
    if (dateFrom) {
      query = query.gte("published_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("published_at", dateTo);
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return internalError("Failed to fetch posts");
    }

    // Filter by tag if specified
    let filteredPosts = posts || [];
    if (tag) {
      const { data: taggedPosts } = await supabase
        .from("post_tags")
        .select("post_id, tags!inner(name)")
        .eq("tags.name", tag);

      const taggedPostIds = new Set(taggedPosts?.map((pt) => pt.post_id) || []);
      filteredPosts = filteredPosts.filter((p) => taggedPostIds.has(p.id));
    }

    // Fetch tags for each post
    const postsWithTags = await Promise.all(
      filteredPosts.map(async (post) => {
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

    const totalPages = Math.ceil((count || 0) / perPage);

    return createSuccessResponse(postsWithTags, {
      page,
      per_page: perPage,
      total: count || 0,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
