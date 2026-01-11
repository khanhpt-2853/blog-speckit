import { createClient } from "@/lib/supabase/server";
import { ModerationQueue } from "@/components/moderation/ModerationQueue";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getPendingComments() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/moderation/comments?status=pending`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return { data: [], meta: { total: 0 } };
  }

  const result = await response.json();
  return result.data;
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

  const result = await getPendingComments();
  const comments = result.data || [];

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
