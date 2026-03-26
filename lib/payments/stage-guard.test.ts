import assert from "node:assert/strict";
import test from "node:test";
import { canCreatePaidOrder } from "./stage-guard";

test("allows free orders even when payments are disabled", () => {
  assert.equal(canCreatePaidOrder(0, false), true);
});

test("blocks paid orders when payments are disabled", () => {
  assert.equal(canCreatePaidOrder(150_000, false), false);
});

test("allows paid orders when payments are enabled", () => {
  assert.equal(canCreatePaidOrder(150_000, true), true);
});
