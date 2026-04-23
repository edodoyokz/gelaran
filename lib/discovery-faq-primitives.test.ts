import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const discoveryPrimitivesPath = path.join(process.cwd(), "components/features/events/discovery-primitives.tsx");

test("DiscoveryFaqList wires accessible accordion attributes for interactive items", () => {
    const source = readFileSync(discoveryPrimitivesPath, "utf8");

    assert.match(source, /aria-expanded=\{isExpanded\}/);
    assert.match(source, /aria-controls=\{panelId\}/);
    assert.match(source, /id=\{panelId\}/);
});

test("DiscoveryFaqList avoids rendering dead buttons when no toggle handler is provided", () => {
    const source = readFileSync(discoveryPrimitivesPath, "utf8");

    assert.match(source, /onToggle \? \(/);
    assert.doesNotMatch(source, /<button[\s\S]*cursor-default/);
});

test("DiscoveryFaqList keeps interactive headings semantically outside button-only wrappers", () => {
    const source = readFileSync(discoveryPrimitivesPath, "utf8");

    assert.match(source, /<h3 id=\{headingId\} className=.*>\s*<button/);
    assert.doesNotMatch(source, /<button[^>]*>\s*<h3 id=\{headingId\}/);
});
