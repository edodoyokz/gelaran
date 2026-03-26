import assert from "node:assert/strict";
import test from "node:test";
import { isCronAuthorized } from "./cron-auth";

test("rejects requests when CRON_SECRET is missing", () => {
  const request = new Request("https://example.com/api/cron/job");

  const result = isCronAuthorized(request, undefined);

  assert.equal(result, false);
});

test("rejects requests when authorization header is missing", () => {
  const request = new Request("https://example.com/api/cron/job");

  const result = isCronAuthorized(request, "top-secret");

  assert.equal(result, false);
});

test("rejects requests when bearer token is invalid", () => {
  const request = new Request("https://example.com/api/cron/job", {
    headers: {
      authorization: "Bearer invalid-secret",
    },
  });

  const result = isCronAuthorized(request, "top-secret");

  assert.equal(result, false);
});

test("accepts requests when bearer token matches CRON_SECRET", () => {
  const request = new Request("https://example.com/api/cron/job", {
    headers: {
      authorization: "Bearer top-secret",
    },
  });

  const result = isCronAuthorized(request, "top-secret");

  assert.equal(result, true);
});
