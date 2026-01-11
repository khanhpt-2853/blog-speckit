import { formatDistanceToNow } from "date-fns";

interface CommentCardProps {
  comment: {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
    status: string;
  };
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{comment.author_name}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        {comment.status === "pending" && (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            Pending
          </span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
    </div>
  );
}
