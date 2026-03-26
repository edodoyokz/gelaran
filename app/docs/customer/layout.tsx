import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const customerNavItems = [
    { title: "Getting started", href: "/docs/customer", iconName: "BookOpen" },
    { title: "Buying tickets", href: "/docs/customer/buying-tickets", iconName: "Ticket" },
    { title: "My account", href: "/docs/customer/account", iconName: "User" },
    { title: "FAQ", href: "/docs/customer/faq", iconName: "HelpCircle" },
    { title: "Support", href: "/docs/customer/support", iconName: "MessageCircle" },
];

export default async function CustomerDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/docs/customer");
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
            <DocsSidebar items={customerNavItems} title="Customer documentation" />
            <main className="min-w-0">
                <div className="space-y-8">{children}</div>
            </main>
        </div>
    );
}
