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
    className?: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

interface NavLinkItem {
    href: string;
    label: string;
    icon?: typeof BookOpen;
    desktopLabel?: string;
    requiresAuth?: boolean;
}

const primaryNavItems: NavLinkItem[] = [
    { href: "/organizer", label: "Buat Event", icon: LayoutDashboard },
    { href: "/docs", label: "Bantuan & Dokumentasi", desktopLabel: "Bantuan", icon: BookOpen },
];

const authenticatedNavItems: NavLinkItem[] = [
    { href: "/wishlist", label: "Wishlist", icon: Heart, requiresAuth: true },
    { href: "/profile", label: "Pengaturan", icon: Settings, requiresAuth: true },
];

export function Navbar({ transparent = true, className }: NavbarProps) {
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

    const renderDesktopNavLink = (item: NavLinkItem) => {
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition-colors",
                    showBackground
                        ? "text-[var(--text-secondary)] hover:bg-[var(--surface-editorial)] hover:text-[var(--accent-primary)]"
                        : "text-white/88 hover:bg-white/10 hover:text-white"
                )}
            >
                {Icon ? <Icon size={18} /> : null}
                <span className={cn(item.desktopLabel ? "hidden lg:inline" : undefined)}>{item.desktopLabel ?? item.label}</span>
            </Link>
        );
    };

    const renderMobileNavLink = (item: NavLinkItem) => {
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:bg-[var(--surface-elevated)]"
            >
                {Icon ? <Icon size={20} className="text-[var(--text-muted)]" /> : null}
                {item.label}
            </Link>
        );
    };

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    showBackground
                        ? "border-b border-[var(--shell-nav-border)] bg-[var(--shell-nav-bg-strong)] py-3 shadow-[var(--shell-nav-shadow)] backdrop-blur-2xl"
                        : "bg-transparent py-5",
                    className
                )}
            >
                <div className="container mx-auto flex items-center justify-between gap-6 px-4 md:px-6">
                    <Link
                        href="/"
                        className={cn(
                            "relative z-50 flex flex-col transition-colors",
                            showBackground ? "text-[var(--accent-primary)]" : "text-white"
                        )}
                    >
                        <span className="font-[var(--font-editorial)] text-[1.85rem] font-bold leading-none tracking-[-0.05em]">Gelaran</span>
                        <span className={cn(
                            "mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.3em]",
                            showBackground ? "text-[var(--text-secondary)]" : "text-white/72"
                        )}>
                            Cultural Curator
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8">
                        {showBackground && (
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    placeholder="Cari konser, seminar..."
                                    className="w-full rounded-full border border-[rgba(1,89,89,0.1)] bg-[var(--bg-public-panel)] py-3 pr-4 pl-10 text-sm text-[var(--text-primary)] outline-none transition-all duration-300 focus:border-[var(--accent-primary)]/20 focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent-primary)]/10"
                                />
                                <Search className="absolute left-3 top-2.5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        {primaryNavItems.map(renderDesktopNavLink)}

                        {isLoading ? (
                            <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--bg-tertiary)]" />
                        ) : user && profile ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-full px-2 py-1.5 pr-3 font-medium transition-all duration-300",
                                        showBackground
                                            ? "border border-[rgba(1,89,89,0.1)] bg-[var(--bg-public-panel)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/30 hover:shadow-md"
                                            : "border border-white/12 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
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
                                    <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-[1.75rem] border border-[rgba(1,89,89,0.12)] bg-[var(--surface-editorial-strong)] py-2 shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="border-b border-[var(--border)] bg-[var(--surface-editorial)] px-5 py-4">
                                            <p className="font-bold text-[var(--text-primary)] truncate text-lg">{profile.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)] truncate mb-2">{profile.email}</p>
                                            <span className="inline-flex items-center rounded-full bg-[var(--surface-chip)] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--info-text)]">
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
                                    "flex items-center space-x-2 rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300",
                                    showBackground
                                        ? "bg-[var(--accent-secondary)] text-white shadow-[0_18px_40px_rgba(249,93,0,0.22)] hover:-translate-y-0.5 hover:bg-[var(--accent-secondary-hover)]"
                                        : "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
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
                            "relative z-50 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 transition-colors md:hidden",
                            showBackground
                                ? "text-[var(--text-primary)] hover:bg-[var(--surface-editorial)]"
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
                    "fixed inset-0 z-50 flex flex-col bg-[var(--shell-nav-bg-strong)] backdrop-blur-2xl transition-all duration-300 ease-out md:hidden",
                    isMobileMenuOpen 
                        ? "opacity-100 visible" 
                        : "opacity-0 invisible pointer-events-none"
                )}
            >
                <div className="flex-1 overflow-y-auto px-5 pb-5 pt-24">
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari event..."
                                className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pr-4 pl-11 text-sm text-[var(--text-primary)] outline-none transition-all focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/10"
                            />
                            <Search className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {user && profile ? (
                            <div className="mb-6 rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.9))] p-5 shadow-[var(--shadow-sm)]">
                                <div className="flex items-center gap-4 mb-4">
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center text-white font-bold text-lg shadow-sm ring-2 ring-white">
                                            {getInitials(profile.name)}
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-[var(--text-primary)] truncate text-base">{profile.name}</p>
                                        <p className="text-sm text-[var(--text-secondary)] truncate">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={getDashboardLink()}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-[var(--border)] active:scale-95 transition-transform"
                                    >
                                        <LayoutDashboard size={18} className="text-[var(--accent-primary)] mb-1" />
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">Dashboard</span>
                                    </Link>
                                    <Link
                                        href="/my-bookings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-[var(--border)] active:scale-95 transition-transform"
                                    >
                                        <Ticket size={18} className="text-[var(--accent-primary)] mb-1" />
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">Tiket</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent-secondary)] py-3.5 text-base font-bold text-white shadow-[0_8px_24px_rgba(249,93,0,0.18)] transition-all active:scale-95"
                                >
                                    <User size={18} />
                                    Masuk / Daftar
                                </Link>
                            </div>
                        )}

                        <div className="space-y-1">
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:bg-[var(--surface-elevated)]"
                            >
                                <Search size={20} className="text-[var(--text-muted)]" />
                                Jelajahi Event
                            </Link>
                            {primaryNavItems.map(renderMobileNavLink)}
                            {user && (
                                <>
                                    {authenticatedNavItems.map(renderMobileNavLink)}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {user && (
                    <div className="border-t border-[var(--border)] p-5">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full py-3 text-[var(--error-text)] bg-[var(--error-bg)] hover:bg-[var(--error-bg)]/80 rounded-xl font-semibold transition-colors min-h-[44px]"
                        >
                            <LogOut size={18} />
                            Keluar
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
