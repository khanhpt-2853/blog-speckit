import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { TagBadge } from "@/components/tags/TagBadge";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    published_at?: string;
    created_at: string;
    tags?: Array<{ name: string; display_name: string }>;
  };
  showExcerpt?: boolean;
}

export function PostCard({ post, showExcerpt = true }: PostCardProps) {
  const excerpt = post.content.substring(0, 200) + (post.content.length > 200 ? "..." : "");
  const displayDate = post.published_at || post.created_at;

  return (
    <article className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.id}/${post.slug}`} className="group block">
        <h2 className="mb-2 text-2xl font-bold transition-colors group-hover:text-blue-600">
          {post.title}
        </h2>
      </Link>

      {showExcerpt && <p className="mb-4 line-clamp-3 text-gray-600">{excerpt}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag) => (
            <TagBadge key={tag.name} tag={tag} />
          ))}
        </div>

        <time className="text-sm text-gray-500" dateTime={displayDate}>
          {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
        </time>
      </div>
    </article>
  );
}
