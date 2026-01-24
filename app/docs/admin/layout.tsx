import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const adminNavItems = [
    { title: "Overview", href: "/docs/admin", iconName: "LayoutDashboard" },
    { title: "User Management", href: "/docs/admin/users", iconName: "Users" },
    { title: "Event Moderation", href: "/docs/admin/events", iconName: "Calendar" },
    { title: "Transactions", href: "/docs/admin/transactions", iconName: "CreditCard" },
    { title: "Settings", href: "/docs/admin/settings", iconName: "Settings" },
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
            <DocsSidebar items={adminNavItems} title="Admin Documentation" />
            <main className="flex-1 min-w-0 px-4 py-6 lg:px-8">
                <div className="max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
