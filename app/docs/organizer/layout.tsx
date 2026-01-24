import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const organizerNavItems = [
    { title: "Overview", href: "/docs/organizer", iconName: "LayoutDashboard" },
    { title: "Kelola Event", href: "/docs/organizer/events", iconName: "Calendar" },
    { title: "Gate & POS", href: "/docs/organizer/gate", iconName: "ScanLine" },
    { title: "Wallet & Payouts", href: "/docs/organizer/wallet", iconName: "Wallet" },
    { title: "Tim", href: "/docs/organizer/team", iconName: "Users" },
];

export default async function OrganizerDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/docs/organizer");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!dbUser || (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN")) {
        redirect("/docs");
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <DocsSidebar items={organizerNavItems} title="Organizer Guide" />
            <main className="flex-1 min-w-0 px-4 py-6 lg:px-8">
                <div className="max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
