/**
 * Normalize a tag to lowercase with hyphens
 * @param tag - Raw tag string (e.g., "Machine Learning")
 * @returns Normalized tag (e.g., "machine-learning")
 */
export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric except hyphens
    .slice(0, 50); // Enforce max length (FR-013)
}

/**
 * Normalize multiple tags and validate count
 * @param tags - Array of raw tag strings
 * @returns Array of normalized tags
 * @throws Error if more than 5 tags or if any tag is empty after normalization
 */
export function normalizeTags(tags: string[]): string[] {
  if (tags.length > 5) {
    throw new Error("Maximum 5 tags allowed");
  }

  const normalized = tags.map(normalizeTag).filter((t) => t.length > 0);

  if (normalized.length === 0) {
    throw new Error("At least one valid tag required");
  }

  return normalized;
}

/**
 * Validate a single tag format
 * @param tag - Tag string to validate
 * @returns True if valid, false otherwise
 */
export function isValidTag(tag: string): boolean {
  const normalized = normalizeTag(tag);
  return normalized.length >= 1 && normalized.length <= 50 && /^[a-z0-9-]+$/.test(normalized);
}
