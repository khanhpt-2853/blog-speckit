import { notFound } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";

interface Tag {
  name: string;
  display_name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  created_at: string;
  tags: Array<{ name: string; display_name: string }>;
}

async function getTagPosts(tagName: string, page: number = 1) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/tags/${tagName}/posts?page=${page}&per_page=10`, {
    cache: "no-store", // Always fetch fresh data
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || "1");

  const data = await getTagPosts(tag, page);

  if (!data) {
    notFound();
  }

  const { tag: tagData, data: posts, meta } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="mb-4 inline-block text-sm text-blue-600 hover:text-blue-700">
          ← Back to all posts
        </Link>
        <h1 className="mb-2 text-3xl font-bold">Posts tagged with "{tagData.display_name}"</h1>
        <p className="text-gray-600">
          {meta.total} post{meta.total !== 1 ? "s" : ""} found
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">No posts with this tag yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post: Post) => (
              <PostCard key={post.id} post={post} showExcerpt={true} />
            ))}
          </div>

          {meta.total_pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/tags/${tag}?page=${page - 1}`}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              <span className="rounded-lg border bg-blue-50 px-4 py-2 text-blue-600">
                Page {page} of {meta.total_pages}
              </span>
              {page < meta.total_pages && (
                <Link
                  href={`/tags/${tag}?page=${page + 1}`}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
