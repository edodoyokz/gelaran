import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const adminNavItems = [
    { title: "Overview", href: "/docs/admin", iconName: "LayoutDashboard" },
    { title: "User management", href: "/docs/admin/users", iconName: "Users" },
    { title: "Event moderation", href: "/docs/admin/events", iconName: "Calendar" },
    { title: "Transactions", href: "/docs/admin/transactions", iconName: "CreditCard" },
    { title: "Settings", href: "/docs/admin/settings", iconName: "Settings" },
];

export default async function AdminDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
            <DocsSidebar items={adminNavItems} title="Admin documentation" />
            <main className="min-w-0">
                <div className="space-y-8">{children}</div>
            </main>
        </div>
    );
}
