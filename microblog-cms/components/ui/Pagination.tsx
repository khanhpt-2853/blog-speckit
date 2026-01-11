import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/",
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${basePath}?${params.toString()}`;
  };

  const pages = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    // Show: 1 2 3 ... 8 9 10 (if current is near start)
    // Show: 1 ... 4 5 6 ... 10 (if current is in middle)
    // Show: 1 2 3 ... 8 9 10 (if current is near end)

    if (currentPage <= 3) {
      for (let i = 1; i <= Math.min(4, totalPages); i++) pages.push(i);
      if (totalPages > 4) pages.push(-1); // ellipsis
      if (totalPages > 5) pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      if (totalPages > 4) pages.push(-1);
      for (let i = Math.max(totalPages - 3, 2); i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push(-2); // second ellipsis
      pages.push(totalPages);
    }
  } else {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50"
          aria-label="Previous page"
        >
          ←
        </Link>
      )}

      {pages.map((page, index) => {
        if (page === -1 || page === -2) {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-4 py-2 transition-colors ${
              isActive ? "border-blue-600 bg-blue-600 text-white" : "hover:bg-gray-50"
            }`}
            aria-label={`Page ${page}`}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50"
          aria-label="Next page"
        >
          →
        </Link>
      )}
    </nav>
  );
}
