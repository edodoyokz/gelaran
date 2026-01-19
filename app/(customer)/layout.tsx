"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerMobileNav } from "@/components/customer/CustomerMobileNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

interface UserData {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
}

function CustomerLayoutSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <div className="h-16 glass-strong fixed top-0 left-0 right-0 z-40" />
            <main className="pt-20 pb-24 lg:pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="space-y-6">
                    <div className="h-8 w-48 skeleton rounded-lg" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 skeleton rounded-2xl" />
                        ))}
                    </div>
                    <div className="h-64 skeleton rounded-2xl" />
                    <div className="h-48 skeleton rounded-2xl" />
                </div>
            </main>
        </div>
    );
}

function CustomerLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    router.push("/login?returnUrl=/dashboard");
                    return;
                }

                const [profileRes, notifRes] = await Promise.all([
                    fetch("/api/profile"),
                    fetch("/api/notifications/count"),
                ]);

                const profileData = await profileRes.json();
                const notifData = await notifRes.json().catch(() => ({ count: 0 }));

                if (profileData.success && profileData.data) {
                    setUser({
                        id: profileData.data.id,
                        name: profileData.data.name || authUser.email?.split("@")[0] || "User",
                        email: profileData.data.email || authUser.email || "",
                        avatarUrl: profileData.data.avatarUrl,
                    });
                } else {
                    setUser({
                        id: authUser.id,
                        name: authUser.email?.split("@")[0] || "User",
                        email: authUser.email || "",
                        avatarUrl: null,
                    });
                }

                setNotificationCount(notifData.count || 0);
            } catch {
                router.push("/login?returnUrl=/dashboard");
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, [router, supabase]);

    if (isLoading) {
        return <CustomerLayoutSkeleton />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
            <CustomerHeader user={user} notificationCount={notificationCount} />

            <main className="pt-20 pb-24 lg:pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
                {children}
            </main>

            <CustomerMobileNav />
        </div>
    );
}

export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider defaultTheme="system" enableTransition>
            <CustomerLayoutContent>{children}</CustomerLayoutContent>
        </ThemeProvider>
    );
}
