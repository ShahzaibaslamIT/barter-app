const rateMap = new Map<string, { count: number; resetAt: number }>();

// Auto-cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter.
 * @param key - unique key (e.g., "login:user@email.com")
 * @param limit - max attempts allowed in the window
 * @param windowMs - time window in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetMs: windowMs };
  }

  entry.count++;

  if (entry.count > limit) {
    const resetMs = entry.resetAt - now;
    return { success: false, remaining: 0, resetMs };
  }

  return { success: true, remaining: limit - entry.count, resetMs: entry.resetAt - now };
}
