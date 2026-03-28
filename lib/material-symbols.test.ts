import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("material symbols wrapper exposes the shared ligature contract", () => {
  const source = readProjectFile("components/ui/material-symbol.tsx");

  assert.match(source, /export interface MaterialSymbolProps/);
  assert.match(source, /name:\s*string/);
  assert.match(source, /filled\?:\s*boolean/);
  assert.match(source, /className\?:\s*string/);
  assert.match(source, /aria-hidden=\{title \? undefined : true\}/);
  assert.match(source, /material-symbols-outlined/);
  assert.match(source, /material-symbols-filled/);
  assert.match(source, />\s*\{name\}\s*<\/span>/);
});

test("material symbols font asset is served from a local public path", () => {
  const fontPath = path.join(process.cwd(), "public/fonts/material-symbols-outlined.woff2");

  assert.equal(existsSync(fontPath), true);
  assert.ok(readFileSync(fontPath).byteLength > 0);
});

test("key shell components consume the shared MaterialSymbol wrapper", () => {
  const files = [
    "components/customer/CustomerHeader.tsx",
    "components/customer/CustomerSidebar.tsx",
    "components/admin/AdminLayoutWrapper.tsx",
    "components/admin/AdminSidebar.tsx",
    "components/organizer/OrganizerLayoutWrapper.tsx",
    "components/organizer/OrganizerSidebar.tsx",
    "components/organizer/organizer-workspace-primitives.tsx",
    "components/shared/phase-two-shells.tsx",
  ];

  for (const relativePath of files) {
    const source = readProjectFile(relativePath);

    assert.match(source, /import\s+\{\s*MaterialSymbol\s*\}\s+from\s+"@\/components\/ui\/material-symbol"/);
    assert.doesNotMatch(source, /className="material-symbols-outlined/);
    assert.match(source, /<MaterialSymbol[\s\S]*name=/);
  }
});
