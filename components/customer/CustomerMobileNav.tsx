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
            <div className="safe-area-pb border-t border-[rgba(1,89,89,0.08)] bg-white/92 shadow-[0_-18px_40px_rgba(1,89,89,0.08)] backdrop-blur-xl dark:border-[rgba(78,222,225,0.12)] dark:bg-[#101818]/92">
                <div className="relative flex items-center justify-around px-2 py-2.5">
                    <div
                        className="absolute bottom-0 h-0.5 rounded-full bg-linear-to-r from-[#015959] to-[#29B3B6] transition-all duration-300 ease-out"
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
                                            w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white
                                            shadow-(--shadow-glow) transition-all duration-300
                                            bg-(--accent-gradient)
                                            group-hover:scale-110 group-active:scale-95
                                            ${isActive ? "scale-105" : ""}
                                        `}
                                    >
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[var(--text-muted)]">
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
