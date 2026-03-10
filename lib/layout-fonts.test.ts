import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const layoutPath = path.join(process.cwd(), "app/layout.tsx");
const globalsPath = path.join(process.cwd(), "app/globals.css");

test("root layout uses local font fallbacks instead of next/font/google", () => {
  const layoutSource = readFileSync(layoutPath, "utf8");
  const globalsSource = readFileSync(globalsPath, "utf8");

  assert.doesNotMatch(layoutSource, /next\/font\/google/);
  assert.match(layoutSource, /className="antialiased"/);
  assert.match(globalsSource, /--font-geist-sans:\s*-apple-system/);
  assert.match(globalsSource, /--font-geist-mono:\s*"SFMono-Regular"/);
});
