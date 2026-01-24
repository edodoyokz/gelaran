import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

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

    // Admins can also view organizer docs usually, so we include them
    if (!dbUser || (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN")) {
        redirect("/docs");
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4">
                <p className="text-sm font-medium text-indigo-500 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                    Organizer Documentation
                </p>
            </div>
            {children}
        </div>
    );
}
