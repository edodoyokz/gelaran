/**
 * Rate limiting utility for API routes.
 * Uses in-memory fixed windows for serverless compatibility.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Key prefix for namespacing */
  keyPrefix?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// In-memory store for rate limiting
// Note: In serverless, this resets per function instance
// For production at scale, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanupStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  const cutoff = now - 300_000; // Remove entries older than 5 minutes
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.windowStart < cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupStore();
  
  const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;
  const now = Date.now();
  const windowStart = now - (now % config.windowMs);
  
  const entry = rateLimitStore.get(fullKey);
  
  if (!entry || entry.windowStart < windowStart) {
    // New window
    rateLimitStore.set(fullKey, { count: 1, windowStart });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: windowStart + config.windowMs,
    };
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const resetAt = entry.windowStart + config.windowMs;
    return {
      success: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - now) / 1000),
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(fullKey, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.windowStart + config.windowMs,
  };
}

/**
 * Create a rate limiter with predefined config
 */
export function createRateLimiter(config: RateLimitConfig) {
  return {
    check: (key: string): RateLimitResult => checkRateLimit(key, config),
    config,
  };
}

// Predefined rate limiters for common use cases
export const rateLimiters = {
  /** Payment API - strict rate limiting to prevent abuse */
  payment: createRateLimiter({
    maxRequests: 10,
    windowMs: 60_000, // 1 minute
    keyPrefix: "payment",
  }),
  
  /** Payment webhook - allow higher burst for legitimate webhooks */
  webhook: createRateLimiter({
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
    keyPrefix: "webhook",
  }),
  
  /** Cron endpoints - restrict to prevent unauthorized calls */
  cron: createRateLimiter({
    maxRequests: 5,
    windowMs: 60_000, // 1 minute
    keyPrefix: "cron",
  }),
  
  /** General API rate limiting */
  api: createRateLimiter({
    maxRequests: 60,
    windowMs: 60_000, // 1 minute
    keyPrefix: "api",
  }),
};

/**
 * Extract client identifier for rate limiting
 * Uses IP address as primary identifier
 */
export function getClientIdentifier(
  headers: Headers,
  fallback?: string
): string {
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip");
  
  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, use the first
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return fallback ?? "unknown";
}

/**
 * Rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.floor(result.resetAt / 1000)));
  
  if (result.retryAfter) {
    headers.set("Retry-After", String(result.retryAfter));
  }
  
  return headers;
}
