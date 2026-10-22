/**
 * Fixed-window-per-IP rate limiter (sliding log).
 *
 * In-memory only: on Vercel each serverless instance keeps its own map and instances are recycled,
 * so this is a best-effort speed bump, not a hard guarantee. If spam persists, replace the store
 * with Upstash Redis (@upstash/ratelimit) using the same `checkRateLimit` signature.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_KEYS = 5_000;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bound memory: drop stale keys when the map grows large.
  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [k, times] of hits) {
      if (times[times.length - 1] <= windowStart) hits.delete(k);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test helper. */
export function resetRateLimit(): void {
  hits.clear();
}
