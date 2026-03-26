"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    Calendar,
    ChevronRight,
    CreditCard,
    HelpCircle,
    LayoutDashboard,
    MessageCircle,
    ScanLine,
    Settings,
    ShieldCheck,
    Ticket,
    User,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Settings,
    ScanLine,
    Wallet,
    BookOpen,
    Ticket,
    User,
    HelpCircle,
    MessageCircle,
    ShieldCheck,
};

export interface DocsSidebarItem {
    title: string;
    href: string;
    iconName?: string;
}

interface DocsSidebarProps {
    items: DocsSidebarItem[];
    title?: string;
}

export function DocsSidebar({ items, title }: DocsSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-80 lg:shrink-0">
            <div className="lg:sticky lg:top-28">
                <div className="rounded-[1.75rem] border border-(--border) bg-(--surface)/96 p-5 shadow-(--shadow-md) sm:p-6">
                    <div className="space-y-6">
                        {title ? (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                    {title}
                                </p>
                                <p className="text-sm leading-6 text-(--text-secondary)">
                                    Navigate the operational guidance and role-specific workflows in this section.
                                </p>
                            </div>
                        ) : null}

                        <nav className="space-y-2" aria-label={title ?? "Documentation navigation"}>
                            {items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.iconName ? iconMap[item.iconName] : null;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "border-[rgba(41,179,182,0.24)] bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)"
                                                : "border-transparent text-(--text-secondary) hover:border-(--border) hover:bg-(--surface-elevated) hover:text-foreground",
                                        )}
                                    >
                                        {Icon ? (
                                            <span
                                                className={cn(
                                                    "inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-(--shadow-xs)",
                                                    isActive
                                                        ? "border-[rgba(41,179,182,0.16)] bg-white text-(--accent-primary)"
                                                        : "border-(--border) bg-(--surface) text-(--text-muted)",
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                        ) : null}
                                        <span className="flex-1">{item.title}</span>
                                        <ChevronRight
                                            className={cn(
                                                "h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5",
                                                isActive ? "text-(--accent-primary)" : "text-(--text-muted)",
                                            )}
                                        />
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="rounded-3xl border border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft) p-4 shadow-(--shadow-sm)">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-primary)">
                                    Need support?
                                </p>
                                <h3 className="text-base font-semibold text-foreground">Use the customer support guide for escalation paths</h3>
                                <p className="text-sm leading-6 text-(--text-secondary)">
                                    The support section summarizes common recovery steps, ticket help, and when to hand off an issue to the Gelaran team.
                                </p>
                            </div>
                            <Link
                                href="/docs/customer/support"
                                className="mt-4 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)"
                            >
                                Open support guide
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
