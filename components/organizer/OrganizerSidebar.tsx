"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Building2,
    CreditCard,
    ScanLine,
    Sun,
    Moon,
    BookOpen,
    Users,
    type LucideIcon,
    LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/hooks/useTheme";

interface OrganizerSidebarProps {
    organizationName: string;
    organizationLogo?: string | null;
    isVerified?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

interface MenuItem {
    href: string;
    label: string;
    icon: string; // use Material Symbols string like "dashboard"
    lucideIcon: LucideIcon; // Fallback
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { href: "/organizer", label: "Dashboard", icon: "dashboard", lucideIcon: LayoutDashboard },
    { href: "/organizer/events", label: "Events", icon: "event", lucideIcon: Calendar },
    { href: "/organizer/gate", label: "Gate & POS", icon: "confirmation_number", lucideIcon: ScanLine },
    {
        href: "/organizer/wallet",
        label: "Finances",
        icon: "payments",
        lucideIcon: Wallet,
        children: [
            { href: "/organizer/wallet/withdraw", label: "Tarik Dana", icon: "payments", lucideIcon: CreditCard },
            { href: "/organizer/wallet/bank-account", label: "Rekening Bank", icon: "account_balance", lucideIcon: Building2 },
        ]
    },
    { href: "/organizer/team", label: "Team", icon: "group", lucideIcon: Users },
    { href: "/organizer/settings", label: "Settings", icon: "settings", lucideIcon: Settings },
];

export function OrganizerSidebar({
    organizationName,
    isCollapsed,
    onToggleCollapse,
}: OrganizerSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const collapsed = isCollapsed ?? internalCollapsed;
    const toggleCollapse = onToggleCollapse ?? (() => setInternalCollapsed(!internalCollapsed));

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
    }, [pathname, expandedItems]);

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
                                "flex-1 flex items-center gap-3 py-3 px-6 transition-all duration-300",
                                parentActive
                                    ? "bg-teal-800/80 text-brand-orange rounded-r-full border-l-4 border-brand-orange pl-5"
                                    : "text-teal-100/70 hover:bg-teal-800/50 hover:text-white rounded-r-full border-l-4 border-transparent pl-5",
                                collapsed && "px-3 rounded-lg border-l-0 justify-center"
                            )}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                            {!collapsed && (
                                <span className="font-body font-medium text-sm tracking-wide">{item.label}</span>
                            )}
                        </Link>
                        {!collapsed && (
                            <button
                                type="button"
                                onClick={() => toggleExpanded(item.href)}
                                className={cn(
                                    "px-4 py-3 transition-all duration-300",
                                    parentActive
                                        ? "text-brand-orange"
                                        : "text-teal-100/70 hover:text-white"
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
                        <div className="mt-1 ml-10 pl-3 border-l border-teal-700 space-y-1">
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
                    "flex items-center gap-3 py-3 px-6 transition-all duration-300",
                    active
                        ? "bg-teal-800/80 text-brand-orange flex-1 rounded-r-full border-l-4 border-brand-orange pl-5"
                        : "text-teal-100/70 hover:bg-teal-800/50 hover:text-white flex-1 rounded-r-full border-l-4 border-transparent pl-5",
                    isChild && "py-2 pl-4 border-l-0 rounded-none bg-transparent hover:bg-transparent",
                    isChild && active && "text-white font-bold bg-transparent",
                    collapsed && "px-3 rounded-lg border-l-0 justify-center"
                )}
            >
                <span className={cn(
                    "material-symbols-outlined", 
                    isChild ? "text-[20px]" : "text-[24px]"
                )} style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                {!collapsed && (
                    <span className={cn("font-body tracking-wide", isChild ? "text-xs font-semibold" : "text-sm font-medium")}>{item.label}</span>
                )}
            </Link>
        );
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-50 flex flex-col bg-[#015959] py-8",
                collapsed ? "w-20 px-2" : "w-64"
            )}
        >
            <div className={cn("px-6 mb-10 transition-all", collapsed && "px-2 text-center")}>
                {!collapsed ? (
                    <>
                        <h1 className="font-headline text-teal-50 text-2xl italic truncate">{organizationName}</h1>
                        <p className="text-teal-100/60 text-xs font-medium tracking-widest mt-1 uppercase">Professional Suite</p>
                    </>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-800 text-brand-orange font-headline italic font-bold">
                            {organizationName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-teal-800 scrollbar-track-transparent">
                {menuItems.map((item) => renderMenuItem(item))}
            </nav>

            <div className={cn("mt-auto space-y-4 pt-6 px-6", collapsed && "px-2")}>
                {!collapsed ? (
                    <button className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Create Event
                    </button>
                ) : (
                    <button className="w-full bg-brand-orange text-white py-3 rounded-xl flex items-center justify-center hover:brightness-110 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                    </button>
                )}

                <div className="pt-4 border-t border-teal-800/50 space-y-1">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={cn(
                            "w-full flex items-center gap-3 py-2 text-teal-100/70 hover:text-white transition-colors",
                            collapsed ? "justify-center" : "px-2"
                        )}
                    >
                        {theme === 'dark' ? (
                            <>
                                <Sun className="h-5 w-5 shrink-0" />
                                {!collapsed && <span className="text-xs font-medium">Light Mode</span>}
                            </>
                        ) : (
                            <>
                                <Moon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span className="text-xs font-medium">Dark Mode</span>}
                            </>
                        )}
                    </button>
                    {!collapsed && (
                        <Link
                            href="/docs/organizer"
                            className="w-full flex items-center gap-3 px-2 py-2 text-teal-100/70 hover:text-white transition-colors"
                        >
                            <BookOpen className="h-5 w-5 shrink-0" />
                            <span className="text-xs font-medium">Dokumentasi</span>
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={cn(
                            "w-full flex items-center gap-3 py-2 text-red-300 hover:text-red-200 transition-colors disabled:opacity-50",
                            collapsed ? "justify-center" : "px-2"
                        )}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="text-xs font-medium">{isLoggingOut ? "Keluar..." : "Keluar"}</span>}
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={toggleCollapse}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-50 bg-[#015959] border border-teal-800 text-teal-200 hover:text-white hover:bg-teal-800 transition-colors"
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
