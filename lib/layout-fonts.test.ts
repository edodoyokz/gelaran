import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const layoutPath = path.join(process.cwd(), "app/layout.tsx");
const globalsPath = path.join(process.cwd(), "app/globals.css");
const materialSymbolsPath = path.join(process.cwd(), "app/material-symbols.css");

test("root layout keeps text fonts on next/font/google and imports dedicated Material Symbols CSS", () => {
  const layoutSource = readFileSync(layoutPath, "utf8");
  const globalsSource = readFileSync(globalsPath, "utf8");
  const materialSymbolsSource = readFileSync(materialSymbolsPath, "utf8");

  assert.match(layoutSource, /next\/font\/google/);
  assert.match(layoutSource, /Plus_Jakarta_Sans/);
  assert.match(layoutSource, /Playfair_Display/);
  assert.match(layoutSource, /import\s+"\.\/material-symbols\.css"/);
  assert.match(layoutSource, /className=\{`antialiased \$\{plusJakartaSans\.variable\} \$\{playfairDisplay\.variable\} bg-\[var\(--bg-primary\)\] text-\[var\(--text-primary\)\]`\}/);
  assert.match(globalsSource, /--font-geist-sans:\s*-apple-system/);
  assert.match(globalsSource, /--font-editorial:\s*"Noto Serif"/);
  assert.match(globalsSource, /--font-geist-mono:\s*"SFMono-Regular"/);
  assert.doesNotMatch(globalsSource, /fonts\.googleapis\.com/);
  assert.doesNotMatch(globalsSource, /fonts\.gstatic\.com/);
  assert.doesNotMatch(globalsSource, /Material Symbols Outlined/);
  assert.match(materialSymbolsSource, /@font-face\s*\{/);
  assert.match(materialSymbolsSource, /font-family:\s*"Material Symbols Outlined"/);
  assert.match(materialSymbolsSource, /src:\s*url\("\/fonts\/material-symbols-outlined\.woff2"\) format\("woff2"\)/);
  assert.match(materialSymbolsSource, /font-display:\s*swap/);
  assert.match(materialSymbolsSource, /font-family:\s*"Material Symbols Outlined", sans-serif/);
  assert.match(materialSymbolsSource, /display:\s*inline-flex/);
  assert.match(materialSymbolsSource, /font-feature-settings:\s*"liga"/);
  assert.match(materialSymbolsSource, /font-variation-settings:\s*"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24/);
  assert.match(materialSymbolsSource, /\.material-symbols-filled\s*\{/);
});

test("customer shell tokens stay scoped to public shell utilities", () => {
  const globalsSource = readFileSync(globalsPath, "utf8");
  const publicLayoutSource = readFileSync(path.join(process.cwd(), "components/shared/phase-two-shells.tsx"), "utf8");
  const bodyBlock = globalsSource.match(/body\s*\{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(globalsSource, /\.public-shell\s*\{/);
  assert.match(globalsSource, /\.public-shell::before\s*\{/);
  assert.match(publicLayoutSource, /className="public-shell-navbar !z-\[var\(--z-fixed\)\]"/);
  assert.match(publicLayoutSource, /className=\{cn\("public-shell-main relative z-0 pt-24", mainClassName\)\}/);
  assert.match(bodyBlock, /background:\s*var\(--bg-primary\)/);
  assert.doesNotMatch(bodyBlock, /background:\s*var\(--shell-page-glow\)/);
  assert.match(globalsSource, /--shell-nav-bg:/);
  assert.match(globalsSource, /--auth-shell-shadow:/);
});
