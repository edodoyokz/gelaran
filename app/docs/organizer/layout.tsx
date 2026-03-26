import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const organizerNavItems = [
    { title: "Overview", href: "/docs/organizer", iconName: "LayoutDashboard" },
    { title: "Event operations", href: "/docs/organizer/events", iconName: "Calendar" },
    { title: "Gate & POS", href: "/docs/organizer/gate", iconName: "ScanLine" },
    { title: "Wallet & payouts", href: "/docs/organizer/wallet", iconName: "Wallet" },
    { title: "Team coordination", href: "/docs/organizer/team", iconName: "Users" },
];

export default async function OrganizerDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/docs/organizer");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!dbUser || !["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
        redirect("/docs");
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
            <DocsSidebar items={organizerNavItems} title="Organizer documentation" />
            <main className="min-w-0">
                <div className="space-y-8">{children}</div>
            </main>
        </div>
    );
}
