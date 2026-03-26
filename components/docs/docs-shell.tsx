import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/phase-two-shells";

interface DocsHeroProps {
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
    meta?: ReactNode;
}

export function DocsHero({ eyebrow, title, description, actions, meta }: DocsHeroProps) {
    return (
        <section className="rounded-4xl border border-(--border) bg-(--surface)/96 p-6 shadow-(--shadow-lg) sm:p-8 lg:p-10">
            <SectionHeader
                eyebrow={eyebrow}
                title={title}
                description={description}
                action={actions}
                className="gap-6"
            />
            {meta ? <div className="mt-6 border-t border-(--border-light) pt-6">{meta}</div> : null}
        </section>
    );
}

interface DocsStatProps {
    label: string;
    value: string;
    description: string;
}

export function DocsStat({ label, value, description }: DocsStatProps) {
    return (
        <article className="rounded-3xl border border-(--border) bg-(--surface-elevated) p-5 shadow-(--shadow-sm)">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-(--tracking-heading) text-foreground sm:text-3xl">{value}</p>
            <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{description}</p>
        </article>
    );
}

interface DocsSectionProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function DocsSection({ title, description, action, children, className }: DocsSectionProps) {
    return (
        <section className={cn("rounded-[1.75rem] border border-(--border) bg-(--surface)/96 p-6 shadow-(--shadow-md) sm:p-8", className)}>
            <div className="mb-6 flex flex-col gap-3 border-b border-(--border-light) pb-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-(--tracking-heading) text-foreground sm:text-2xl">{title}</h2>
                    {description ? <p className="max-w-3xl text-sm leading-7 text-(--text-secondary)">{description}</p> : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </div>
            {children}
        </section>
    );
}

interface DocsLinkCardProps {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone?: "admin" | "organizer" | "customer" | "neutral";
    badge?: string;
}

const toneClassNames: Record<NonNullable<DocsLinkCardProps["tone"]>, string> = {
    admin: "border-[rgba(41,179,182,0.24)] bg-(--surface-brand-soft) text-(--accent-primary)",
    organizer: "border-[rgba(99,102,241,0.22)] bg-[rgba(99,102,241,0.08)] text-indigo-600",
    customer: "border-[rgba(19,135,108,0.22)] bg-(--success-bg) text-emerald-600",
    neutral: "border-(--border) bg-(--surface-elevated) text-foreground",
};

export function DocsLinkCard({
    href,
    title,
    description,
    icon: Icon,
    tone = "neutral",
    badge,
}: DocsLinkCardProps) {
    return (
        <Link
            href={href}
            className="group flex h-full flex-col justify-between rounded-[1.75rem] border border-(--border) bg-(--surface)/96 p-6 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-lg)"
        >
            <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl border shadow-(--shadow-xs)", toneClassNames[tone])}>
                        <Icon className="h-5 w-5" />
                    </span>
                    {badge ? (
                        <span className="rounded-full border border-(--border) bg-(--surface-elevated) px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                            {badge}
                        </span>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm leading-7 text-(--text-secondary)">{description}</p>
                </div>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-(--accent-primary)">
                Open guide
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
}

interface DocsChecklistProps {
    items: string[];
    className?: string;
}

export function DocsChecklist({ items, className }: DocsChecklistProps) {
    return (
        <ol className={cn("grid gap-3", className)}>
            {items.map((item, index) => (
                <li
                    key={`${index}-${item}`}
                    className="flex items-start gap-4 rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-4 text-sm leading-7 text-(--text-secondary)"
                >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--surface-brand-soft) text-xs font-semibold text-(--accent-primary)">
                        {index + 1}
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ol>
    );
}

interface DocsCalloutProps {
    title: string;
    description: string;
    href?: string;
    ctaLabel?: string;
}

export function DocsCallout({ title, description, href, ctaLabel }: DocsCalloutProps) {
    return (
        <div className="rounded-[1.75rem] border border-[rgba(41,179,182,0.24)] bg-(--surface-brand-soft) p-5 shadow-(--shadow-sm) sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="max-w-2xl text-sm leading-7 text-(--text-secondary)">{description}</p>
                </div>
                {href && ctaLabel ? (
                    <Link
                        href={href}
                        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)"
                    >
                        {ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
