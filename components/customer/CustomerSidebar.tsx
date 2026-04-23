"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialSymbol } from "@/components/ui/material-symbol";
import { cn } from "@/lib/utils";

interface CustomerSidebarProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string | null;
        points?: number;
    };
    isCollapsed?: boolean;
    onLogout?: () => void;
}

const NAV_ITEMS = [
    { href: "/dashboard", icon: "dashboard", label: "Overview" },
    { href: "/my-bookings", icon: "confirmation_number", label: "My Tickets" },
    { href: "/wishlist", icon: "favorite", label: "Wishlist" },
    { href: "/following", icon: "group", label: "Following" },
    { href: "/notifications", icon: "notifications", label: "Notifications" },
    { href: "/profile", icon: "settings", label: "Settings" },
];

export function CustomerSidebar({
    user,
    isCollapsed = false,
    onLogout,
}: CustomerSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] flex-col gap-3 border-r border-[rgba(1,89,89,0.08)] bg-[linear-gradient(180deg,#f7fbfa_0%,#eef6f5_100%)] p-6 text-[#015959] shadow-[8px_0_30px_rgba(1,89,89,0.03)] transition-all duration-300 lg:flex dark:border-[rgba(78,222,225,0.12)] dark:bg-[linear-gradient(180deg,#101a1b_0%,#132022_100%)] dark:text-[#29B3B6]",
                isCollapsed ? "w-24 items-center px-4" : "w-64"
            )}
        >
            {!isCollapsed && (
                <div className="mb-6 rounded-[1.75rem] border border-[rgba(1,89,89,0.08)] bg-white/78 px-4 py-4 shadow-[0_16px_34px_rgba(1,89,89,0.05)] dark:border-[rgba(78,222,225,0.12)] dark:bg-[rgba(20,34,35,0.9)]">
                    <p className="font-headline font-bold text-lg text-[#015959] dark:text-[#29B3B6] truncate">{user.name}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Cultural Curator</p>
                </div>
            )}

            <nav className="w-full flex-1 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-800/10">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-[1.1rem] py-3 font-bold transition-all duration-200 hover:translate-x-1",
                                isActive
                                    ? "border border-[rgba(41,179,182,0.18)] bg-[linear-gradient(135deg,rgba(41,179,182,0.16),rgba(255,255,255,0.9))] text-[#015959] shadow-[0_12px_26px_rgba(41,179,182,0.12)] dark:bg-[linear-gradient(135deg,rgba(41,179,182,0.18),rgba(20,34,35,0.96))] dark:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#1e6868]/50",
                                isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-4"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <MaterialSymbol name={item.icon} filled={isActive} className={cn(isActive && "font-bold")} />
                            {!isCollapsed && <span className="font-body text-sm leading-none">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <Link href="/events" className={cn(
                "mt-2 flex items-center justify-center rounded-[1.25rem] bg-(--accent-gradient) py-3 font-bold text-white shadow-(--shadow-glow) transition-all hover:-translate-y-0.5 active:scale-95",
                isCollapsed ? "px-0 w-12 h-12 mx-auto text-xs flex-col" : "text-sm w-full"
            )}>
                {isCollapsed ? (
                    <MaterialSymbol name="add" />
                ) : (
                    "Book New Event"
                )}
            </Link>

            <div className="mt-auto w-full border-t border-[rgba(1,89,89,0.08)] pt-4 dark:border-[rgba(78,222,225,0.12)]">
                {onLogout && (
                    <button
                        type="button"
                        onClick={onLogout}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-[1.1rem] py-3 text-slate-600 transition-transform duration-200 hover:translate-x-1 hover:bg-white/80 dark:text-slate-400 dark:hover:bg-[#1e6868]/50",
                            isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-4"
                        )}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <MaterialSymbol name="logout" />
                        {!isCollapsed && <span className="font-body text-sm font-bold">Logout</span>}
                    </button>
                )}
            </div>
        </aside>
    );
}
