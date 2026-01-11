import Link from "next/link";

interface TagBadgeProps {
  tag: {
    name: string;
    display_name: string;
  };
  variant?: "default" | "large";
  clickable?: boolean;
}

export function TagBadge({ tag, variant = "default", clickable = true }: TagBadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full font-medium transition-colors";
  const variantClasses = {
    default: "px-3 py-1 text-xs",
    large: "px-4 py-2 text-sm",
  };

  const colorClasses = clickable
    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
    : "bg-gray-100 text-gray-700";

  const className = `${baseClasses} ${variantClasses[variant]} ${colorClasses}`;

  if (!clickable) {
    return <span className={className}>{tag.display_name}</span>;
  }

  return (
    <Link href={`/tags/${tag.name}`} className={className}>
      {tag.display_name}
    </Link>
  );
}
