import { createClient } from "@/lib/supabase/server";
import { ModerationQueue } from "@/components/moderation/ModerationQueue";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getPendingComments() {
  const supabase = await createClient();

  // Fetch pending comments directly from database
  const { data: comments, error } = await supabase
    .from("comments")
    .select("*, posts(id, title, slug)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending comments:", error);
    return [];
  }

  return comments || [];
}

export default async function ModerationPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TODO: Check if user is a moderator
  // For now, any authenticated user can access

  const comments = await getPendingComments();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comment Moderation</h1>
          <p className="mt-2 text-gray-600">Review and moderate pending comments</p>
        </div>
        <Link href="/" className="rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50">
          Back to Home
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>{comments.length}</strong> comment{comments.length !== 1 ? "s" : ""} pending
          moderation
        </p>
      </div>

      <ModerationQueue initialComments={comments} />
    </div>
  );
}
