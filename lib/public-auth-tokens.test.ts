import assert from "node:assert/strict";
import test from "node:test";

import {
    publicAuthSurface,
    publicAuthToneMessages,
    publicAuthTonePanels,
} from "@/components/shared/public-auth-tokens";

test("public auth token groups expose the expected stable variants", () => {
    const surfaceKeys = Object.keys(publicAuthSurface).sort();

    assert.match(surfaceKeys.join(","), /eyebrow/);
    assert.match(surfaceKeys.join(","), /panel/);
    assert.match(surfaceKeys.join(","), /fieldShell/);
    assert.match(surfaceKeys.join(","), /fieldInput/);

    assert.deepEqual(Object.keys(publicAuthTonePanels).sort(), ["danger", "default", "success", "warning"]);
    assert.deepEqual(Object.keys(publicAuthToneMessages).sort(), ["danger", "default", "success", "warning"]);
});

test("public auth tokens keep core shared primitives on design-system CSS variables", () => {
    assert.match(publicAuthSurface.eyebrow, /border-\(--border\)/);
    assert.match(publicAuthSurface.eyebrow, /text-\(--accent-primary\)/);
    assert.match(publicAuthSurface.panel, /shadow-\(--shadow-lg\)/);

    for (const panelClassName of Object.values(publicAuthTonePanels)) {
        assert.match(panelClassName, /border-/);
        assert.match(panelClassName, /bg-/);
    }

    assert.match(publicAuthToneMessages.default, /text-\(--text-secondary\)/);
    assert.match(publicAuthToneMessages.success, /text-\(--success-text\)/);
    assert.match(publicAuthToneMessages.warning, /text-\(--warning-text\)/);
    assert.match(publicAuthToneMessages.danger, /text-\(--error-text\)/);
});

test("public auth token configs are immutable shared constants", () => {
    assert.equal(Object.isFrozen(publicAuthSurface), true);
    assert.equal(Object.isFrozen(publicAuthTonePanels), true);
    assert.equal(Object.isFrozen(publicAuthToneMessages), true);
});
