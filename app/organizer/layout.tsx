import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { OrganizerLayoutWrapper } from "@/components/organizer/OrganizerLayoutWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
        <ThemeProvider>
            <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
                <OrganizerLayoutWrapper
                    organizationName={organizer.organizerProfile?.organizationName || organizer.name}
                    organizationLogo={organizer.organizerProfile?.organizationLogo}
                    isVerified={organizer.organizerProfile?.isVerified || false}
                >
                    {children}
                </OrganizerLayoutWrapper>
            </div>
        </ThemeProvider>
    );
}
