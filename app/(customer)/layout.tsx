"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { CustomerMobileNav } from "@/components/customer/CustomerMobileNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
        <div className="min-h-screen bg-[#f0f9f9] dark:bg-[#001010]">
            <div className="h-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 fixed w-full top-0 z-50 flex items-center px-8" />
            <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#e2fffe] dark:bg-[#002020] border-r border-teal-100/50 dark:border-teal-900/50 z-40 hidden lg:block" />
            <main className="lg:ml-64 pt-16 min-h-screen lg:px-8 px-4 pb-24 lg:pb-8">
                <div className="space-y-6 pt-8 max-w-7xl mx-auto">
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

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
        <div className="min-h-screen bg-[#f0f9f9] dark:bg-[#001010] text-[#015959] dark:text-[#29B3B6] font-body transition-colors duration-300 flex flex-col">
            <CustomerHeader user={user} notificationCount={notificationCount} />
            
            <div className="flex flex-1">
                <CustomerSidebar user={user} onLogout={handleLogout} />

                <main className="flex-1 lg:ml-64 pt-16 min-h-screen lg:px-8 px-4 pb-24 lg:pb-8 w-full">
                    <DashboardContent>{children}</DashboardContent>
                </main>
            </div>

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
