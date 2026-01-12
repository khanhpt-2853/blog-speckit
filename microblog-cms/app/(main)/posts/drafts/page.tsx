"use client";

import Link from "next/link";
import { DraftList } from "@/components/posts/DraftList";
import { useState } from "react";

export default function DraftsPage() {
  const [activeTab, setActiveTab] = useState<"drafts" | "published">("drafts");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link
          href="/posts/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <div className="mb-6 border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("drafts")}
            className={`border-b-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "drafts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`border-b-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "published"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Published
          </button>
        </div>
      </div>

      <DraftList status={activeTab} />
    </div>
  );
}
