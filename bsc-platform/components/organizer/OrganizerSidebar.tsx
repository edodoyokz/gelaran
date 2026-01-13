"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Building2,
    CreditCard,
    Home,
    ScanLine,
    type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface OrganizerSidebarProps {
    organizationName: string;
    organizationLogo?: string | null;
    isVerified?: boolean;
}

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { href: "/organizer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/organizer/events", label: "Event Saya", icon: Calendar },
    { href: "/organizer/gate", label: "Gate & POS", icon: ScanLine },
    { 
        href: "/organizer/wallet", 
        label: "Wallet", 
        icon: Wallet,
        children: [
            { href: "/organizer/wallet/withdraw", label: "Tarik Dana", icon: CreditCard },
            { href: "/organizer/wallet/bank-account", label: "Rekening Bank", icon: Building2 },
        ]
    },
    { href: "/organizer/settings", label: "Pengaturan", icon: Settings },
];

export function OrganizerSidebar({ 
    organizationName, 
    organizationLogo,
    isVerified = false 
}: OrganizerSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
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
        if (href === "/organizer") {
            return pathname === "/organizer";
        }
        return pathname === href;
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
                        <Link
                            href={item.href}
                            className={cn(
                                "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-l-lg transition-all duration-200",
                                parentActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
                                collapsed && "rounded-lg"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", parentActive && "text-white")} />
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </Link>
                        {!collapsed && (
                            <button
                                type="button"
                                onClick={() => toggleExpanded(item.href)}
                                className={cn(
                                    "px-2 py-2.5 rounded-r-lg transition-all duration-200",
                                    parentActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
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
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
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
                "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 flex flex-col",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    {organizationLogo ? (
                        <img
                            src={organizationLogo}
                            alt={organizationName}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                    )}
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-white truncate text-sm">
                                {organizationName}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                {isVerified ? (
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                        Terverifikasi
                                    </span>
                                ) : (
                                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => renderMenuItem(item))}
            </nav>

            <div className="p-3 border-t border-slate-700 space-y-1">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                    <Home className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Kembali ke Home</span>}
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{isLoggingOut ? "Keluar..." : "Keluar"}</span>}
                </button>
            </div>

            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600 hover:text-white transition-colors shadow-lg"
            >
                {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </button>
        </aside>
    );
}
