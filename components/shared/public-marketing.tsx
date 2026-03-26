import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { PublicLayout, SectionHeader, StatsCard } from "@/components/shared/phase-two-shells";
import { cn } from "@/lib/utils";

interface PublicPageShellProps {
    children: ReactNode;
    hero?: ReactNode;
    intro?: ReactNode;
    className?: string;
    contentClassName?: string;
}

export function PublicPageShell({
    children,
    hero,
    intro,
    className,
    contentClassName,
}: PublicPageShellProps) {
    return (
        <PublicLayout className={cn("overflow-hidden", className)} mainClassName="pt-20 sm:pt-24">
            <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-[radial-gradient(circle_at_top_left,rgba(251,193,23,0.16),transparent_36%),radial-gradient(circle_at_top_right,rgba(41,179,182,0.12),transparent_34%)]" />
                <div className={cn("relative", contentClassName)}>
                    {hero}
                    {intro}
                    {children}
                </div>
            </div>
        </PublicLayout>
    );
}

interface MarketingHeroProps {
    eyebrow?: string;
    title: ReactNode;
    description: ReactNode;
    primaryCta?: {
        href: string;
        label: string;
    };
    secondaryCta?: {
        href: string;
        label: string;
    };
    aside?: ReactNode;
    stats?: Array<{
        label: string;
        value: ReactNode;
        tone?: "default" | "accent" | "success" | "warning";
    }>;
    className?: string;
}

export function MarketingHero({
    eyebrow,
    title,
    description,
    primaryCta,
    secondaryCta,
    aside,
    stats,
    className,
}: MarketingHeroProps) {
    return (
        <section className={cn("px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20", className)}>
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:items-end lg:gap-14">
                <div className="space-y-8">
                    <div className="space-y-5">
                        {eyebrow ? (
                            <span className="inline-flex rounded-full border border-(--border) bg-(--surface)/88 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-(--accent-primary) shadow-(--shadow-xs) backdrop-blur">
                                {eyebrow}
                            </span>
                        ) : null}
                        <div className="space-y-4">
                            <h1 className="max-w-4xl font-(--font-editorial) text-5xl leading-[0.92] tracking-(--tracking-display) text-foreground sm:text-6xl lg:text-7xl">
                                {title}
                            </h1>
                            <div className="max-w-2xl text-base leading-8 text-(--text-secondary) sm:text-lg">
                                {description}
                            </div>
                        </div>
                    </div>

                    {(primaryCta || secondaryCta) ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            {primaryCta ? (
                                <Link
                                    href={primaryCta.href}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-md) transition-transform duration-200 hover:-translate-y-0.5 hover:bg-(--accent-secondary-hover)"
                                >
                                    {primaryCta.label}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : null}
                            {secondaryCta ? (
                                <Link
                                    href={secondaryCta.href}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-(--border) bg-(--surface)/90 px-6 py-3 text-sm font-semibold text-foreground shadow-(--shadow-xs) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                                >
                                    {secondaryCta.label}
                                </Link>
                            ) : null}
                        </div>
                    ) : null}

                    {stats?.length ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <StatsCard
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                    tone={stat.tone ?? "default"}
                                    className="h-full bg-(--surface)/88 backdrop-blur"
                                />
                            ))}
                        </div>
                    ) : null}
                </div>

                {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
            </div>
        </section>
    );
}

interface EditorialPanelProps {
    children: ReactNode;
    className?: string;
}

export function EditorialPanel({ children, className }: EditorialPanelProps) {
    return (
        <div
            className={cn(
                "rounded-[calc(var(--radius-3xl)+0.5rem)] border border-(--border) bg-[rgba(255,255,255,0.82)] p-6 shadow-(--shadow-lg) backdrop-blur-xl sm:p-8",
                className,
            )}
        >
            {children}
        </div>
    );
}

interface PublicSectionProps {
    eyebrow?: string;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    align?: "left" | "center";
    action?: ReactNode;
}

