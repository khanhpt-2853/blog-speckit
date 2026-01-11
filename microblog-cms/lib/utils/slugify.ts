import slugifyLib from "slugify";

/**
 * Generate a URL-friendly slug from a title
 * @param title - Post title
 * @returns URL-safe slug
 */
export function generateSlug(title: string): string {
  return slugifyLib(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Generate a unique slug by appending ID if needed
 * @param title - Post title
 * @param id - Post ID (optional, for uniqueness)
 * @returns Unique slug
 */
export function generateUniqueSlug(title: string, id?: string): string {
  const baseSlug = generateSlug(title);
  return id ? `${baseSlug}-${id.slice(0, 8)}` : baseSlug;
}
