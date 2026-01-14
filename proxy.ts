import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const protectedPaths = ["/account", "/checkout", "/my-bookings", "/profile", "/wishlist", "/dashboard"];
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    const adminPaths = ["/admin"];
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

    const organizerPaths = ["/organizer"];
    const isOrganizerPath = organizerPaths.some((path) => pathname.startsWith(path));

    const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

    if ((isProtectedPath || isAdminPath || isOrganizerPath) && !user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    if (isAuthPath && user) {
        const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/";
        return NextResponse.redirect(new URL(returnUrl, request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|auth).*)",
    ],
};
