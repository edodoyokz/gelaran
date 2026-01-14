"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Shield,
    CreditCard,
    Home,
    MapPin,
    Tags,
    BarChart3,
    LayoutTemplate,
    Star,
    Wallet,
    RotateCcw,
    type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/bookings", label: "Bookings", icon: CreditCard },
    { 
        href: "/admin/finance", 
        label: "Finance", 
        icon: Wallet,
        children: [
            { href: "/admin/finance", label: "Overview", icon: Wallet },
            { href: "/admin/payouts", label: "Payouts", icon: CreditCard },
            { href: "/admin/refunds", label: "Refunds", icon: RotateCcw },
        ]
    },
    { 
        href: "/admin/master", 
        label: "Master Data", 
        icon: Tags,
        children: [
            { href: "/admin/categories", label: "Categories", icon: Tags },
            { href: "/admin/venues", label: "Venues", icon: MapPin },
        ]
    },
    { 
        href: "/admin/content", 
        label: "Content", 
        icon: LayoutTemplate,
        children: [
            { href: "/admin/landing-page", label: "Landing Page", icon: LayoutTemplate },
            { href: "/admin/reviews", label: "Reviews", icon: Star },
        ]
    },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    useEffect(() => {
        menuItems.forEach((item) => {
            if (item.children) {
                const isChildActive = item.children.some(child => pathname.startsWith(child.href));
                const isParentActive = pathname === item.href;
                if ((isChildActive || isParentActive) && !expandedItems.includes(item.href)) {
                    setExpandedItems(prev => [...prev, item.href]);
                }
            }
        });
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    const isParentActive = (item: MenuItem) => {
        if (!item.children) return false;
        return pathname === item.href || item.children.some(child => pathname.startsWith(child.href));
    };

    const toggleExpanded = (href: string) => {
        setExpandedItems(prev => 
            prev.includes(href) 
                ? prev.filter(h => h !== href)
                : [...prev, href]
        );
    };

    const renderMenuItem = (item: MenuItem, isChild = false) => {
        const active = isActive(item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.href);
        const parentActive = isParentActive(item);

        if (hasChildren) {
            return (
                <div key={item.href}>
                    <div className="flex items-center">
                        <button
                            type="button"
                            className={cn(
                                "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-l-lg transition-all duration-200 cursor-pointer text-left w-full border-0 focus:outline-none",
                                parentActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                                collapsed && "rounded-lg"
                            )}
                            onClick={() => toggleExpanded(item.href)}
                        >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", parentActive && "text-indigo-400")} />
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </button>
                        {!collapsed && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(item.href);
                                }}
                                className={cn(
                                    "px-2 py-2.5 rounded-r-lg transition-all duration-200",
                                    parentActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                )}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                    {!collapsed && isExpanded && item.children && (
                        <div className="mt-1 ml-4 pl-3 border-l border-slate-700 space-y-1">
                            {item.children.map((child) => renderMenuItem(child, true))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                    isChild && "py-2 text-sm"
                )}
            >
                <item.icon className={cn(
                    "flex-shrink-0",
                    active && "text-white",
                    isChild ? "h-4 w-4" : "h-5 w-5"
                )} />
                {!collapsed && (
                    <span className={cn("font-medium", isChild ? "text-sm" : "text-sm")}>{item.label}</span>
                )}
            </Link>
        );
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-40 flex flex-col border-r border-slate-800",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/20">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-white truncate text-base">
                                BSC Admin
                            </h2>
                            <p className="text-xs text-slate-400">Platform Management</p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {menuItems.map((item) => renderMenuItem(item))}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-1">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors"
                >
                    <Home className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Back to Home</span>}
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>}
                </button>
            </div>

            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-lg z-50"
            >
                {collapsed ? (
                    <ChevronRight className="h-3 w-3" />
                ) : (
                    <ChevronLeft className="h-3 w-3" />
                )}
            </button>
        </aside>
    );
}
