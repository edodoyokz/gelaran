import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";

function sanitizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function getRequestOrigin(request: NextRequest, fallbackOrigin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return fallbackOrigin;
}

export async function GET(request: NextRequest) {
  const env = getPublicEnv();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const safeNext = sanitizeNextPath(searchParams.get("next"));
  const origin = getRequestOrigin(request, env.NEXT_PUBLIC_APP_URL);

  const supabase = await createClient();
  let error: Error | null = null;

  if (code) {
    const exchangeResult = await supabase.auth.exchangeCodeForSession(code);
    error = exchangeResult.error;
  } else if (tokenHash && type) {
    const verifyResult = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    error = verifyResult.error;
  } else {
    return NextResponse.redirect(new URL("/login?error=auth_callback_error", origin));
  }

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_callback_error", origin));
  }

  return NextResponse.redirect(new URL(safeNext, origin));
}
