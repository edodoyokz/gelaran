import type { ReactNode } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    type LucideIcon,
} from "lucide-react";
import {
    DashboardContent,
    DashboardPageHeader,
    DashboardSection,
    EmptyState,
    StatsCard,
} from "@/components/shared/phase-two-shells";
import { cn } from "@/lib/utils";

interface AdminWorkspacePageProps {
    eyebrow?: string;
    title: string;
    description: string;
    children: ReactNode;
    actions?: ReactNode;
    backHref?: string;
    width?: "default" | "wide" | "full";
}

export function AdminWorkspacePage({
    eyebrow,
    title,
    description,
    children,
    actions,
    backHref,
    width = "wide",
}: AdminWorkspacePageProps) {
    return (
        <DashboardContent width={width}>
            <DashboardPageHeader
                eyebrow={eyebrow ?? "Admin workspace"}
                title={title}
                description={description}
                actions={
                    backHref ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href={backHref}
                                className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)"
                            >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                                Back
                            </Link>
                            {actions}
                        </div>
                    ) : actions
                }
            />
            <div className="mt-6 space-y-6">{children}</div>
        </DashboardContent>
    );
}

interface AdminMetricCardProps {
    label: string;
    value: ReactNode;
    icon: LucideIcon;
    href?: string;
    meta?: ReactNode;
    trend?: string;
    tone?: "default" | "accent" | "success" | "warning";
}

export function AdminMetricCard({ href, ...props }: AdminMetricCardProps) {
    const card = (
        <StatsCard
            label={props.label}
            value={props.value}
            icon={props.icon}
            meta={props.meta}
            trend={props.trend}
            tone={props.tone}
            className={cn(href && "h-full")}
        />
    );

    if (!href) {
        return card;
    }

    return (
        <Link href={href} className="group block h-full">
            <div className="relative h-full">
                {card}
                <ArrowUpRight className="pointer-events-none absolute right-5 top-5 h-4 w-4 text-(--text-muted) transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--accent-primary)" />
            </div>
        </Link>
    );
}

interface AdminActionCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
}

export function AdminActionCard({
    title,
    description,
    href,
    icon: Icon,
    badge,
}: AdminActionCardProps) {
    return (
        <Link
            href={href}
            className="group rounded-3xl border border-(--border) bg-(--surface)/94 p-5 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(41,179,182,0.28)] hover:shadow-(--shadow-md)"
        >
            <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                    <Icon className="h-5 w-5" />
                </span>
                {badge ? (
                    <span className="rounded-full border border-(--border) bg-(--surface-elevated) px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                        {badge}
                    </span>
                ) : null}
            </div>
            <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <ArrowRight className="h-4 w-4 text-(--text-muted) transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-(--accent-primary)" />
                </div>
                <p className="text-sm leading-6 text-(--text-secondary)">{description}</p>
            </div>
        </Link>
    );
}

interface AdminNoticeProps {
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
    tone?: "info" | "warning" | "success";
}

const noticeToneClassNames: Record<NonNullable<AdminNoticeProps["tone"]>, string> = {
    info: "border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft)",
    warning: "border-[rgba(251,193,23,0.28)] bg-(--warning-bg)",
    success: "border-[rgba(19,135,108,0.22)] bg-(--success-bg)",
};

const noticeIcons: Record<NonNullable<AdminNoticeProps["tone"]>, LucideIcon> = {
    info: Clock3,
    warning: Clock3,
    success: CheckCircle2,
};

export function AdminNotice({
    title,
    description,
    actionHref,
    actionLabel,
    tone = "info",
}: AdminNoticeProps) {
    const Icon = noticeIcons[tone];

    return (
        <section
            className={cn(
                "rounded-3xl border p-5 shadow-(--shadow-sm) sm:p-6",
                noticeToneClassNames[tone],
            )}
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-(--surface) text-(--accent-primary) shadow-(--shadow-xs)">
                        <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold text-foreground">{title}</h2>
                        <p className="max-w-2xl text-sm leading-6 text-(--text-secondary)">{description}</p>
                    </div>
                </div>
                {actionHref && actionLabel ? (
                    <Link
                        href={actionHref}
                        className="inline-flex items-center gap-2 self-start rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)"
                    >
                        {actionLabel}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : null}
            </div>
        </section>
    );
}

interface AdminSurfaceProps {
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function AdminSurface({
    title,
    description,
    action,
    children,
    className,
}: AdminSurfaceProps) {
    return (
        <DashboardSection className={className}>
            {(title || description || action) ? (
                <div className="mb-5 flex flex-col gap-3 border-b border-(--border-light) pb-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
                        {description ? <p className="text-sm leading-6 text-(--text-secondary)">{description}</p> : null}
                    </div>
                    {action ? <div className="shrink-0">{action}</div> : null}
                </div>
            ) : null}
            {children}
        </DashboardSection>
    );
}

interface AdminFilterBarProps {
    children: ReactNode;
    className?: string;
}

export function AdminFilterBar({ children, className }: AdminFilterBarProps) {
    return (
        <div className={cn("rounded-3xl border border-(--border) bg-(--surface)/94 p-4 shadow-(--shadow-sm)", className)}>
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">{children}</div>
        </div>
    );
}

interface AdminDataTableProps {
    columns: string[];
    children: ReactNode;
    emptyTitle: string;
    emptyDescription: string;
    hasRows: boolean;
}

export function AdminDataTable({
    columns,
    children,
    emptyTitle,
    emptyDescription,
    hasRows,
}: AdminDataTableProps) {
    if (!hasRows) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                className="rounded-3xl"
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-(--border) bg-(--surface) shadow-(--shadow-sm)">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-(--border-light)">
                    <thead className="bg-(--surface-elevated)">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-light)">{children}</tbody>
                </table>
            </div>
        </div>
    );
}

export function AdminStatusBadge({
    label,
    tone = "default",
}: {
    label: string;
    tone?: "default" | "success" | "warning" | "danger" | "accent";
}) {
    const toneClassName = {
        default: "border-(--border) bg-(--surface-elevated) text-(--text-secondary)",
        success: "border-[rgba(19,135,108,0.2)] bg-(--success-bg) text-(--success)",
        warning: "border-[rgba(251,193,23,0.28)] bg-(--warning-bg) text-(--warning-text)",
        danger: "border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] text-[rgb(185,28,28)]",
        accent: "border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft) text-(--accent-primary)",
    }[tone];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                toneClassName,
            )}
        >
            {label}
        </span>
    );
}
