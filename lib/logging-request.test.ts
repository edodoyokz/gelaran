import assert from "node:assert/strict";
import test from "node:test";
import { attachRequestIdHeader, createRequestContext } from "./logging/request.ts";

test("createRequestContext reuses incoming x-request-id", () => {
    const request = new Request("https://example.com/api/bookings", {
        method: "POST",
        headers: {
            "x-request-id": "req-123",
        },
    });

    const context = createRequestContext(request, "/api/bookings");

    assert.equal(context.requestId, "req-123");
    assert.equal(context.route, "/api/bookings");
    assert.equal(context.method, "POST");
});

test("createRequestContext generates request id when header is missing", () => {
    const request = new Request("https://example.com/api/payments", {
        method: "POST",
    });

    const context = createRequestContext(request, "/api/payments");

    assert.equal(typeof context.requestId, "string");
    assert.notEqual(context.requestId.length, 0);
});

test("attachRequestIdHeader writes x-request-id to response", () => {
    const response = new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
            "content-type": "application/json",
        },
    });

    const updated = attachRequestIdHeader(response, "req-999");

    assert.equal(updated.headers.get("x-request-id"), "req-999");
});
