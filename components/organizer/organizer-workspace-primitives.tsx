import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/phase-two-shells";
import { MaterialSymbol } from "@/components/ui/material-symbol";
import { cn } from "@/lib/utils";

interface OrganizerWorkspaceHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    badge?: ReactNode;
    actions?: ReactNode;
    meta?: ReactNode;
}

export function OrganizerWorkspaceHeader({
    eyebrow,
    title,
    description,
    badge,
    actions,
    meta,
}: OrganizerWorkspaceHeaderProps) {
    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
            <div className="max-w-3xl space-y-4">
                {eyebrow && (
                    <span className="inline-flex rounded-full border border-(--border) bg-(--surface-elevated) px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-(--accent-primary)">
                        {eyebrow}
                    </span>
                )}
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
                    {badge}
                </div>
                {description && <p className="text-lg text-(--text-secondary) max-w-2xl">{description}</p>}
                {meta && <div className="flex flex-wrap items-center gap-2 text-sm text-(--text-secondary) mt-4">{meta}</div>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-3 pt-2">{actions}</div>}
        </div>
    );
}

interface OrganizerMetricCardProps {
    label: string;
    value: ReactNode;
    icon?: string; // Material symbols string
    lucideIcon?: LucideIcon; // Fallback
    trend?: ReactNode | {
        value: string;
        isPositive: boolean;
    };
    href?: string;
    meta?: ReactNode;
    tone?: "default" | "success" | "accent" | "warning" | "danger";
    className?: string;
}

const metricToneClasses = {
    default: {
        border: "border-(--border)",
        iconBg: "bg-(--surface-elevated)",
        iconFg: "text-(--text-secondary)",
        bar: "bg-(--border)",
    },
    success: {
        border: "border-[rgba(19,135,108,0.2)]",
        iconBg: "bg-(--success-bg)",
        iconFg: "text-(--success-text)",
        bar: "bg-(--success-text)",
    },
    accent: {
        border: "border-[rgba(41,179,182,0.2)]",
        iconBg: "bg-(--surface-brand-soft)",
        iconFg: "text-(--accent-primary)",
        bar: "bg-(--accent-primary)",
    },
    warning: {
        border: "border-[rgba(251,193,23,0.3)]",
        iconBg: "bg-(--warning-bg)",
        iconFg: "text-(--warning-text)",
        bar: "bg-(--warning-text)",
    },
    danger: {
        border: "border-[rgba(198,40,40,0.2)]",
        iconBg: "bg-(--error-bg)",
        iconFg: "text-(--error-text)",
        bar: "bg-(--error-text)",
    },
};

function isTrendObject(t: unknown): t is { value: string; isPositive: boolean } {
    return typeof t === "object" && t !== null && "isPositive" in t;
}

