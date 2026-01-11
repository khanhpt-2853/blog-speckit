"use client";

interface PublishConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPublishing?: boolean;
}

export function PublishConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isPublishing = false,
}: PublishConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
          onClick={!isPublishing ? onCancel : undefined}
        />

        {/* Dialog */}
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-center text-lg font-semibold">Publish Post?</h3>

            <p className="text-center text-sm text-gray-600">
              Once published, this post cannot be edited or unpublished. Make sure everything is
              correct before proceeding.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPublishing}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPublishing}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPublishing ? "Publishing..." : "Confirm Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