export function PublicSection({
    eyebrow,
    title,
    description,
    children,
    className,
    contentClassName,
    align = "left",
    action,
}: PublicSectionProps) {
    return (
        <section className={cn("px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20", className)}>
            <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
                <SectionHeader
                    eyebrow={eyebrow}
                    title={title}
                    description={description}
                    align={align}
                    action={action}
                />
                <div className={contentClassName}>{children}</div>
            </div>
        </section>
    );
}

interface FeatureItem {
    icon: LucideIcon;
    title: string;
    description: string;
    meta?: string;
}

interface FeatureGridProps {
    items: FeatureItem[];
    columns?: 2 | 3 | 4;
    className?: string;
}

export function FeatureGrid({ items, columns = 3, className }: FeatureGridProps) {
    const columnClassName =
        columns === 4
            ? "md:grid-cols-2 xl:grid-cols-4"
            : columns === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 xl:grid-cols-3";

    return (
        <div className={cn("grid gap-5", columnClassName, className)}>
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <article
                        key={item.title}
                        className="group rounded-2xl border border-(--border) bg-(--surface)/92 p-6 shadow-(--shadow-sm) transition-transform duration-200 hover:-translate-y-1"
                    >
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="mt-5 space-y-2">
                            <h3 className="text-xl font-semibold tracking-(--tracking-heading) text-foreground">
                                {item.title}
                            </h3>
                            <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">
                                {item.description}
                            </p>
                            {item.meta ? (
                                <p className="pt-2 text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                    {item.meta}
                                </p>
                            ) : null}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

interface InfoCardProps {
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
    href?: string | null;
    className?: string;
}

export function InfoCard({ label, value, icon: Icon, href, className }: InfoCardProps) {
    const content = (
        <div className={cn("rounded-2xl border border-(--border) bg-(--surface)/92 p-5 shadow-(--shadow-sm)", className)}>
            <div className="flex items-start gap-4">
                {Icon ? (
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                        <Icon className="h-5 w-5" />
                    </span>
                ) : null}
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">{label}</p>
                    <div className="text-sm leading-7 text-foreground sm:text-base">{value}</div>
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block transition-transform duration-200 hover:-translate-y-0.5"
            >
                {content}
            </a>
        );
    }

    return content;
}

interface TextContentSectionProps {
    eyebrow?: string;
    title: string;
    updatedAt?: string;
    summary?: ReactNode;
    children: ReactNode;
}

export function TextContentSection({
    eyebrow,
    title,
    updatedAt,
    summary,
    children,
}: TextContentSectionProps) {
    return (
        <PublicPageShell
            hero={
                <section className="px-4 pb-6 pt-10 sm:px-6 sm:pt-14 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <EditorialPanel className="space-y-6 p-8 sm:p-10">
                            <div className="space-y-4">
                                {eyebrow ? (
                                    <span className="inline-flex rounded-full border border-(--border) bg-(--surface-brand-soft) px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-(--accent-primary)">
                                        {eyebrow}
                                    </span>
                                ) : null}
                                <div className="space-y-3">
                                    <h1 className="font-(--font-editorial) text-4xl leading-[0.96] tracking-(--tracking-display) text-foreground sm:text-5xl">
                                        {title}
                                    </h1>
                                    {updatedAt ? (
                                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--text-muted)">
                                            Last updated {updatedAt}
                                        </p>
                                    ) : null}
                                </div>
                                {summary ? (
                                    <div className="max-w-3xl text-base leading-8 text-(--text-secondary) sm:text-lg">
                                        {summary}
                                    </div>
                                ) : null}
                            </div>
                        </EditorialPanel>
                    </div>
                </section>
            }
        >
            <section className="px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-20">
                <div className="mx-auto max-w-4xl">
                    <EditorialPanel className="p-8 sm:p-10 lg:p-12">
                        <div className="public-richtext">{children}</div>
                    </EditorialPanel>
                </div>
            </section>
        </PublicPageShell>
    );
}
