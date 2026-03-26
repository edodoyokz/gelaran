"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Shield,
    ChevronDown,
    LogOut,
    User,
    Settings,
    Home,
    ArrowLeft,
    Sun,
    Moon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAdminProfile } from "@/components/admin/AdminProfileProvider";
import { useTheme } from "@/lib/hooks/useTheme";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, backHref, actions }: AdminHeaderProps) {
    const router = useRouter();
    const contextProfile = useAdminProfile();
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState<UserProfile | null>(contextProfile);
    const [isLoading, setIsLoading] = useState(!contextProfile);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (contextProfile) return;
        fetchProfile();
    }, [fetchProfile, contextProfile]);

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
        router.push("/login");
        router.refresh();
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
        <header 
            className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {backHref ? (
                            <Link 
                                href={backHref} 
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-primary)] shadow-[var(--shadow-glow)]">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-[var(--text-muted)]">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {actions}

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="hidden lg:flex p-2 rounded-lg bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)] transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isLoading ? (
                            <div className="w-32 h-10 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
                        ) : profile ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-linear-to-br from-indigo-500 to-purple-600">
                                            {getInitials(profile.name)}
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium max-w-[120px] truncate text-[var(--text-primary)]">
                                            {profile.name}
                                        </p>
                                        <p className="text-xs capitalize text-[var(--text-muted)]">
                                            {profile.role.toLowerCase().replace("_", " ")}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-[var(--text-muted)] transition-transform ${
                                            isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-[var(--shadow-xl)] py-2 z-50 bg-[var(--surface)] border border-[var(--border)]">
                                        <div className="px-4 py-3 border-b border-[var(--border)]">
                                            <p className="font-medium truncate text-[var(--text-primary)]">
                                                {profile.name}
                                            </p>
                                            <p className="text-sm truncate text-[var(--text-muted)]">
                                                {profile.email}
                                            </p>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                href="/"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                            >
                                                <Home size={18} className="text-[var(--text-muted)]" />
                                                Ke Homepage
                                            </Link>
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                            >
                                                <User size={18} className="text-[var(--text-muted)]" />
                                                Profil Saya
                                            </Link>
                                            <Link
                                                href="/admin/settings"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                            >
                                                <Settings size={18} className="text-[var(--text-muted)]" />
                                                Pengaturan
                                            </Link>
                                        </div>

                                        <div className="py-2 border-t border-[var(--border)]">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors"
                                            >
                                                <LogOut size={18} />
                                                Keluar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
