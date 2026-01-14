import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminProfileProvider } from "@/components/admin/AdminProfileProvider";
import { AdminProviders } from "@/components/admin/AdminProviders";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/admin");
    }

    const adminUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="pl-64 transition-all duration-300">
                <AdminProviders>
                    <AdminProfileProvider
                        profile={{
                            id: adminUser.id,
                            name: adminUser.name,
                            email: adminUser.email,
                            role: adminUser.role,
                            avatarUrl: adminUser.avatarUrl,
                        }}
                    >
                        {children}
                    </AdminProfileProvider>
                </AdminProviders>
            </div>
        </div>
    );
}