export function OrganizerMetricCard({
    label,
    value,
    icon,
    lucideIcon: LucideIconProp,
    trend,
    href,
    meta,
    tone = "default",
    className,
}: OrganizerMetricCardProps) {
    const toneStyles = metricToneClasses[tone];

    const cardContent = (
        <div className={cn("bg-(--surface) rounded-2xl p-6 shadow-sm border relative overflow-hidden group h-full flex flex-col justify-between", toneStyles.border, className)}>
            <div className={`absolute top-0 left-0 w-full h-1 transform origin-left transition-transform duration-300 ${toneStyles.bar}`}></div>
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", toneStyles.iconBg, toneStyles.iconFg)}>
                        {icon ? (
                             <MaterialSymbol name={icon} />
                        ) : LucideIconProp ? (
                             <LucideIconProp className="h-6 w-6" />
                        ) : null}
                    </div>
                    {trend && isTrendObject(trend) && (
                        <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                            trend.isPositive 
                                ? "bg-(--success-bg) text-(--success-text)" 
                                : "bg-(--error-bg) text-(--error-text)"
                        )}>
                            <MaterialSymbol name={trend.isPositive ? "trending_up" : "trending_down"} className="text-[14px]" />
                            {trend.value}
                        </span>
                    )}
                </div>
                <p className="text-(--text-muted) text-xs uppercase tracking-[0.16em] mb-1.5">{label}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{value}</h3>
            </div>
            {(meta || (trend && !isTrendObject(trend))) && (
                <div className="mt-4 pt-4 border-t border-(--border-light) space-y-1.5">
                    {meta && <p className="text-sm font-medium text-foreground">{meta}</p>}
                    {trend && !isTrendObject(trend) && (
                        <p className="text-sm leading-6 text-(--text-secondary)">{trend as ReactNode}</p>
                    )}
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full transition-transform hover:-translate-y-1">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

interface OrganizerPanelProps {
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function OrganizerPanel({
    title,
    description,
    action,
    children,
    className,
}: OrganizerPanelProps) {
    return (
        <div className={cn("bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden", className)}>
            {(title || description || action) && (
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="space-y-1">
                        {title && <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>}
                        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-0">
                {children}
            </div>
        </div>
    );
}

interface OrganizerSurfaceProps {
    children: ReactNode;
    className?: string;
}

export function OrganizerSurface({ children, className }: OrganizerSurfaceProps) {
    return (
        <div className={cn("rounded-3xl border border-(--border) bg-(--surface-elevated) p-4 shadow-(--shadow-xs)", className)}>
            {children}
        </div>
    );
}

interface OrganizerListItemProps {
    title: string;
    description?: ReactNode;
    icon?: LucideIcon;
    iconTone?: string;
    href?: string;
    meta?: ReactNode;
    end?: ReactNode;
    className?: string;
}

export function OrganizerListItem({
    title,
    description,
    icon: Icon,
    iconTone,
    href,
    meta,
    end,
    className,
}: OrganizerListItemProps) {
    const content = (
        <div className={cn("flex items-start gap-4 rounded-[1.25rem] border border-transparent bg-(--surface-elevated) px-4 py-4 transition-colors hover:border-(--border) hover:bg-(--surface)", className)}>
            {Icon ? (
                <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--border) bg-(--surface) text-(--accent-primary)", iconTone)}>
                    <Icon className="h-5 w-5" />
                </span>
            ) : null}
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{title}</p>
                    {meta ? <div className="text-xs text-(--text-muted)">{meta}</div> : null}
                </div>
                {description ? <div className="text-sm leading-6 text-(--text-secondary)">{description}</div> : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
                {end}
                {href ? <ChevronRight className="h-4 w-4 text-(--text-muted)" /> : null}
            </div>
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link href={href} className="block">
            {content}
        </Link>
    );
}

interface OrganizerStatusBadgeProps {
    tone?: "default" | "success" | "warning" | "danger" | "info";
    children: ReactNode;
    className?: string;
}

const badgeToneClasses: Record<NonNullable<OrganizerStatusBadgeProps["tone"]>, string> = {
    default: "border-(--border) bg-(--surface) text-(--text-secondary)",
    success: "border-[rgba(19,135,108,0.22)] bg-(--success-bg) text-(--success-text)",
    warning: "border-[rgba(251,193,23,0.28)] bg-(--warning-bg) text-(--warning-text)",
    danger: "border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] text-[rgb(185,28,28)]",
    info: "border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.08)] text-[rgb(29,78,216)]",
};

export function OrganizerStatusBadge({
    tone = "default",
    children,
    className,
}: OrganizerStatusBadgeProps) {
    return (
        <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", badgeToneClasses[tone], className)}>
            {children}
        </span>
    );
}

interface OrganizerInlineActionProps {
    href: string;
    children: ReactNode;
}

export function OrganizerInlineAction({ href, children }: OrganizerInlineActionProps) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary) transition-opacity hover:opacity-80"
        >
            {children}
            <ArrowRight className="h-4 w-4" />
        </Link>
    );
}

interface OrganizerWorkflowStepperProps {
    steps: Array<{
        id: number;
        title: string;
        icon: LucideIcon;
    }>;
    currentStep: number;
}

export function OrganizerWorkflowStepper({ steps, currentStep }: OrganizerWorkflowStepperProps) {
    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max items-start gap-3 sm:gap-4">
                {steps.map((step, index) => {
                    const isComplete = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex items-center gap-3 sm:gap-4">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <span
                                    className={cn(
                                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold shadow-(--shadow-xs) transition-colors",
                                        isComplete && "border-[rgba(19,135,108,0.22)] bg-(--success-bg) text-(--success-text)",
                                        isActive && "border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft) text-(--accent-primary)",
                                        !isComplete && !isActive && "border-(--border) bg-(--surface) text-(--text-muted)",
                                    )}
                                >
                                    {isComplete ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                </span>
                                <span className={cn("max-w-24 text-xs font-medium leading-5", currentStep >= step.id ? "text-foreground" : "text-(--text-muted)")}>
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 ? (
                                <span
                                    className={cn(
                                        "mt-6 hidden h-px w-10 rounded-full sm:block",
                                        isComplete ? "bg-(--success-text)" : "bg-(--border)",
                                    )}
                                />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface OrganizerWorkflowSidebarProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function OrganizerWorkflowSidebar({ title, description, children, className }: OrganizerWorkflowSidebarProps) {
    return (
        <OrganizerPanel title={title} description={description} className={cn("sticky top-6", className)}>
            <div className="space-y-4">{children}</div>
        </OrganizerPanel>
    );
}

interface OrganizerWorkflowFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
}

export function OrganizerWorkflowField({ label, hint, error, className, id, ...props }: OrganizerWorkflowFieldProps) {
    return (
        <label htmlFor={id} className="block space-y-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <input
                id={id}
                {...props}
                className={cn(
                    "w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--accent-primary)",
                    className,
                )}
            />
            {hint ? <span className="block text-xs leading-5 text-(--text-muted)">{hint}</span> : null}
            {error ? <span className="block text-xs leading-5 text-[rgb(185,28,28)]">{error}</span> : null}
        </label>
    );
}

interface OrganizerWorkflowTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
}

export function OrganizerWorkflowTextarea({ label, hint, error, className, id, ...props }: OrganizerWorkflowTextareaProps) {
    return (
        <label htmlFor={id} className="block space-y-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <textarea
                id={id}
                {...props}
                className={cn(
                    "w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--accent-primary)",
                    className,
                )}
            />
            {hint ? <span className="block text-xs leading-5 text-(--text-muted)">{hint}</span> : null}
            {error ? <span className="block text-xs leading-5 text-[rgb(185,28,28)]">{error}</span> : null}
        </label>
    );
}

interface OrganizerWorkflowSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
}

export function OrganizerWorkflowSelect({ label, hint, error, className, id, ...props }: OrganizerWorkflowSelectProps) {
    return (
        <label htmlFor={id} className="block space-y-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <select
                id={id}
                {...props}
                className={cn(
                    "w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-(--accent-primary)",
                    className,
                )}
            />
            {hint ? <span className="block text-xs leading-5 text-(--text-muted)">{hint}</span> : null}
            {error ? <span className="block text-xs leading-5 text-[rgb(185,28,28)]">{error}</span> : null}
        </label>
    );
}

interface OrganizerChoiceCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function OrganizerChoiceCard({ title, description, icon: Icon, selected = false, onClick, className }: OrganizerChoiceCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-start gap-3 rounded-[1.25rem] border p-4 text-left transition-colors",
                selected
                    ? "border-[rgba(41,179,182,0.3)] bg-(--surface-brand-soft) shadow-(--shadow-xs)"
                    : "border-(--border) bg-(--surface) hover:bg-(--surface-elevated)",
                className,
            )}
        >
            {Icon ? (
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--border) bg-(--surface-elevated) text-(--accent-primary)">
                    <Icon className="h-5 w-5" />
                </span>
            ) : null}
            <span className="space-y-1">
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="block text-sm leading-6 text-(--text-secondary)">{description}</span>
            </span>
        </button>
    );
}

export { EmptyState };

interface OrganizerHeroCardProps {
    title: ReactNode;
    description?: ReactNode;
    icon?: LucideIcon;
    actions?: ReactNode;
    aside?: ReactNode;
    className?: string;
}

export function OrganizerHeroCard({
    title,
    description,
    icon: Icon,
    actions,
    aside,
    className,
}: OrganizerHeroCardProps) {
    return (
        <section
            className={cn(
                "relative overflow-hidden rounded-3xl bg-(--accent-primary) p-6 text-white shadow-(--shadow-md) sm:p-8 lg:p-10",
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-6">
                    {Icon ? (
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-sm backdrop-blur">
                            <Icon className="h-6 w-6" />
                        </span>
                    ) : null}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">
                            {title}
                        </h2>
                        {description ? (
                            <div className="max-w-xl text-lg leading-relaxed text-teal-50/90">
                                {description}
                            </div>
                        ) : null}
                    </div>
                    {actions ? (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {actions}
                        </div>
                    ) : null}
                </div>
                {aside ? (
                    <div className="shrink-0 lg:w-[320px]">
                        {aside}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
