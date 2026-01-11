import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSuccessResponse, unauthorizedError, internalError } from "@/lib/utils/errors";

// GET /api/moderation/comments - Get pending comments for moderation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedError();
    }

    // TODO: Check if user is a moderator (for now, any authenticated user can access)
    // In production, you should check user role from database or JWT claims

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "20"), 50);

    // Fetch comments with post information
    let query = supabase
      .from("comments")
      .select("*, posts(id, title, slug)", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false });

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data: comments, error, count } = await query;

    if (error) {
      console.error("Error fetching comments:", error);
      return internalError("Failed to fetch comments");
    }

    const totalPages = count ? Math.ceil(count / perPage) : 0;

    return createSuccessResponse(
      {
        data: comments || [],
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
