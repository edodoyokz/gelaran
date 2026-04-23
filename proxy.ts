import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseServerEnv } from "@/lib/env";

export async function proxy(request: NextRequest) {
    const env = getSupabaseServerEnv();
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    for (const { name, value } of cookiesToSet) {
                        request.cookies.set(name, value);
                    }
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    for (const { name, value, options } of cookiesToSet) {
                        supabaseResponse.cookies.set(name, value, options);
                    }
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const returnUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    const protectedPaths = [
        "/account",
        "/checkout",
        "/dashboard",
        "/following",
        "/my-bookings",
        "/notifications",
        "/profile",
        "/wishlist",
    ];
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    const adminPaths = ["/admin"];
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

    const organizerPaths = ["/organizer"];
    const isOrganizerPath = organizerPaths.some((path) => pathname.startsWith(path));

    const authPaths = ["/login", "/register", "/forgot-password"];
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

    if ((isProtectedPath || isAdminPath || isOrganizerPath) && !user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("returnUrl", returnUrl);
        return NextResponse.redirect(redirectUrl);
    }

    if (isAuthPath && user) {
        const authReturnUrl = request.nextUrl.searchParams.get("returnUrl") || "/";
        return NextResponse.redirect(new URL(authReturnUrl, request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|auth).*)",
    ],
};
