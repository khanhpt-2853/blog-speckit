import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}

      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-gray-600">{description}</p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// Icon components for common empty states
export function NoPostsIcon() {
  return (
    <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export function NoResultsIcon() {
  return (
    <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
