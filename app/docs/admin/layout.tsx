import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
} from "lucide-react";

const adminNavItems = [
    { title: "Overview", href: "/docs/admin", icon: LayoutDashboard },
    { title: "User Management", href: "/docs/admin/users", icon: Users },
    { title: "Event Moderation", href: "/docs/admin/events", icon: Calendar },
    { title: "Transactions", href: "/docs/admin/transactions", icon: CreditCard },
    { title: "Settings", href: "/docs/admin/settings", icon: Settings },
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
