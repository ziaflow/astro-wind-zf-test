/**
 * In-memory sliding window rate limiter for edge/middleware/API routes.
 * Tracks requests per IP address over a time window.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export function checkRateLimit(
  ip: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const maxRequests = options.maxRequests ?? 50;
  const windowMs = options.windowMs ?? 60_000; // 1 minute default
  const now = Date.now();

  // Periodic cleanup if store exceeds 1000 IPs
  if (rateLimitStore.size > 1000) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (now > val.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }

  let record = rateLimitStore.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(ip, record);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - record.count),
    resetInSeconds,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
