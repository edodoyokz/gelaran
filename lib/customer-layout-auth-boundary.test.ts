import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const layoutPath = path.join(process.cwd(), "app/(customer)/layout.tsx");
const shellPath = path.join(process.cwd(), "components/customer/CustomerLayoutShell.tsx");

function readLayoutSource() {
  return readFileSync(layoutPath, "utf8");
}

function readShellSource() {
  return readFileSync(shellPath, "utf8");
}

test("customer layout uses a server-side auth boundary before rendering the customer shell", () => {
  const source = readLayoutSource();

  assert.doesNotMatch(source, /^"use client";/);
  assert.match(source, /import \{ redirect \} from "next\/navigation";/);
  assert.match(source, /import \{ createClient \} from "@\/lib\/supabase\/server";/);
  assert.match(source, /data:\s*\{\s*user\s*\}/);
  assert.match(source, /await supabase\.auth\.getUser\(\)/);
  assert.match(source, /if \(!user\) \{\s*redirect\("/);
  assert.match(source, /<CustomerLayoutShell>/);
});

test("customer layout shell stays client-rendered and keeps a safe unauthenticated fallback after hydration", () => {
  const source = readShellSource();

  assert.match(source, /^"use client";/);
  assert.match(source, /if \(!user\) \{/);
  assert.match(source, /return null;/);
  assert.match(source, /if \(!authUser\) \{/);
  assert.doesNotMatch(source, /router\.push\("\/login/);
});

test("customer layout shell preserves authenticated shell bootstrap when profile or notifications fail", () => {
  const source = readShellSource();

  assert.match(source, /setUser\(\s*\{[\s\S]*id:\s*authUser\.id,[\s\S]*email:\s*authUser\.email\s*\|\|\s*"",[\s\S]*\}\s*\)/);
  assert.match(source, /const\s+profileData\s*=\s*profileRes\.ok\s*\?\s*await\s+profileRes\.json\(\)\s*:\s*null/);
  assert.match(source, /const\s+notifData\s*=\s*notifRes\.ok\s*\?\s*await\s+notifRes\.json\(\)\.catch\(\(\)\s*=>\s*null\)\s*:\s*null/);
  assert.match(source, /setNotificationCount\(\s*notifData\?\.data\?\.unreadCount\s*\?\?\s*0\s*\)/);
  assert.doesNotMatch(source, /catch\s*\{\s*setUser\(null\)/);
});
