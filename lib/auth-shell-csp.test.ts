import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const authShellPath = path.join(process.cwd(), "components/shared/phase-two-shells.tsx");
const nextConfigPath = path.join(process.cwd(), "next.config.ts");

test("auth shell default aside image uses a CSP-safe local asset", () => {
  const authShellSource = readFileSync(authShellPath, "utf8");

  assert.match(authShellSource, /const DEFAULT_AUTH_ASIDE_IMAGE = "\/(?!\/)[^"]+";/);
  assert.doesNotMatch(authShellSource, /lh3\.googleusercontent\.com/);
  assert.doesNotMatch(authShellSource, /https?:\/\//);
});

test("global CSP keeps auth shell image loading on self without googleusercontent", () => {
  const nextConfigSource = readFileSync(nextConfigPath, "utf8");

  assert.match(nextConfigSource, /img-src 'self' data: blob: https:\/\/images\.unsplash\.com https:\/\/\*\.supabase\.co;/);
  assert.doesNotMatch(nextConfigSource, /lh3\.googleusercontent\.com/);
});
