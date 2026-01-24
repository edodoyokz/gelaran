import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import {
    BookOpen,
    Ticket,
    User,
    HelpCircle,
    MessageCircle,
} from "lucide-react";

const customerNavItems = [
    { title: "Memulai", href: "/docs/customer", icon: BookOpen },
    { title: "Beli Tiket", href: "/docs/customer/buying-tickets", icon: Ticket },
    { title: "Akun Saya", href: "/docs/customer/account", icon: User },
    { title: "FAQ", href: "/docs/customer/faq", icon: HelpCircle },
    { title: "Hubungi Support", href: "/docs/customer/support", icon: MessageCircle },
];

export default async function CustomerDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/docs/customer");
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <DocsSidebar items={customerNavItems} title="Panduan Pengguna" />
            <main className="flex-1 min-w-0 px-4 py-6 lg:px-8">
                <div className="max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
