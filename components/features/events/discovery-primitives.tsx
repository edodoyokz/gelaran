import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DiscoveryPageShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(245,249,248,0.96)_30%,rgba(237,244,243,0.98)_100%)] text-foreground",
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-[radial-gradient(circle_at_top_left,rgba(251,193,23,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(41,179,182,0.14),transparent_36%)]" />
            <div className="relative">{children}</div>
        </div>
    );
}

export function DiscoveryContainer({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function DiscoveryHero({
    eyebrow,
    title,
    description,
    children,
    className,
}: {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pb-16", className)}>
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:gap-10">
                <div className="space-y-5">
                    {eyebrow ? (
                        <div className="inline-flex rounded-full border border-(--border) bg-white/82 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-(--accent-primary) shadow-(--shadow-xs) backdrop-blur-sm">
                            {eyebrow}
                        </div>
                    ) : null}
                    <div className="space-y-4">
                        <h1 className="max-w-4xl font-(--font-editorial) text-4xl leading-[0.94] tracking-(--tracking-display) text-foreground sm:text-5xl lg:text-6xl">
                            {title}
                        </h1>
                        {description ? (
                            <div className="max-w-3xl text-sm leading-7 text-(--text-secondary) sm:text-base">{description}</div>
                        ) : null}
                    </div>
                </div>
                {children ? <div className="lg:justify-self-end">{children}</div> : null}
            </div>
        </section>
    );
}

export function DiscoveryPanel({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "rounded-[calc(var(--radius-3xl)+0.25rem)] border border-(--border) bg-[rgba(255,255,255,0.82)] shadow-(--shadow-lg) backdrop-blur-xl",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function DiscoverySection({
    title,
    description,
    action,
    children,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("space-y-5", className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <h2 className="font-(--font-editorial) text-2xl leading-tight tracking-(--tracking-heading) text-foreground sm:text-3xl">
                        {title}
                    </h2>
                    {description ? <p className="max-w-3xl text-sm leading-7 text-(--text-secondary)">{description}</p> : null}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function DiscoveryMetaItem({
    icon: Icon,
    label,
    value,
    tone = "default",
}: {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    tone?: "default" | "accent" | "warm";
}) {
    const toneClassName =
        tone === "accent"
            ? "bg-(--surface-brand-soft) text-(--accent-primary)"
            : tone === "warm"
                ? "bg-(--warning-bg) text-(--warning-text)"
                : "bg-(--surface-muted) text-(--text-secondary)";

    return (
        <div className="flex items-start gap-3 rounded-2xl border border-(--border) bg-white/80 p-4 shadow-(--shadow-xs)">
            <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", toneClassName)}>
                <Icon className="h-5 w-5" />
            </span>
            <div className="space-y-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">{label}</p>
                <div className="text-sm leading-6 text-foreground sm:text-base">{value}</div>
            </div>
        </div>
    );
}

export function DiscoveryStat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
    return (
        <div className="rounded-2xl border border-(--border) bg-white/76 p-4 shadow-(--shadow-xs)">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-(--text-muted)">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">{value}</p>
            {hint ? <p className="mt-1 text-sm text-(--text-secondary)">{hint}</p> : null}
        </div>
    );
}

export function DiscoveryBadge({
    children,
    tone = "default",
    className,
}: {
    children: ReactNode;
    tone?: "default" | "accent" | "warm" | "success" | "dark";
    className?: string;
}) {
    const toneClassName =
        tone === "accent"
            ? "border-[rgba(41,179,182,0.22)] bg-[rgba(41,179,182,0.12)] text-(--accent-primary)"
            : tone === "warm"
                ? "border-[rgba(251,193,23,0.28)] bg-[rgba(251,193,23,0.18)] text-(--warning-text)"
                : tone === "success"
                    ? "border-[rgba(19,135,108,0.22)] bg-[rgba(19,135,108,0.12)] text-(--success-text)"
                    : tone === "dark"
                        ? "border-white/18 bg-[rgba(7,21,21,0.46)] text-white"
                        : "border-(--border) bg-white/74 text-(--text-secondary)";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm",
                toneClassName,
                className,
            )}
        >
            {children}
        </span>
    );
}

export function DiscoveryLinkRow({
    href,
    label,
}: {
    href: string;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary) transition-colors duration-200 hover:text-(--accent-primary-hover)"
        >
            {label}
            <ChevronRight className="h-4 w-4" />
        </Link>
    );
}

export function DiscoveryFaqList({
    items,
    expandedId,
    onToggle,
}: {
    items: Array<{ id: string; question: string; answer: string }>;
    expandedId?: string | null;
    onToggle?: (id: string) => void;
}) {
    return (
        <div className="space-y-3">
            {items.map((item, index) => {
                const isExpanded = expandedId ? expandedId === item.id : true;

                return (
                    <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-(--border) bg-white/84 shadow-(--shadow-xs)">
                        <button
                            type="button"
                            onClick={onToggle ? () => onToggle(item.id) : undefined}
                            className={cn(
                                "flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6",
                                onToggle ? "transition-colors duration-200 hover:bg-(--surface-hover)" : "cursor-default",
                            )}
                        >
                            <div className="space-y-2">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-(--text-muted)">Pertanyaan {index + 1}</p>
                                <h3 className="text-base font-semibold leading-7 text-foreground sm:text-lg">{item.question}</h3>
                            </div>
                            {onToggle ? (
                                <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border) bg-white text-(--text-secondary)">
                                    <span className="text-xl leading-none">{isExpanded ? "−" : "+"}</span>
                                </span>
                            ) : null}
                        </button>
                        {isExpanded ? (
                            <div className="border-t border-(--border) px-5 pb-5 pt-4 text-sm leading-7 text-(--text-secondary) sm:px-6 sm:text-base">
                                <p className="whitespace-pre-wrap">{item.answer}</p>
                            </div>
                        ) : null}
                    </article>
                );
            })}
        </div>
    );
}
