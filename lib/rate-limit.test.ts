import assert from "node:assert/strict";
import test from "node:test";

type RateLimitModule = typeof import("./rate-limit") & {
  default?: typeof import("./rate-limit");
};

async function loadRateLimitModule() {
  const loadedModule = (await import("./rate-limit")) as RateLimitModule;
  return (loadedModule.default ?? loadedModule) as typeof import("./rate-limit");
}

function withMockedNow<T>(now: number, fn: () => T): T {
  const originalNow = Date.now;
  Date.now = () => now;

  try {
    return fn();
  } finally {
    Date.now = originalNow;
  }
}

test("resets the request count exactly when a new window starts", async () => {
  const { checkRateLimit } = await loadRateLimitModule();
  const config = {
    maxRequests: 2,
    windowMs: 60_000,
    keyPrefix: "test-boundary",
  } as const;

  withMockedNow(120_000, () => {
    const first = checkRateLimit("client-boundary", config);
    const second = checkRateLimit("client-boundary", config);

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    assert.equal(second.remaining, 0);
  });

  withMockedNow(180_000, () => {
    const nextWindow = checkRateLimit("client-boundary", config);

    assert.equal(nextWindow.success, true);
    assert.equal(nextWindow.remaining, 1);
    assert.equal(nextWindow.resetAt, 240_000);
  });
});

test("returns retry-after headers when the limit is exceeded", async () => {
  const { checkRateLimit, getRateLimitHeaders } = await loadRateLimitModule();
  const config = {
    maxRequests: 1,
    windowMs: 60_000,
    keyPrefix: "test-headers",
  } as const;

  const limitedResult = withMockedNow(240_500, () => {
    checkRateLimit("client-headers", config);
    return checkRateLimit("client-headers", config);
  });

  assert.equal(limitedResult.success, false);
  assert.equal(limitedResult.retryAfter, 60);

  const headers = getRateLimitHeaders(limitedResult);

  assert.equal(headers.get("X-RateLimit-Remaining"), "0");
  assert.equal(headers.get("X-RateLimit-Reset"), "300");
  assert.equal(headers.get("Retry-After"), "60");
});

test("prefers the first forwarded IP and falls back when headers are absent", async () => {
  const { getClientIdentifier } = await loadRateLimitModule();
  const forwardedHeaders = new Headers({
    "x-forwarded-for": "203.0.113.10, 198.51.100.20",
    "x-real-ip": "198.51.100.30",
    "cf-connecting-ip": "198.51.100.40",
  });

  assert.equal(getClientIdentifier(forwardedHeaders), "203.0.113.10");

  const fallbackHeaders = new Headers();
  assert.equal(getClientIdentifier(fallbackHeaders, "fallback-client"), "fallback-client");
});
