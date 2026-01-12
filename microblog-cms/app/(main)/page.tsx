import { PostCard } from "@/components/posts/PostCard";
import { Pagination } from "@/components/ui/Pagination";
import { Sidebar } from "@/components/layout/Sidebar";
import { HamburgerMenu } from "@/components/layout/HamburgerMenu";
import { EmptyState, NoPostsIcon, NoResultsIcon } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { UserProfileCard } from "@/components/layout/UserProfileCard";

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

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          {tag ? `Posts tagged with "${tag}"` : "Discover Stories"}
        </h1>
        <p className="mt-2 text-gray-600">
          {tag
            ? `Exploring posts with this tag`
            : "Explore the latest articles and insights from our community"}
        </p>
      </div>

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[300px_1fr_300px]">
        {/* Left Column - Filters & Tags */}
        <aside className="order-2 lg:order-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters & Tags</h2>
            <Sidebar showFilters />
          </div>
        </aside>

        {/* Center Column - Posts List */}
        <main className="order-1 min-w-0 lg:order-2">
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
        </main>

        {/* Right Column - User Info */}
        <aside className="order-3">
          <div className="space-y-6 lg:sticky lg:top-24">
            <UserProfileCard user={user} />

            {/* Additional Info Card */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
              <h3 className="mb-2 font-semibold text-gray-900">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use tags to organize posts</li>
                <li>• Write in Markdown format</li>
                <li>• Comments need approval</li>
                <li>• Like posts you enjoy</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Hamburger Menu */}
      <HamburgerMenu />
    </div>
  );
}
