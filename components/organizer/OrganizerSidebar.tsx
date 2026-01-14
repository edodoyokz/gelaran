"use client";

import Link from "next/link";
import Image from "next/image";
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
    Sun,
    Moon,
    type LucideIcon,
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
    isVerified = false,
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
                                "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-l-lg transition-all duration-200",
                                parentActive
                                    ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-md)]"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
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
                                        ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-md)]"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
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
                        <div className="mt-1 ml-4 pl-3 border-l border-[var(--border)] space-y-1">
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
                        ? "bg-[var(--accent-primary)] text-white shadow-[var(--shadow-md)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
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
                "fixed left-0 top-0 h-full transition-all duration-300 z-40 flex flex-col bg-[var(--surface)] border-r border-[var(--border)]",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                    {organizationLogo ? (
                        <Image
                            src={organizationLogo}
                            alt={organizationName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[var(--shadow-glow)]">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                    )}
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold truncate text-sm text-[var(--text-primary)]">
                                {organizationName}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                {isVerified ? (
                                    <span className="text-xs text-[var(--success)] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-[var(--success)] rounded-full" />
                                        Terverifikasi
                                    </span>
                                ) : (
                                    <span className="text-xs text-[var(--warning)] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-[var(--warning)] rounded-full" />
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
                {menuItems.map((item) => renderMenuItem(item))}
            </nav>

            <div className="p-3 space-y-1 border-t border-[var(--border)]">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="text-sm font-medium">Mode Terang</span>}
                        </>
                    ) : (
                        <>
                            <Moon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="text-sm font-medium">Mode Gelap</span>}
                        </>
                    )}
                </button>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <Home className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Kembali ke Home</span>}
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors disabled:opacity-50"
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{isLoggingOut ? "Keluar..." : "Keluar"}</span>}
                </button>
            </div>

            <button
                type="button"
                onClick={toggleCollapse}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-50 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
