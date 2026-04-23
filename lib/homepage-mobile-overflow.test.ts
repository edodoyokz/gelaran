import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("EventCard layout is mobile-safe and avoids fixed minimum widths", async () => {
    const source = await readFile(
        new URL("../components/features/events/EventCard.tsx", import.meta.url),
        "utf8"
    );

    // Pastikan tidak ada class yang memaksa lebar spesifik yang melebihi viewport terkecil (320px)
    const fixedWidths = ["min-w-[280px]", "min-w-[300px]", "min-w-[320px]", "w-[100vw]", "w-screen"];
    
    for (const widthClass of fixedWidths) {
        assert.equal(
            source.includes(widthClass),
            false,
            `EventCard should not use ${widthClass} which could cause horizontal overflow on mobile`
        );
    }
    
    // Pastikan class responsive modern digunakan (w-full agar bisa fit parent, min-w-0 agar flex child bisa shrink)
    const hasSafeWidth = source.includes("w-full") && source.includes("min-w-0");
    assert.equal(
        hasSafeWidth,
        true,
        "EventCard must use 'w-full' and 'min-w-0' to shrink properly inside grid containers"
    );
});
