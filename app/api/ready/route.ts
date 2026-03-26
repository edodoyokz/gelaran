import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { runReadinessCheck } from "@/lib/health";

export async function GET() {
  const result = await runReadinessCheck([
    async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
  ]);

  const statusCode = result.ok ? 200 : 503;

  return NextResponse.json(
    {
      ok: result.ok,
      status: result.status,
      reason: result.reason,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
