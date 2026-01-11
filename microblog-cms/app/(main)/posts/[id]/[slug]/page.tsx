import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { TagBadge } from "@/components/tags/TagBadge";
import { LikeButton } from "@/components/posts/LikeButton";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  status: string;
  published_at: string;
  created_at: string;
  tags: Array<{ name: string; display_name: string }>;
}

async function getPost(postId: string): Promise<Post | null> {
  const supabase = await createClient();

  // Fetch post
  const { data: post, error } = await supabase.from("posts").select("*").eq("id", postId).single();

  if (error || !post) {
    return null;
  }

  // Check if user can view this post (published or author)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (post.status !== "published") {
    if (!user || user.id !== post.author_id) {
      return null;
    }
  }

  // Fetch tags
  const { data: postTags, error: tagsError } = await supabase
    .from("post_tags")
    .select("tags(name, display_name)")
    .eq("post_id", postId);

  if (tagsError) {
    console.error("Error fetching tags:", tagsError);
  }

  return {
    ...post,
    tags: postTags?.map((pt: any) => pt.tags as any).filter(Boolean) || [],
  };
}

/**
 * Generate metadata for post pages
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // Get first 160 characters of content as description
  const description = post.content.replace(/[#*_`]/g, "").substring(0, 160) + "...";

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const displayDate = post.published_at || post.created_at;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthor = user?.id === post.author_id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <article className="prose prose-lg max-w-none">
        <header className="not-prose mb-8">
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <time dateTime={displayDate}>
              {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
            </time>

            {post.status === "draft" && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                Draft
              </span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagBadge key={tag.name} tag={tag} />
              ))}
            </div>
          )}

          {isAuthor && post.status === "draft" && (
            <div className="mb-6 flex gap-3">
              <Link
                href={`/posts/${post.id}/edit`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Edit Draft
              </Link>
            </div>
          )}
        </header>

        <div className="border-t pt-8">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* Like Button */}
      {post.status === "published" && (
        <div className="mt-8 border-t pt-8">
          <LikeButton postId={post.id} />
        </div>
      )}

      {/* Comments Section */}
      {post.status === "published" && (
        <div className="mt-12 border-t pt-8">
          <CommentList postId={post.id} />

          <div className="mt-8">
            <CommentForm postId={post.id} />
          </div>
        </div>
      )}

      <div className="mt-12 border-t pt-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all posts
        </Link>
      </div>
    </div>
  );
}
