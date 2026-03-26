import assert from "node:assert/strict";
import test from "node:test";
import { getAuthDemoConfig } from "./demo-mode";

test("auth demo shortcuts enabled in local stage", () => {
    assert.deepEqual(getAuthDemoConfig("local"), {
        enabled: true,
        defaultExpanded: true,
    });
});

test("auth demo shortcuts disabled in beta and production", () => {
    assert.deepEqual(getAuthDemoConfig("beta"), {
        enabled: false,
        defaultExpanded: false,
    });

    assert.deepEqual(getAuthDemoConfig("production"), {
        enabled: false,
        defaultExpanded: false,
    });
});
