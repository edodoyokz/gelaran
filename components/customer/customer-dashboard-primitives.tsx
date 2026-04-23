import type { ReactNode } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Bell,
    Inbox,
    type LucideIcon,
} from "lucide-react";
import {
    DashboardPageHeader,
    DashboardSection,
    EmptyState,
    StatsCard,
} from "@/components/shared/phase-two-shells";
import { cn } from "@/lib/utils";

export {
    DashboardPageHeader,
    DashboardSection,
    EmptyState,
    StatsCard,
};

interface CustomerHeroProps {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    meta?: ReactNode;
    className?: string;
}

export function CustomerHero({
    eyebrow,
    title,
    description,
    actions,
    meta,
    className,
}: CustomerHeroProps) {
    return (
        <section
            className={cn(
                "relative overflow-hidden rounded-[2rem] border border-[rgba(1,89,89,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,249,248,0.92))] p-6 shadow-[0_20px_60px_rgba(1,89,89,0.08)] backdrop-blur sm:p-8 lg:p-10 dark:border-[rgba(78,222,225,0.12)] dark:bg-[linear-gradient(180deg,rgba(22,22,29,0.96),rgba(16,28,29,0.94))]",
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(41,179,182,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,93,0,0.12),transparent_24%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(1,89,89,0.16),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(78,222,225,0.18),transparent)]" />
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 translate-x-1/4 -translate-y-1/4 rounded-full bg-(--surface-brand-soft) blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                    {eyebrow ? (
                        <span className="inline-flex rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-(--accent-primary) shadow-(--shadow-xs)">
                            {eyebrow}
                        </span>
                    ) : null}
                    <div className="space-y-3">
                        <h1 className="font-(--font-editorial) text-3xl tracking-(--tracking-display) text-foreground sm:text-4xl">
                            {title}
                        </h1>
                        {description ? (
                            <div className="max-w-2xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                {description}
                            </div>
                        ) : null}
                    </div>
                    {meta ? <div className="flex flex-wrap gap-2.5">{meta}</div> : null}
                </div>
                {actions ? (
                    <div className="flex flex-wrap items-center gap-3 lg:max-w-sm lg:justify-end">{actions}</div>
                ) : null}
            </div>
        </section>
    );
}

interface CustomerMetricGridProps {
    children: ReactNode;
    className?: string;
}

export function CustomerMetricGrid({ children, className }: CustomerMetricGridProps) {
    return (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5", className)}>
            {children}
        </div>
    );
}

interface CustomerStatusBadgeProps {
    label: string;
    tone?: "neutral" | "accent" | "success" | "warning" | "danger";
    icon?: LucideIcon;
    className?: string;
}

const badgeToneClasses: Record<NonNullable<CustomerStatusBadgeProps["tone"]>, string> = {
    neutral: "border-(--border) bg-white/82 text-(--text-secondary) dark:bg-(--surface-elevated)",
    accent: "border-[rgba(41,179,182,0.16)] bg-[rgba(41,179,182,0.08)] text-(--accent-primary)",
    success: "border-[rgba(19,135,108,0.18)] bg-(--success-bg) text-(--success-text)",
    warning: "border-[rgba(251,193,23,0.24)] bg-(--warning-bg) text-(--warning-text)",
    danger: "border-[rgba(198,40,40,0.16)] bg-(--error-bg) text-(--error-text)",
};

export function CustomerStatusBadge({
    label,
    tone = "neutral",
    icon: Icon,
    className,
}: CustomerStatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.02em] shadow-[0px_6px_18px_rgba(0,32,32,0.03)]",
                badgeToneClasses[tone],
                className,
            )}
        >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {label}
        </span>
    );
}

interface CustomerInfoListProps {
    items: Array<{
        icon?: LucideIcon;
        label: string;
        value: ReactNode;
    }>;
    columns?: 1 | 2;
    className?: string;
}

export function CustomerInfoList({
    items,
    columns = 1,
    className,
}: CustomerInfoListProps) {
    return (
        <div
            className={cn(
                "grid gap-3",
                columns === 2 && "md:grid-cols-2",
                className,
            )}
        >
            {items.map(({ icon: Icon, label, value }) => (
                <div
                    key={label}
                    className="flex items-start gap-3 rounded-[1.5rem] border border-(--border-light) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.9))] p-4 shadow-[0px_10px_30px_rgba(1,89,89,0.04)] dark:bg-(--surface-elevated)"
                >
                    {Icon ? (
                        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                            <Icon className="h-4 w-4" />
                        </span>
                    ) : null}
                    <div className="min-w-0 space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--text-muted)">
                            {label}
                        </p>
                        <div className="text-sm leading-6 text-foreground">{value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface CustomerActionCardProps {
    title: string;
    description: string;
    href: string;
    icon?: LucideIcon;
    actionLabel?: string;
    className?: string;
}

export function CustomerActionCard({
    title,
    description,
    href,
    icon: Icon = Bell,
    actionLabel = "Lihat detail",
    className,
}: CustomerActionCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex h-full flex-col justify-between rounded-[1.85rem] border border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,249,248,0.94))] p-5 shadow-[0_18px_42px_rgba(1,89,89,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(1,89,89,0.1)] dark:bg-[linear-gradient(180deg,rgba(26,26,36,0.96),rgba(18,30,31,0.92))]",
                className,
            )}
        >
            <div className="space-y-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                    <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm leading-6 text-(--text-secondary)">{description}</p>
                </div>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary)">
                {actionLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
}

interface CustomerEmptyStateProps {
    title: string;
    description: string;
    href?: string;
    ctaLabel?: string;
    icon?: LucideIcon;
    className?: string;
}

export function CustomerEmptyState({
    title,
    description,
    href,
    ctaLabel,
    icon = Inbox,
    className,
}: CustomerEmptyStateProps) {
    return (
        <EmptyState
            title={title}
            description={description}
            icon={icon}
            className={className}
            action={
                href && ctaLabel ? (
                    <Link
                        href={href}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) transition-transform duration-200 hover:-translate-y-0.5"
                    >
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : undefined
            }
        />
    );
}
