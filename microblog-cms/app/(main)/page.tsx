import { PostCard } from "@/components/posts/PostCard";
import { Pagination } from "@/components/ui/Pagination";
import { Sidebar } from "@/components/layout/Sidebar";
import { HamburgerMenu } from "@/components/layout/HamburgerMenu";
import { EmptyState, NoPostsIcon, NoResultsIcon } from "@/components/ui/EmptyState";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  created_at: string;
  tags: Array<{ name: string; display_name: string }>;
}

interface PageMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

async function getPublishedPosts(
  page: number = 1,
  tag?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ data: Post[]; meta: PageMeta }> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: "10",
  });

  if (tag) params.set("tag", tag);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    console.error("Error fetching posts:", response.statusText);
    return { data: [], meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } };
  }

  const result = await response.json();
  return {
    data: result.data || [],
    meta: result.meta || { page: 1, per_page: 10, total: 0, total_pages: 0 },
  };
}

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    date_from?: string;
    date_to?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const tag = params.tag;
  const dateFrom = params.date_from;
  const dateTo = params.date_to;

  const { data: posts, meta } = await getPublishedPosts(page, tag, dateFrom, dateTo);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,320px]">
        {/* Main content */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {tag ? `Posts tagged with "${tag}"` : "Latest Posts"}
            </h1>
            <Link
              href="/posts/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Write a Post
            </Link>
          </div>

          {posts.length === 0 ? (
            tag || dateFrom || dateTo ? (
              <EmptyState
                title="No posts found"
                description={`No posts match your current filters. Try adjusting your search criteria.`}
                icon={<NoResultsIcon />}
              />
            ) : (
              <EmptyState
                title="No posts yet"
                description="Be the first to share your thoughts! Click the button below to create your first post."
                actionLabel="Create First Post"
                actionHref="/posts/new"
                icon={<NoPostsIcon />}
              />
            )
          ) : (
            <>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} showExcerpt={true} />
                ))}
              </div>

              {meta.total_pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.total_pages}
                    basePath="/"
                    searchParams={{
                      ...(tag && { tag }),
                      ...(dateFrom && { date_from: dateFrom }),
                      ...(dateTo && { date_to: dateTo }),
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar - hidden on mobile, shows filters on desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <Sidebar showFilters />
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Menu */}
      <HamburgerMenu />
    </div>
  );
}
