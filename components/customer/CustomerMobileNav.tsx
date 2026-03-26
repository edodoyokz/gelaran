"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, Sparkles, Heart, User } from "lucide-react";

const NAV_ITEMS = [
    { href: "/dashboard", icon: Home, label: "Beranda" },
    { href: "/my-bookings", icon: Ticket, label: "Tiket" },
    { href: "/events", icon: Sparkles, label: "Jelajah", isCenter: true },
    { href: "/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/profile", icon: User, label: "Profil" },
];

export function CustomerMobileNav() {
    const pathname = usePathname();
    const activeIndex = Math.max(
        0,
        NAV_ITEMS.findIndex(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
        )
    );

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            <div className="glass-strong border-t border-[var(--glass-border)] safe-area-pb">
                <div className="flex items-center justify-around px-2 py-2 relative">
                    <div
                        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                        style={{
                            width: "40px",
                            left: `calc(${activeIndex * 20}% + 10% - 20px)`,
                            opacity: NAV_ITEMS[activeIndex]?.isCenter ? 0 : 1,
                        }}
                    />

                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        if (item.isCenter) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative -top-5 group"
                                >
                                    <div
                                        className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center text-white 
                                            shadow-lg transition-all duration-300
                                            bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                                            group-hover:scale-110 group-active:scale-95
                                            ${isActive ? "shadow-indigo-500/40 shadow-xl scale-105" : "shadow-indigo-500/25"}
                                        `}
                                    >
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[var(--text-muted)] whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex flex-col items-center gap-1 p-2 min-w-[56px] rounded-xl 
                                    transition-all duration-200 relative group
                                    ${isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}
                                `}
                            >
                                <div className={`
                                    relative transition-transform duration-200
                                    ${isActive ? "scale-110" : "group-hover:scale-105 group-active:scale-95"}
                                `}>
                                    <item.icon
                                        className={`w-6 h-6 transition-all duration-200 ${
                                            isActive ? "stroke-[2.5px]" : ""
                                        }`}
                                    />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-[var(--accent-primary)] opacity-20 blur-lg rounded-full" />
                                    )}
                                </div>
                                <span
                                    className={`
                                        text-[10px] transition-all duration-200
                                        ${isActive ? "font-semibold" : "font-medium"}
                                    `}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
