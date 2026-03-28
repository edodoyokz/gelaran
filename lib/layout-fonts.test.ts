import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const layoutPath = path.join(process.cwd(), "app/layout.tsx");
const globalsPath = path.join(process.cwd(), "app/globals.css");

test("root layout keeps text fonts on next/font/google and self-hosts Material Symbols for CSP", () => {
  const layoutSource = readFileSync(layoutPath, "utf8");
  const globalsSource = readFileSync(globalsPath, "utf8");

  assert.match(layoutSource, /next\/font\/google/);
  assert.match(layoutSource, /Plus_Jakarta_Sans/);
  assert.match(layoutSource, /Playfair_Display/);
  assert.match(layoutSource, /className=\{`antialiased \$\{plusJakartaSans\.variable\} \$\{playfairDisplay\.variable\}`\}/);
  assert.match(globalsSource, /--font-geist-sans:\s*-apple-system/);
  assert.match(globalsSource, /--font-geist-mono:\s*"SFMono-Regular"/);
  assert.doesNotMatch(globalsSource, /fonts\.googleapis\.com/);
  assert.doesNotMatch(globalsSource, /fonts\.gstatic\.com/);
  assert.match(globalsSource, /@font-face\s*\{/);
  assert.match(globalsSource, /font-family:\s*"Material Symbols Outlined"/);
  assert.match(globalsSource, /src:\s*url\("\/fonts\/material-symbols-outlined\.woff2"\) format\("woff2"\)/);
  assert.match(globalsSource, /font-display:\s*swap/);
  assert.match(globalsSource, /font-family:\s*"Material Symbols Outlined", sans-serif/);
  assert.match(globalsSource, /display:\s*inline-flex/);
  assert.match(globalsSource, /font-feature-settings:\s*"liga"/);
  assert.match(globalsSource, /font-variation-settings:\s*"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24/);
  assert.match(globalsSource, /\.material-symbols-filled\s*\{/);
});
