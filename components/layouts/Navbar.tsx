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
    BookOpen,
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

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        router.push("/");
        router.refresh();
    };

    const showBackground = !transparent || isScrolled || isMobileMenuOpen;

    const getDashboardLink = (): string => {
        if (!profile) return "/";
        switch (profile.role) {
            case "SUPER_ADMIN":
            case "ADMIN":
                return "/admin";
            case "ORGANIZER":
                return "/organizer";
            default:
                return "/dashboard";
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
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    showBackground
                        ? "bg-white/90 backdrop-blur-xl shadow-sm py-3 border-b border-white/20"
                        : "bg-transparent py-5"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className={cn(
                            "text-2xl font-bold tracking-tighter relative z-50 transition-colors",
                            showBackground ? "text-indigo-600" : "text-white"
                        )}
                    >
                        Gelaran
                        <span className={showBackground ? "text-gray-800" : "text-white/90"}>
                            .id
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        {showBackground && (
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    placeholder="Cari konser, seminar..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[var(--surface-elevated)]/50 border border-transparent focus:bg-[var(--surface)] focus:border-[var(--accent-primary)]/20 focus:ring-4 focus:ring-[var(--accent-primary)]/10 text-[var(--text-primary)] text-sm outline-none transition-all duration-300"
                                />
                                <Search className="absolute left-3 top-2.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/organizer"
                            className={cn(
                                "font-medium transition-colors px-4 py-2 rounded-full",
                                showBackground
                                    ? "text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-hover)]"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Buat Event
                        </Link>

                        <Link
                            href="/docs"
                            className={cn(
                                "font-medium transition-colors px-4 py-2 rounded-full flex items-center gap-2",
                                showBackground
                                    ? "text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-hover)]"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <BookOpen size={18} />
                            <span className="hidden lg:inline">Bantuan</span>
                        </Link>

                        {isLoading ? (
                            <div className="w-24 h-10 bg-[var(--bg-tertiary)] animate-pulse rounded-full" />
                        ) : user && profile ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 pr-3 rounded-full font-medium transition-all duration-300",
                                        showBackground
                                            ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/30 hover:shadow-md"
                                            : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                                    )}
                                >
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--surface)]"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--surface)]">
                                            {getInitials(profile.name)}
                                        </div>
                                    )}
                                    <span className="max-w-[100px] truncate hidden lg:block">{profile.name.split(" ")[0]}</span>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "transition-transform duration-300",
                                            isDropdownOpen && "rotate-180"
                                        )}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]/50">
                                            <p className="font-bold text-[var(--text-primary)] truncate text-lg">{profile.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)] truncate mb-2">{profile.email}</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--info-bg)] text-[var(--info-text)] capitalize">
                                                {profile.role.toLowerCase().replace("_", " ")}
                                            </span>
                                        </div>

                                        <div className="p-2 space-y-1">
                                            <Link
                                                href={getDashboardLink()}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5 hover:text-[var(--accent-primary)] rounded-xl transition-all group"
                                            >
                                                <LayoutDashboard size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/my-bookings"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5 hover:text-[var(--accent-primary)] rounded-xl transition-all group"
                                            >
                                                <Ticket size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                                                Tiket Saya
                                            </Link>
                                            <Link
                                                href="/wishlist"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5 hover:text-[var(--accent-primary)] rounded-xl transition-all group"
                                            >
                                                <Heart size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                                                Wishlist
                                            </Link>
                                            <Link
                                                href="/docs/customer"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5 hover:text-[var(--accent-primary)] rounded-xl transition-all group"
                                            >
                                                <BookOpen size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                                                Bantuan
                                            </Link>
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/5 hover:text-[var(--accent-primary)] rounded-xl transition-all group"
                                            >
                                                <Settings size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
                                                Pengaturan
                                            </Link>
                                        </div>

                                        <div className="border-t border-[var(--border)] p-2 mt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-[var(--error-text)] hover:bg-[var(--error-bg)] rounded-xl transition-all font-medium"
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
                                    "flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-glow",
                                    showBackground
                                        ? "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] hover:-translate-y-0.5"
                                        : "bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20"
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
                            "md:hidden p-2 rounded-xl transition-colors relative z-50 min-w-[44px] min-h-[44px] flex items-center justify-center",
                            showBackground
                                ? "text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                                : "text-white hover:bg-white/10"
                        )}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            <div
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
                    isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <div
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-[var(--surface)] z-50 md:hidden shadow-2xl transition-transform duration-300 ease-out flex flex-col",
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-5 pt-24 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari event..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] text-base outline-none transition-all text-[var(--text-primary)]"
                            />
                            <Search className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={20} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {user && profile ? (
                            <div className="mb-6 bg-[var(--surface-elevated)] p-4 rounded-2xl border border-[var(--border)]">
                                <div className="flex items-center gap-4 mb-4">
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--surface)] shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center text-white font-bold text-lg shadow-sm ring-2 ring-[var(--surface)]">
                                            {getInitials(profile.name)}
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-[var(--text-primary)] truncate text-lg">{profile.name}</p>
                                        <p className="text-sm text-[var(--text-secondary)] truncate">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={getDashboardLink()}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-3 bg-[var(--bg-primary)] rounded-xl shadow-sm border border-[var(--border)] active:scale-95 transition-transform"
                                    >
                                        <LayoutDashboard size={20} className="text-[var(--accent-primary)] mb-1" />
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">Dashboard</span>
                                    </Link>
                                    <Link
                                        href="/my-bookings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-3 bg-[var(--bg-primary)] rounded-xl shadow-sm border border-[var(--border)] active:scale-95 transition-transform"
                                    >
                                        <Ticket size={20} className="text-[var(--accent-primary)] mb-1" />
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">Tiket</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-bold text-lg shadow-glow active:scale-95 transition-all"
                                >
                                    <User size={20} />
                                    Masuk / Daftar
                                </Link>
                            </div>
                        )}

                        <div className="space-y-1">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-4 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-2xl font-medium text-lg active:bg-[var(--surface-elevated)] transition-colors"
                            >
                                <Search size={22} className="text-[var(--text-muted)]" />
                                Jelajahi Event
                            </Link>
                            <Link
                                href="/organizer"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-4 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-2xl font-medium text-lg active:bg-[var(--surface-elevated)] transition-colors"
                            >
                                <LayoutDashboard size={22} className="text-[var(--text-muted)]" />
                                Buat Event
                            </Link>
                            <Link
                                href="/docs"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-4 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-2xl font-medium text-lg active:bg-[var(--surface-elevated)] transition-colors"
                            >
                                <BookOpen size={22} className="text-[var(--text-muted)]" />
                                Bantuan & Dokumentasi
                            </Link>
                            {user && (
                                <>
                                    <Link
                                        href="/wishlist"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-4 px-4 py-4 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-2xl font-medium text-lg active:bg-[var(--surface-elevated)] transition-colors"
                                    >
                                        <Heart size={22} className="text-[var(--text-muted)]" />
                                        Wishlist
                                    </Link>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-4 px-4 py-4 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-2xl font-medium text-lg active:bg-[var(--surface-elevated)] transition-colors"
                                    >
                                        <Settings size={22} className="text-[var(--text-muted)]" />
                                        Pengaturan
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {user && (
                    <div className="p-5 border-t border-[var(--border)]">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full py-3 text-[var(--error-text)] bg-[var(--error-bg)] hover:bg-[var(--error-bg)]/80 rounded-xl font-bold transition-colors min-h-[44px]"
                        >
                            <LogOut size={20} />
                            Keluar
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
