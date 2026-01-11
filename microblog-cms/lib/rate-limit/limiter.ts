import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter for post creation: 10 posts per hour
export const postLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:posts",
});

// Rate limiter for comment creation: 30 comments per hour
export const commentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: true,
  prefix: "ratelimit:comments",
});

// Rate limiter for likes: 100 likes per hour (more generous)
export const likeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
  prefix: "ratelimit:likes",
});

/**
 * Check rate limit and return result
 * @param limiter - The rate limiter to use
 * @param identifier - Unique identifier (user ID or IP address)
 * @returns Rate limit check result with success status and remaining count
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  return { success, limit, remaining, reset };
}
