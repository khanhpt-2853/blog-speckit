import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
    ],
    ALLOWED_ATTR: ["href", "title", "alt", "src", "class"],
    ALLOW_DATA_ATTR: false,
  });
}
