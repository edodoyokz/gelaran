import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const adminNavItems = [
    { title: "Overview", href: "/docs/admin" },
    { title: "User Management", href: "/docs/admin/users" },
    { title: "Event Moderation", href: "/docs/admin/events" },
    { title: "Transactions", href: "/docs/admin/transactions" },
    { title: "Settings", href: "/docs/admin/settings" },
];

export default async function AdminDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/docs/admin");
    }

    const adminUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
        redirect("/docs");
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <DocsSidebar items={adminNavItems} />
            <div className="flex-1 space-y-6">
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 mb-6">
                    <p className="text-sm font-medium text-primary flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Admin Access Verified
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
