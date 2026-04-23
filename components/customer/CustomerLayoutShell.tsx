"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { CustomerMobileNav } from "@/components/customer/CustomerMobileNav";
import { DashboardContent } from "@/components/shared/phase-two-shells";
import { createClient } from "@/lib/supabase/client";

interface UserData {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
}

function CustomerLayoutSkeleton() {
    return (
        <div className="min-h-screen bg-[#f6f9f8] dark:bg-[#0d1718]">
            <div className="fixed top-0 z-50 h-16 w-full border-b border-[rgba(1,89,89,0.08)] bg-white/90 backdrop-blur-xl dark:border-[rgba(78,222,225,0.12)] dark:bg-[#101818]/88" />
            <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-[rgba(1,89,89,0.08)] bg-[linear-gradient(180deg,#f7fbfa_0%,#eef6f5_100%)] dark:border-[rgba(78,222,225,0.12)] dark:bg-[linear-gradient(180deg,#101a1b_0%,#132022_100%)] lg:block" />
            <main className="min-h-screen px-4 pb-24 pt-16 lg:ml-64 lg:px-8 lg:pb-8">
                <div className="mx-auto max-w-7xl space-y-6 pt-7 lg:space-y-8 lg:pt-8">
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
    const supabase = useMemo(() => createClient(), []);
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    useEffect(() => {
        const checkUser = async () => {
            try {
                const {
                    data: { user: authUser },
                } = await supabase.auth.getUser();

                if (!authUser) {
                    setUser(null);
                    setNotificationCount(0);
                    return;
                }

                setUser({
                    id: authUser.id,
                    name: authUser.email?.split("@")[0] || "User",
                    email: authUser.email || "",
                    avatarUrl: null,
                });

                const [profileRes, notifRes] = await Promise.all([
                    fetch("/api/profile"),
                    fetch("/api/notifications/count"),
                ]);

                const profileData = profileRes.ok ? await profileRes.json() : null;
                const notifData = notifRes.ok
                    ? await notifRes.json().catch(() => null)
                    : null;

                if (profileData?.success && profileData.data) {
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

                setNotificationCount(notifData?.data?.unreadCount ?? 0);
            } catch {
                setNotificationCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, [supabase]);

    if (isLoading) {
        return <CustomerLayoutSkeleton />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f6f9f8] dark:bg-[#0d1718] text-[#015959] dark:text-[#29B3B6] font-body transition-colors duration-300 flex flex-col">
            <CustomerHeader user={user} notificationCount={notificationCount} />

            <div className="flex flex-1">
                <CustomerSidebar user={user} onLogout={handleLogout} />

                <main className="flex-1 min-h-screen w-full px-4 pb-24 pt-16 lg:ml-64 lg:px-8 lg:pb-8">
                    <DashboardContent>{children}</DashboardContent>
                </main>
            </div>

            <CustomerMobileNav />
        </div>
    );
}

export function CustomerLayoutShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CustomerLayoutContent>{children}</CustomerLayoutContent>;
}
