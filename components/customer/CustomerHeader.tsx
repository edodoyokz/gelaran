"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/hooks/useTheme";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
        <header className="bg-white dark:bg-slate-950 text-[#015959] dark:text-[#29B3B6] docked full-width top-0 z-50 border-b border-slate-100 dark:border-slate-800 shadow-sm fixed w-full px-8 py-3 h-16 flex justify-between items-center transition-colors">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="text-2xl font-black text-[#015959] dark:text-[#29B3B6] tracking-tighter font-headline">
                    Gelaran
                </Link>
                <form onSubmit={handleSearch} className="hidden md:flex items-center bg-slate-50 dark:bg-slate-900 rounded-full px-4 py-1.5 border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-slate-400 text-sm mr-2">search</span>
                    <input 
                        className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-slate-400 text-[#015959] dark:text-[#29B3B6] outline-none" 
                        placeholder="Search events..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <nav className="hidden md:flex items-center gap-6 font-['Noto_Serif'] font-bold text-lg">
                <Link className="text-[#F95D00] font-bold border-b-2 border-[#F95D00] pb-1" href="/events">Explore</Link>
                <Link className="text-slate-600 dark:text-slate-400 hover:text-[#015959] transition-colors" href="/docs/customer">Help</Link>
                <Link className="text-slate-600 dark:text-slate-400 hover:text-[#015959] transition-colors" href="/partner">Partner</Link>
            </nav>

            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors hidden sm:block">
                    <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>
                        {resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
                    </span>
                </button>

                <Link href="/notifications" className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-colors relative block">
                    <span className="material-symbols-outlined shrink-0">notifications</span>
                    {notificationCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#F95D00] rounded-full"></span>
                    )}
                </Link>

                <div ref={profileRef} className="relative flex items-center gap-2 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700 h-8">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#015959] dark:bg-[#29B3B6] flex items-center justify-center shrink-0">
                                <span className="text-white dark:text-slate-900 font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="material-symbols-outlined text-sm hidden sm:block shrink-0">
                            {isProfileOpen ? "expand_less" : "expand_more"}
                        </span>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-4 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <p className="font-bold text-[#015959] dark:text-[#29B3B6] truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                            <div className="p-2">
                                <Link onClick={() => setIsProfileOpen(false)} href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#015959] dark:hover:text-[#29B3B6] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">person</span> Profile
                                </Link>
                                <Link onClick={() => setIsProfileOpen(false)} href="/my-bookings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#015959] dark:hover:text-[#29B3B6] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">confirmation_number</span> Tickets
                                </Link>
                                <Link onClick={() => setIsProfileOpen(false)} href="/wishlist" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#015959] dark:hover:text-[#29B3B6] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">favorite</span> Wishlist
                                </Link>
                            </div>
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
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
