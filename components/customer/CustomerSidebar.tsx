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
                "fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 hidden lg:flex flex-col p-6 gap-2",
                "bg-[#e2fffe] dark:bg-[#002020] text-[#015959] dark:text-[#29B3B6] border-r border-teal-100/50 dark:border-teal-900/50",
                isCollapsed ? "w-24 items-center px-4" : "w-64"
            )}
        >
            {!isCollapsed && (
                <div className="mb-8 px-2">
                    <p className="font-headline font-bold text-lg text-[#015959] dark:text-[#29B3B6] truncate">{user.name}</p>
                    <p className="text-xs font-medium opacity-70">Cultural Curator</p>
                </div>
            )}

            <nav className="flex-1 space-y-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-teal-800/10">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 py-3 rounded-lg font-bold transition-all duration-200 hover:translate-x-1",
                                isActive
                                    ? "bg-[#aaefee] dark:bg-[#1e6868] text-[#015959] dark:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-[#c1fffe] dark:hover:bg-[#1e6868]/50",
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
                "mt-4 bg-[#015959] text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center",
                isCollapsed ? "px-0 w-12 h-12 mx-auto text-xs flex-col" : "text-sm w-full"
            )}>
                {isCollapsed ? (
                    <MaterialSymbol name="add" />
                ) : (
                    "Book New Event"
                )}
            </Link>

            <div className="mt-auto pt-4 border-t border-teal-800/10 dark:border-teal-200/10 w-full">
                {onLogout && (
                    <button
                        type="button"
                        onClick={onLogout}
                        className={cn(
                            "flex items-center gap-3 py-3 text-slate-600 dark:text-slate-400 hover:bg-[#c1fffe] dark:hover:bg-[#1e6868]/50 rounded-lg transition-transform duration-200 hover:translate-x-1 w-full",
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
