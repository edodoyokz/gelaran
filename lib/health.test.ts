import assert from "node:assert/strict";
import test from "node:test";
import { notifyReadinessFailure, runReadinessCheck } from "./health";

test("readiness is healthy when all dependency checks pass", async () => {
  const result = await runReadinessCheck([
    async () => undefined,
    async () => undefined,
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.status, "ready");
});

test("readiness reports failure details when dependency check throws", async () => {
  const result = await runReadinessCheck([
    async () => {
      throw new Error("database unavailable");
    },
  ]);

  assert.equal(result.ok, false);
  assert.equal(result.status, "not_ready");
  assert.match(result.reason ?? "", /database unavailable/);
});

test("notifyReadinessFailure does nothing when no webhook URL is provided", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;

  globalThis.fetch = (async () => {
    called = true;
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  await notifyReadinessFailure("database unavailable");

  assert.equal(called, false);

  globalThis.fetch = originalFetch;
});

test("notifyReadinessFailure sends webhook payload when webhook URL is provided", async () => {
  const originalFetch = globalThis.fetch;

  const calls: Array<{ url: string; method: string; body: string }> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : "",
    });

    return new Response(null, { status: 200 });
  }) as typeof fetch;

  await notifyReadinessFailure("database unavailable", "https://alerts.example.test/hook");

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "https://alerts.example.test/hook");
  assert.equal(calls[0]?.method, "POST");
  assert.match(calls[0]?.body ?? "", /database unavailable/);

  globalThis.fetch = originalFetch;
});
