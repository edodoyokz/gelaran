import assert from "node:assert/strict";
import test from "node:test";

import {
    formatLandingEventDate,
    formatLandingEventTime,
    formatLandingEventPrice,
} from "./landing-page";

test("landing page event formatters stay deterministic across environments", () => {
    assert.equal(
        formatLandingEventDate({
            scheduleDate: "2026-03-28T17:00:00.000Z",
            startTime: "2026-03-28T17:00:00.000Z",
            endTime: "2026-03-28T19:00:00.000Z",
        }),
        "Min, 29 Mar 2026",
    );

    assert.equal(
        formatLandingEventTime({
            scheduleDate: "2026-03-28T17:00:00.000Z",
            startTime: "2026-03-28T17:00:00.000Z",
            endTime: "2026-03-28T19:00:00.000Z",
        }),
        "00.00 WIB",
    );

    assert.equal(formatLandingEventPrice(null), "Gratis");
    assert.equal(formatLandingEventPrice(0), "Gratis");
    assert.equal(formatLandingEventPrice(125000), "Rp 125.000");
});
