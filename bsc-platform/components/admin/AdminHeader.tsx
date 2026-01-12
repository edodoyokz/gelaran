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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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
        fetchProfile();
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
        <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {backHref ? (
                            <Link href={backHref} className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        ) : (
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {actions}

                        {isLoading ? (
                            <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg" />
                        ) : profile ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                            {getInitials(profile.name)}
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                                            {profile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {profile.role.toLowerCase().replace("_", " ")}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform ${
                                            isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
                                        <div className="px-4 py-3 border-b">
                                            <p className="font-medium text-gray-900 truncate">{profile.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                href="/"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Home size={18} className="text-gray-400" />
                                                Ke Homepage
                                            </Link>
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <User size={18} className="text-gray-400" />
                                                Profil Saya
                                            </Link>
                                            <Link
                                                href="/admin/settings"
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
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
