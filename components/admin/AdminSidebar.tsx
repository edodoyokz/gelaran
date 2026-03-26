"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface MenuItem {
    href: string;
    label: string;
    icon?: string;
    caption?: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: "dashboard",
    },
    {
        href: "/admin/analytics",
        label: "Analytics",
        icon: "analytics",
    },
    {
        href: "/admin/users",
        label: "Users",
        icon: "group",
    },
    {
        href: "/admin/events",
        label: "Events",
        icon: "event",
    },
    {
        href: "/admin/bookings",
        label: "Bookings",
        icon: "receipt_long",
    },
    {
        href: "/admin/complimentary-requests",
        label: "Complimentary",
        icon: "redeem",
    },
    {
        href: "/admin/finance",
        label: "Finance",
        icon: "account_balance",
        children: [
            { href: "/admin/finance", label: "Overview", icon: "account_balance" },
            { href: "/admin/payouts", label: "Payouts", icon: "payments" },
            { href: "/admin/refunds", label: "Refunds", icon: "currency_exchange" },
        ],
    },
    {
        href: "/admin/master",
        label: "Master data",
        icon: "sell",
        children: [
            { href: "/admin/categories", label: "Categories", icon: "category" },
            { href: "/admin/venues", label: "Venues", icon: "location_on" },
        ],
    },
    {
        href: "/admin/content",
        label: "Content",
        icon: "view_quilt",
        children: [
            { href: "/admin/landing-page", label: "Landing page", icon: "web" },
            { href: "/admin/reviews", label: "Reviews", icon: "star" },
        ],
    },
    {
        href: "/admin/settings",
        label: "Settings",
        icon: "settings",
    },
    {
        href: "/docs/admin",
        label: "Documentation",
        icon: "menu_book",
    },
];

interface AdminSidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function AdminSidebar({ isCollapsed }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const collapsed = isCollapsed ?? false;

    const routeExpandedItems = useMemo(
        () =>
            menuItems
                .filter((item) => item.children?.some((child) => pathname.startsWith(child.href)) || pathname === item.href)
                .map((item) => item.href),
        [pathname],
    );

    const expandedSet = useMemo(
        () => new Set([...expandedItems, ...routeExpandedItems]),
        [expandedItems, routeExpandedItems],
    );

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    const isParentActive = (item: MenuItem) => {
        if (!item.children) {
            return false;
        }

        return pathname === item.href || item.children.some((child) => pathname.startsWith(child.href));
    };

    const toggleExpanded = (href: string) => {
        setExpandedItems((current) =>
            current.includes(href)
                ? current.filter((item) => item !== href)
                : [...current, href],
        );
    };

    const renderLeafItem = (item: MenuItem, isChild = false) => {
        const active = isActive(item.href);

        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-sans text-sm font-medium tracking-wide transition-all duration-200",
                    active
                        ? "bg-[#F95D00] text-white shadow-lg shadow-orange-900/20"
                        : "text-teal-100/70 hover:text-white hover:bg-white/10",
                    isChild && "py-2 pl-10 text-xs" // Indent children
                )}
            >
                {item.icon && !isChild && (
                    <span className="material-symbols-outlined text-xl" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {item.icon}
                    </span>
                )}
                {!collapsed ? (
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                ) : null}
            </Link>
        );
    };

    const renderItem = (item: MenuItem) => {
        const hasChildren = Boolean(item.children?.length);
        const expanded = expandedSet.has(item.href);
        const parentActive = isParentActive(item);

        if (!hasChildren) {
            return renderLeafItem(item);
        }

        return (
            <div key={item.href} className="flex flex-col gap-1">
                <button
                    type="button"
                    onClick={() => toggleExpanded(item.href)}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg font-sans text-sm font-medium tracking-wide transition-all duration-200",
                        parentActive
                            ? "bg-white/10 text-white"
                            : "text-teal-100/70 hover:text-white hover:bg-white/10",
                    )}
                    aria-expanded={expanded}
                >
                    <div className="flex items-center gap-3">
                        {item.icon && (
                            <span className="material-symbols-outlined text-xl" style={parentActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {item.icon}
                            </span>
                        )}
                        {!collapsed ? <span>{item.label}</span> : null}
                    </div>
                    {!collapsed && (
                        <span className="material-symbols-outlined text-lg">
                            {expanded ? "expand_less" : "expand_more"}
                        </span>
                    )}
                </button>

                {!collapsed && expanded && item.children ? (
                    <div className="flex flex-col gap-1 mt-1">
                        {item.children.map((child) => renderLeafItem(child, true))}
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-60 bg-[#015959] dark:bg-slate-950 flex flex-col p-4 gap-y-2 shadow-2xl h-screen transition-all duration-300",
                collapsed ? "w-20 items-center px-2" : "w-64"
            )}
        >
            <div className={cn("mb-8 py-2", collapsed ? "px-0 flex justify-center" : "px-4")}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                            dataset
                        </span>
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="font-headline text-xl font-bold text-white leading-tight">Gelaran</h1>
                            <p className="font-body text-[10px] font-medium tracking-widest text-teal-100/50 uppercase">Admin Console</p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden pb-4">
                {menuItems.map((item) => renderItem(item))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
                {!collapsed && (
                    <button className="w-full flex items-center justify-center gap-2 mb-4 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-body text-xs font-bold uppercase tracking-widest transition-all">
                        New Report
                    </button>
                )}
                
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 px-4 py-2 text-teal-100/70 hover:text-white transition-colors",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <span className="material-symbols-outlined text-xl">home</span>
                    {!collapsed && <span className="text-sm">Back to site</span>}
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-teal-100/70 hover:text-white transition-colors disabled:opacity-50",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <span className="material-symbols-outlined text-xl">logout</span>
                    {!collapsed && <span className="text-sm">{isLoggingOut ? "Signing out..." : "Logout"}</span>}
                </button>
            </div>
        </aside>
    );
}
