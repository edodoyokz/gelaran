"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MaterialSymbol } from "@/components/ui/material-symbol";
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
    const searchInputId = useId();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            setSearchQuery("");
        }
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[rgba(1,89,89,0.08)] bg-white/90 px-4 py-3 text-[#015959] shadow-[0_12px_40px_rgba(1,89,89,0.06)] backdrop-blur-xl transition-colors dark:border-[rgba(78,222,225,0.12)] dark:bg-[#101818]/88 dark:text-[#29B3B6] sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4 lg:gap-8">
                <Link href="/dashboard" className="text-2xl font-black text-[#015959] dark:text-[#29B3B6] tracking-tighter font-headline">
                    Gelaran
                </Link>
                <form onSubmit={handleSearch} className="hidden md:flex min-w-0 flex-1 items-center rounded-full border border-[rgba(1,89,89,0.1)] bg-[rgba(245,249,248,0.92)] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors focus-within:border-(--border-focus) focus-within:ring-2 focus-within:ring-[rgba(41,179,182,0.18)] dark:border-[rgba(78,222,225,0.12)] dark:bg-[rgba(20,34,35,0.9)] dark:focus-within:ring-[rgba(78,222,225,0.18)]">
                    <label htmlFor={searchInputId} className="sr-only">
                        Cari event, organizer, atau kota
                    </label>
                    <MaterialSymbol aria-hidden="true" name="search" className="mr-2 text-sm text-slate-400" />
                    <input 
                        id={searchInputId}
                        className="w-full min-w-0 bg-transparent border-none text-sm text-[#015959] outline-none placeholder:text-slate-400 focus:ring-0 dark:text-[#29B3B6]" 
                        placeholder="Cari event, organizer, atau kota..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <nav className="hidden md:flex items-center gap-6 font-['Noto_Serif'] font-bold text-lg">
                <Link className="text-[#F95D00] font-bold border-b-2 border-[#F95D00] pb-1" href="/events">Explore</Link>
                <Link className="text-slate-600 dark:text-slate-400 hover:text-[#015959] transition-colors" href="/docs/customer">Help</Link>
                <Link className="text-slate-600 dark:text-slate-400 hover:text-[#015959] transition-colors" href="/become-organizer">Partner</Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
                <button type="button" aria-label={resolvedTheme === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap"} onClick={toggleTheme} className="hidden rounded-full border border-transparent p-2 transition-colors hover:border-[rgba(1,89,89,0.08)] hover:bg-[rgba(245,249,248,0.92)] focus-visible:border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(41,179,182,0.18)] dark:hover:border-[rgba(78,222,225,0.12)] dark:hover:bg-[rgba(20,34,35,0.9)] sm:block">
                    <MaterialSymbol name={resolvedTheme === "dark" ? "light_mode" : "dark_mode"} className="shrink-0" />
                </button>

                <Link href="/notifications" aria-label={notificationCount > 0 ? `Buka notifikasi, ${notificationCount} belum dibaca` : "Buka notifikasi"} className="relative block rounded-full border border-transparent p-2 transition-colors hover:border-[rgba(1,89,89,0.08)] hover:bg-[rgba(245,249,248,0.92)] focus-visible:border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(41,179,182,0.18)] dark:hover:border-[rgba(78,222,225,0.12)] dark:hover:bg-[rgba(20,34,35,0.9)]">
                    <MaterialSymbol name="notifications" className="shrink-0" />
                    {notificationCount > 0 && (
                        <span className="absolute top-2 right-2 min-w-4 rounded-full bg-[#F95D00] px-1 text-center text-[10px] font-bold leading-4 text-white">{notificationCount > 9 ? "9+" : notificationCount}</span>
                    )}
                </Link>

                <div ref={profileRef} className="relative ml-2 flex h-9 items-center gap-2 border-l border-[rgba(1,89,89,0.08)] pl-4 dark:border-[rgba(78,222,225,0.12)]">
                    <button 
                        type="button"
                        aria-label={isProfileOpen ? "Tutup menu profil" : "Buka menu profil"}
                        aria-expanded={isProfileOpen}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-full border border-[rgba(1,89,89,0.08)] bg-[rgba(245,249,248,0.92)] px-2 py-1.5 shadow-[0_8px_24px_rgba(1,89,89,0.05)] transition-colors hover:bg-white focus-visible:border-(--border-focus) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(41,179,182,0.18)] dark:border-[rgba(78,222,225,0.12)] dark:bg-[rgba(20,34,35,0.9)]"
                    >
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent-gradient) shrink-0 shadow-(--shadow-glow)">
                                <span className="text-white dark:text-slate-900 font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="hidden min-w-0 sm:block">
                            <p className="max-w-28 truncate text-sm font-semibold text-[#015959] dark:text-[#dffefe]">{user.name}</p>
                        </div>
                        <MaterialSymbol name={isProfileOpen ? "expand_less" : "expand_more"} className="hidden shrink-0 text-sm sm:block" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-4 w-56 overflow-hidden rounded-[1.4rem] border border-[rgba(1,89,89,0.08)] bg-white/96 shadow-[0_24px_60px_rgba(1,89,89,0.12)] animate-in fade-in slide-in-from-top-2 backdrop-blur dark:border-[rgba(78,222,225,0.12)] dark:bg-slate-900/96">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <p className="font-bold text-[#015959] dark:text-[#29B3B6] truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                            <div className="p-2">
                                <Link onClick={() => setIsProfileOpen(false)} href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#015959] dark:hover:text-[#29B3B6] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <MaterialSymbol name="person" className="text-[20px]" /> Profile
                                </Link>
                                <Link onClick={() => setIsProfileOpen(false)} href="/my-bookings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#015959] dark:hover:text-[#29B3B6] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <MaterialSymbol name="confirmation_number" className="text-[20px]" /> Tickets
                                </Link>
                                <Link onClick={() => setIsProfileOpen(false)} href="/wishlist" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#015959] dark:hover:text-[#29B3B6] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <MaterialSymbol name="favorite" className="text-[20px]" /> Wishlist
                                </Link>
                            </div>
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <MaterialSymbol name="logout" className="text-[20px]" />
                                    {isLoggingOut ? "Logging out..." : "Logout"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
