import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";
import { AdminProfileProvider } from "@/components/admin/AdminProfileProvider";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
        <ThemeProvider>
            <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
                <AdminLayoutWrapper>
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
                </AdminLayoutWrapper>
            </div>
        </ThemeProvider>
    );
}
