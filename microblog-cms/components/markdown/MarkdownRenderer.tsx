"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Render Markdown content to HTML with syntax highlighting and sanitization
 * @param content - Raw Markdown string
 * @param className - Optional CSS classes
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
