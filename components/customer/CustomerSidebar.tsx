"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
    Home,
    Ticket,
    Heart,
    Users,
    Bell,
    Settings,
    LogOut,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface CustomerSidebarProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string | null;
        points?: number;
    };
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onLogout?: () => void;
}

const NAV_ITEMS = [
    { href: "/dashboard", icon: Home, label: "Beranda" },
    { href: "/my-bookings", icon: Ticket, label: "Tiket Saya" },
    { href: "/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/following", icon: Users, label: "Following" },
    { href: "/notifications", icon: Bell, label: "Notifikasi" },
];

const BOTTOM_ITEMS = [
    { href: "/profile", icon: Settings, label: "Pengaturan" },
];

export function CustomerSidebar({
    user,
    isCollapsed = false,
    onToggleCollapse,
    onLogout,
}: CustomerSidebarProps) {
    const pathname = usePathname();
    const userInitial = user.name?.charAt(0).toUpperCase() || "U";

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 hidden lg:flex flex-col ${isCollapsed ? "w-20" : "w-60"
                }`}
        >
            <div className={`p-4 border-b border-gray-100 ${isCollapsed ? "px-3" : ""}`}>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                        B
                    </div>
                    {!isCollapsed && (
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Gelaran
                        </span>
                    )}
                </Link>
            </div>

            <div className={`p-4 border-b border-gray-100 ${isCollapsed ? "px-3" : ""}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                    {user.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover ring-2 ring-indigo-100"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                            {userInitial}
                        </div>
                    )}
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            {user.points !== undefined && (
                                <p className="text-xs font-medium text-indigo-600 mt-0.5">
                                    {user.points.toLocaleString()} poin
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                } ${isCollapsed ? "justify-center" : ""}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon
                                className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                                    }`}
                            />
                            {!isCollapsed && <span>{item.label}</span>}
                            {isActive && !isCollapsed && (
                                <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 space-y-1 border-t border-gray-100">
                {BOTTOM_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                } ${isCollapsed ? "justify-center" : ""}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0 text-gray-400" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                {onLogout && (
                    <button
                        type="button"
                        onClick={onLogout}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full ${isCollapsed ? "justify-center" : ""
                            }`}
                        title={isCollapsed ? "Keluar" : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>Keluar</span>}
                    </button>
                )}
            </div>

            <div className="p-3 border-t border-gray-100">
                <Link
                    href="/events"
                    className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 ${isCollapsed ? "justify-center px-3" : ""
                        }`}
                    title={isCollapsed ? "Jelajahi Event" : undefined}
                >
                    <Sparkles className="w-5 h-5" />
                    {!isCollapsed && <span>Jelajahi Event</span>}
                </Link>

                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="mt-3 w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
        </aside>
    );
}
