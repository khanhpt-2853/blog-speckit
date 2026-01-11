import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSuccessResponse,
  unauthorizedError,
  validationError,
  internalError,
  notFoundError,
} from "@/lib/utils/errors";
import { sendCommentApprovedNotification } from "@/lib/email/send-notification";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/comments/[id]/moderate - Moderate a comment (moderator only)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedError();
    }

    // TODO: Check if user is a moderator (for now, any authenticated user can moderate)
    // In production, you should check user role from database or JWT claims

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["approved", "rejected", "flagged"];
    if (!status || !validStatuses.includes(status)) {
      return validationError("Invalid status. Must be: approved, rejected, or flagged");
    }

    // Get the comment
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("*, posts(id, title, author_id)")
      .eq("id", commentId)
      .single();

    if (commentError || !comment) {
      return notFoundError("Comment not found");
    }

    // Update comment status
    const { data: updatedComment, error: updateError } = await supabase
      .from("comments")
      .update({
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      })
      .eq("id", commentId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating comment:", updateError);
      return internalError("Failed to update comment");
    }

    // Send email notification if comment was approved
    if (status === "approved" && comment.posts) {
      try {
        // Get post author's email
        const { data: author } = await supabase.auth.admin.getUserById(comment.posts.author_id);

        if (author?.user?.email) {
          await sendCommentApprovedNotification({
            to: author.user.email,
            postTitle: comment.posts.title,
            postId: comment.posts.id,
            commentAuthor: comment.author_name,
            commentContent: comment.content,
          });
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the request if email fails
      }
    }

    return createSuccessResponse(updatedComment);
  } catch (error) {
    console.error("Unexpected error:", error);
    return internalError();
  }
}
