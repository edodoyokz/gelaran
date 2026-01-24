"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Search,
    Bell,
    Moon,
    Sun,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Ticket,
    Heart,
    X,
    BookOpen,
} from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { createClient } from "@/lib/supabase/client";

interface CustomerHeaderProps {
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
    };
    notificationCount?: number;
}

export function CustomerHeader({ user, notificationCount = 0 }: CustomerHeaderProps) {
    const router = useRouter();
    const { resolvedTheme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 glass-strong safe-area-top">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="font-bold text-xl text-[var(--text-primary)] hidden sm:block">
                                BSC
                            </span>
                        </Link>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors touch-target"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors touch-target"
                                aria-label="Toggle theme"
                            >
                                {resolvedTheme === "dark" ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>

                            <Link
                                href="/notifications"
                                className="relative p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors touch-target"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {notificationCount > 9 ? "9+" : notificationCount}
                                    </span>
                                )}
                            </Link>

                            <div ref={profileRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    {user.avatarUrl ? (
                                        <Image
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <ChevronDown
                                        className={`w-4 h-4 text-[var(--text-muted)] transition-transform hidden sm:block ${isProfileOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                                        <div className="p-4 border-b border-[var(--border)]">
                                            <p className="font-semibold text-[var(--text-primary)] truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)] truncate">
                                                {user.email}
                                            </p>
                                        </div>

                                        <div className="p-2">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                <span className="text-sm font-medium">Profil Saya</span>
                                            </Link>
                                            <Link
                                                href="/my-bookings"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <Ticket className="w-4 h-4" />
                                                <span className="text-sm font-medium">Pesanan Saya</span>
                                            </Link>
                                            <Link
                                                href="/wishlist"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <Heart className="w-4 h-4" />
                                                <span className="text-sm font-medium">Wishlist</span>
                                            </Link>
                                            <Link
                                                href="/docs/customer"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                <span className="text-sm font-medium">Bantuan</span>
                                            </Link>
                                            <Link
                                                href="/profile#settings"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span className="text-sm font-medium">Pengaturan</span>
                                            </Link>
                                        </div>

                                        <div className="p-2 border-t border-[var(--border)]">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors disabled:opacity-50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {isLoggingOut ? "Keluar..." : "Keluar"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {isSearchOpen && (
                <div className="fixed inset-0 z-50 bg-[var(--surface-overlay)] animate-fade-in">
                    <div className="fixed inset-x-0 top-0 bg-[var(--surface)] p-4 safe-area-top animate-slide-in-down">
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari event, konser, workshop..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className="p-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
