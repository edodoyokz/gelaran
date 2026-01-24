"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ChevronRight,
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    ScanLine,
    Wallet,
    BookOpen,
    Ticket,
    User,
    HelpCircle,
    MessageCircle,
    type LucideIcon,
} from "lucide-react";

// Icon map to resolve icon names to components
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    ScanLine,
    Wallet,
    BookOpen,
    Ticket,
    User,
    HelpCircle,
    MessageCircle,
};

export interface DocsSidebarItem {
    title: string;
    href: string;
    iconName?: string;
}

interface DocsSidebarProps {
    items: DocsSidebarItem[];
    title?: string;
}

export function DocsSidebar({ items, title }: DocsSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-full md:w-72 flex-shrink-0 sticky top-24 h-fit">
            <div className="p-6 space-y-6">
                {title && (
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {title}
                    </h3>
                )}
                <nav className="space-y-1">
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.iconName ? iconMap[item.iconName] : null;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                {Icon && (
                                    <Icon
                                        size={18}
                                        className={cn(
                                            isActive ? "text-blue-500" : "text-slate-400"
                                        )}
                                    />
                                )}
                                <span className="flex-1">{item.title}</span>
                                {isActive && <ChevronRight size={14} className="text-blue-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Pro Banner */}
                <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                    <p className="text-xs font-medium opacity-80 mb-1">Butuh Bantuan?</p>
                    <h4 className="font-bold text-sm mb-2">Hubungi tim support kami.</h4>
                    <Link
                        href="/docs/customer/support"
                        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors w-full flex items-center justify-between"
                    >
                        Hubungi Support <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
