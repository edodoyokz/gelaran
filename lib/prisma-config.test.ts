import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const packageJsonPath = path.join(process.cwd(), "package.json");
const prismaConfigPath = path.join(process.cwd(), "prisma.config.ts");

test("Prisma CLI config lives in prisma.config.ts instead of package.json", () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    prisma?: unknown;
  };
  const prismaConfig = readFileSync(prismaConfigPath, "utf8");

  assert.equal(packageJson.prisma, undefined);
  assert.match(prismaConfig, /defineConfig\(/);
  assert.match(prismaConfig, /seed:\s*["'`]tsx prisma\/seed\.ts["'`]/);
});
