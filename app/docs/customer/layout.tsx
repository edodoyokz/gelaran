import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

const customerNavItems = [
    { title: "Getting Started", href: "/docs/customer" },
    { title: "Buying Tickets", href: "/docs/customer/buying-tickets" },
    { title: "My Account", href: "/docs/customer/account" },
    { title: "FAQ", href: "/docs/customer/faq" },
    { title: "Contact Support", href: "/docs/customer/support" },
];

export default async function CustomerDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Pretty loose guard, just easier to require login so we know who is viewing
    if (!user) {
        redirect("/login?returnUrl=/docs/customer");
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <DocsSidebar items={customerNavItems} />
            <div className="flex-1 space-y-6">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 mb-6">
                    <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        User Guide
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
