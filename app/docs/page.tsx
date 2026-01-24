import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DocsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userRole = null;

    if (user) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true }
        });
        userRole = dbUser?.role;
    }

    // Auto-redirect based on role if possible, or show a landing page with options
    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        // Admins can see everything, but mainly admin docs
        // We can just show the list
    } else if (userRole === "ORGANIZER") {
        redirect("/docs/organizer");
    }

    // For customers or public (if we allow public docs later, but for now we'll stick to auth)

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Documentation Center</h1>
                <p className="text-muted-foreground text-lg">Select the documentation relevant to your role.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Admin Sections - Only visible to admins */}
                {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                    <Link href="/docs/admin" className="block h-full">
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-primary">Admin Guide</CardTitle>
                                <CardDescription>Platform management, user controls, and system settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-primary">Access Admin Docs &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* Organizer Sections */}
                {/* Admins can also view organizer docs usually */}
                {["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(userRole || "") && (
                    <Link href="/docs/organizer" className="block h-full">
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-indigo-500/20">
                            <CardHeader>
                                <CardTitle className="text-indigo-500">Organizer Guide</CardTitle>
                                <CardDescription>Managing events, venues, ticketing, and scanning.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-indigo-500">Access Organizer Docs &rarr;</span>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* Customer/General Sections */}
                <Link href="/docs/customer" className="block h-full">
                    <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-green-500/20">
                        <CardHeader>
                            <CardTitle className="text-green-500">User Guide</CardTitle>
                            <CardDescription>Booking tickets, managing your profile, and FAQs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-sm font-medium text-green-500">Access User Docs &rarr;</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {!user && (
                <div className="rounded-lg bg-muted p-8 text-center">
                    <p className="mb-4">You must be signed in to view specific documentation.</p>
                    <Link href="/login" className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                        Sign In
                    </Link>
                </div>
            )}
        </div>
    );
}
