import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function listRouteFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...listRouteFiles(fullPath));
      continue;
    }

    if (entry === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

function hasAuthGuard(routeSource: string) {
  return (
    routeSource.includes("requireAdmin(") ||
    routeSource.includes("requireOrganizer(") ||
    routeSource.includes("requireRoles(") ||
    routeSource.includes("supabase.auth.getUser(")
  );
}

test("all admin and organizer API routes enforce auth guard", () => {
  const routeRoots = [
    path.join(projectRoot, "app/api/admin"),
    path.join(projectRoot, "app/api/organizer"),
  ];

  const missingGuards: string[] = [];

  for (const routeRoot of routeRoots) {
    const routeFiles = listRouteFiles(routeRoot);

    for (const routeFile of routeFiles) {
      const source = readFileSync(routeFile, "utf8");

      if (!hasAuthGuard(source)) {
        missingGuards.push(path.relative(projectRoot, routeFile));
      }
    }
  }

  assert.deepEqual(missingGuards, []);
});
