import Link from "next/link";
import { DraftList } from "@/components/posts/DraftList";

export default function DraftsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Drafts</h1>
        <Link
          href="/posts/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <DraftList />
    </div>
  );
}
