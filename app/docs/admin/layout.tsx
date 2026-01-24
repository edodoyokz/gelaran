import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

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
        <div className="flex flex-col gap-6">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Admin Access Verfied
                </p>
            </div>
            {children}
        </div>
    );
}
