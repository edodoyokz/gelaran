"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    User,
    LogOut,
    Ticket,
    Heart,
    Settings,
    ChevronDown,
    LayoutDashboard,
    Menu,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavbarProps {
    transparent?: boolean;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

export function Navbar({ transparent = true }: NavbarProps) {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
            }
        } catch {
            console.error("Failed to fetch profile");
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                await fetchProfile();
            }
            setIsLoading(false);
        };

        checkUser();

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                await fetchProfile();
            } else {
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsDropdownOpen(false);
        router.push("/");
        router.refresh();
    };

    const showBackground = !transparent || isScrolled;

    const getDashboardLink = (): string => {
        if (!profile) return "/";
        switch (profile.role) {
            case "SUPER_ADMIN":
            case "ADMIN":
                return "/admin";
            case "ORGANIZER":
                return "/organizer";
            default:
                return "/my-bookings";
        }
    };

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                showBackground
                    ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link
                    href="/"
                    className={cn(
                        "text-2xl font-bold tracking-tighter",
                        showBackground ? "text-indigo-600" : "text-white"
                    )}
                >
                    BSC
                    <span className={showBackground ? "text-gray-800" : "text-white/90"}>
                        Tickets
                    </span>
                </Link>

                <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                    {showBackground && (
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Cari konser, seminar..."
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    )}
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Link
                        href="/organizer"
                        className={cn(
                            "font-medium transition-colors",
                            showBackground
                                ? "text-gray-600 hover:text-indigo-600"
                                : "text-white/90 hover:text-white"
                        )}
                    >
                        Buat Event
                    </Link>

                    {isLoading ? (
                        <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-full" />
                    ) : user && profile ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-colors",
                                    showBackground
                                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                                )}
                            >
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.name}
                                        className="w-7 h-7 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                        {getInitials(profile.name)}
                                    </div>
                                )}
                                <span className="max-w-[100px] truncate">{profile.name.split(" ")[0]}</span>
                                <ChevronDown
                                    size={16}
                                    className={cn(
                                        "transition-transform",
                                        isDropdownOpen && "rotate-180"
                                    )}
                                />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border py-2 z-50">
                                    <div className="px-4 py-3 border-b">
                                        <p className="font-medium text-gray-900 truncate">{profile.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">
                                            {profile.role.toLowerCase().replace("_", " ")}
                                        </span>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            href={getDashboardLink()}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <LayoutDashboard size={18} className="text-gray-400" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/my-bookings"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Ticket size={18} className="text-gray-400" />
                                            Tiket Saya
                                        </Link>
                                        <Link
                                            href="/wishlist"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Heart size={18} className="text-gray-400" />
                                            Wishlist
                                        </Link>
                                        <Link
                                            href="/profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings size={18} className="text-gray-400" />
                                            Pengaturan
                                        </Link>
                                    </div>

                                    <div className="border-t py-2">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-colors",
                                showBackground
                                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                            )}
                        >
                            <User size={18} />
                            <span>Masuk</span>
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={cn(
                        "md:hidden p-2 rounded-lg transition-colors",
                        showBackground
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                    )}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t shadow-lg">
                    <div className="px-4 py-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari event..."
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div className="px-4 pb-4 space-y-2">
                        <Link
                            href="/organizer"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                        >
                            Buat Event
                        </Link>

                        {user && profile ? (
                            <>
                                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {profile.avatarUrl ? (
                                            <img
                                                src={profile.avatarUrl}
                                                alt={profile.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {getInitials(profile.name)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{profile.name}</p>
                                            <p className="text-sm text-gray-500">{profile.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={getDashboardLink()}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <LayoutDashboard size={18} className="text-gray-400" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/my-bookings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <Ticket size={18} className="text-gray-400" />
                                    Tiket Saya
                                </Link>
                                <Link
                                    href="/wishlist"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <Heart size={18} className="text-gray-400" />
                                    Wishlist
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <Settings size={18} className="text-gray-400" />
                                    Pengaturan
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <LogOut size={18} />
                                    Keluar
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700"
                            >
                                Masuk / Daftar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
