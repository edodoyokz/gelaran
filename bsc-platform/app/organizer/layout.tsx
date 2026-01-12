import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { OrganizerSidebar } from "@/components/organizer/OrganizerSidebar";

export default async function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/organizer");
    }

    const organizer = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            organizerProfile: true,
        },
    });

    if (!organizer || organizer.role !== "ORGANIZER") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <OrganizerSidebar
                organizationName={organizer.organizerProfile?.organizationName || organizer.name}
                organizationLogo={organizer.organizerProfile?.organizationLogo}
                isVerified={organizer.organizerProfile?.isVerified || false}
            />
            <div className="pl-64 transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
