"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TagInput } from "@/components/tags/TagInput";

// Dynamic import for MarkdownRenderer to reduce initial bundle size
const MarkdownRenderer = dynamic(
  () => import("@/components/markdown/MarkdownRenderer").then((mod) => mod.MarkdownRenderer),
  {
    loading: () => (
      <div className="rounded-lg border bg-gray-50 p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-600">Loading preview...</p>
      </div>
    ),
    ssr: false,
  }
);

interface PostEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  onSave: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  onCancel?: () => void;
  saveButtonText?: string;
  isSubmitting?: boolean;
}

export function PostEditor({
  initialTitle = "",
  initialContent = "",
  initialTags = [],
  onSave,
  onCancel,
  saveButtonText = "Save Draft",
  isSubmitting = false,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tagList, setTagList] = useState<string[]>(initialTags);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    if (tagList.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({ title, content, tags: tagList });
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save post" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter post title..."
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="tags" className="mb-2 block text-sm font-medium">
          Tags (comma-separated, max 5)
        </label>
        <TagInput value={tagList} onChange={setTagList} maxTags={5} disabled={isSubmitting} />
        {errors.tags && <p className="mt-1 text-sm text-red-500">{errors.tags}</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="content" className="block text-sm font-medium">
            Content (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-96 w-full rounded-lg border px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Write your post in Markdown..."
              disabled={isSubmitting}
            />
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
          </div>

          {showPreview && (
            <div className="h-96 overflow-y-auto rounded-lg border bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Preview</h3>
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errors.submit}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : saveButtonText}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-11 rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
