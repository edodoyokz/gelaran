import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, MapPin, ShieldCheck, type LucideIcon } from "lucide-react";
import { PublicLayout, SectionHeader } from "@/components/shared/phase-two-shells";
import { publicAuthSurface } from "@/components/shared/public-auth-tokens";
import { EditorialPanel } from "@/components/shared/public-marketing";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CheckoutPageShellProps {
    children: ReactNode;
    title: string;
    description: string;
    eyebrow?: string;
    backHref?: string;
    backLabel?: string;
    aside?: ReactNode;
}

export function CheckoutPageShell({
    children,
    title,
    description,
    eyebrow = "Gelaran checkout",
    backHref,
    backLabel = "Kembali ke event",
    aside,
}: CheckoutPageShellProps) {
    return (
        <PublicLayout withFooter={false} className="overflow-hidden" mainClassName="pt-20 sm:pt-24">
            <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-144 bg-[radial-gradient(circle_at_top_left,rgba(251,193,23,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(41,179,182,0.18),transparent_32%),linear-gradient(180deg,rgba(226,255,254,0.85),rgba(255,255,255,0))]" />
                <div className="pointer-events-none absolute inset-x-0 top-24 h-64 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]" />
                <section className="relative px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
                    <div className="mx-auto max-w-[96rem] space-y-8 sm:space-y-10">
                        <div className="space-y-6">
                            {backHref ? (
                                <Link
                                    href={backHref}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-(--border) bg-white/88 px-4 py-2 text-sm font-semibold text-foreground shadow-(--shadow-xs) backdrop-blur transition-colors duration-200 hover:border-(--border-strong) hover:bg-white"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {backLabel}
                                </Link>
                            ) : null}

                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end lg:gap-12">
                                <div className="space-y-4">
                                    <SectionHeader
                                        eyebrow={eyebrow}
                                        title={title}
                                        description={description}
                                        className="gap-3"
                                    />
                                </div>
                                {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
                            </div>
                        </div>

                        {children}
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}

interface CheckoutCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

export function CheckoutCard({
    title,
    description,
    icon: Icon,
    children,
    className,
    headerAction,
}: CheckoutCardProps) {
    return (
        <EditorialPanel className={cn("rounded-[calc(var(--radius-2xl)+0.5rem)] border-[rgba(111,121,120,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,252,251,0.92))] p-5 sm:p-6", className)}>
            <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            {Icon ? (
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(167,236,235,0.72)] text-(--accent-primary) shadow-(--shadow-xs)">
                                    <Icon className="h-5 w-5" />
                                </span>
                            ) : null}
                            <div>
                                <h2 className="font-(--font-editorial) text-2xl leading-none tracking-(--tracking-display) text-foreground sm:text-[2rem]">
                                    {title}
                                </h2>
                                {description ? (
                                    <p className="mt-1 text-sm leading-6 text-(--text-secondary)">{description}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
                </div>
                {children}
            </div>
        </EditorialPanel>
    );
}

interface CheckoutSectionHeadingProps {
    step: number;
    title: string;
    description?: string;
}

export function CheckoutSectionHeading({ step, title, description }: CheckoutSectionHeadingProps) {
    return (
        <div className="flex items-start gap-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(167,236,235,0.86)] text-sm font-bold text-(--accent-primary) shadow-(--shadow-xs)">
                {step}
            </span>
            <div className="space-y-1.5">
                <h2 className="font-(--font-editorial) text-[1.9rem] leading-none tracking-(--tracking-display) text-(--accent-primary) sm:text-[2.2rem]">
                    {title}
                </h2>
                {description ? <p className="max-w-2xl text-sm leading-6 text-(--text-secondary)">{description}</p> : null}
            </div>
        </div>
    );
}

interface CheckoutEventSummaryProps {
    title: string;
    posterImage?: string;
    scheduleDate?: string;
    venueName?: string;
    venueCity?: string;
    eventType?: string;
    badge?: string;
}

export function CheckoutEventSummary({
    title,
    posterImage,
    scheduleDate,
    venueName,
    venueCity,
    eventType,
    badge,
}: CheckoutEventSummaryProps) {
    return (
        <EditorialPanel className="overflow-hidden rounded-[calc(var(--radius-3xl)+0.25rem)] border-[rgba(111,121,120,0.16)] p-0">
            <div className="grid gap-0 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                <div className="relative min-h-28 bg-(--surface-muted) sm:min-h-full">
                    <Image
                        src={posterImage || "/placeholder.jpg"}
                        alt={title}
                        fill
                        sizes="(min-width: 640px) 6.5rem, 100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 via-black/5 to-transparent" />
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                        {(badge || eventType) ? (
                            <span className={cn(publicAuthSurface.eyebrow, "bg-(--surface-brand-soft) px-3 py-1 text-[0.65rem]")}>
                                {badge || eventType}
                            </span>
                        ) : null}
                        <span className="inline-flex rounded-full border border-[rgba(249,93,0,0.18)] bg-(--surface-accent) px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-(--accent-secondary)">
                            Checkout session
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h2 className="font-semibold leading-tight tracking-(--tracking-heading) text-foreground sm:text-lg">
                            {title}
                        </h2>
                        <div className="grid gap-3 text-sm text-(--text-secondary) sm:grid-cols-2">
                            {scheduleDate ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-(--border-light) bg-white px-4 py-3 shadow-(--shadow-xs)">
                                    <CalendarDays className="mt-0.5 h-4 w-4 text-(--accent-primary)" />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Jadwal</p>
                                        <p className="mt-1 font-medium text-foreground">{formatDate(scheduleDate)}</p>
                                    </div>
                                </div>
                            ) : null}
                            {(venueName || venueCity) ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-(--border-light) bg-white px-4 py-3 shadow-(--shadow-xs)">
                                    <MapPin className="mt-0.5 h-4 w-4 text-(--accent-primary)" />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Venue</p>
                                        <p className="mt-1 font-medium text-foreground">{[venueName, venueCity].filter(Boolean).join(", ")}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </EditorialPanel>
    );
}

interface CheckoutCalloutProps {
    tone?: "info" | "success" | "warning" | "error";
    title: string;
    description: ReactNode;
    icon?: LucideIcon;
    className?: string;
}

const calloutToneClasses: Record<NonNullable<CheckoutCalloutProps["tone"]>, string> = {
    info: "border-[rgba(41,179,182,0.2)] bg-(--info-bg) text-(--info-text)",
    success: "border-[rgba(19,135,108,0.2)] bg-(--success-bg) text-(--success-text)",
    warning: "border-[rgba(251,193,23,0.3)] bg-(--warning-bg) text-(--warning-text)",
    error: "border-[rgba(217,79,61,0.24)] bg-(--error-bg) text-(--error-text)",
};

export function CheckoutCallout({
    tone = "info",
    title,
    description,
    icon: Icon,
    className,
}: CheckoutCalloutProps) {
    return (
        <div className={cn("rounded-2xl border px-4 py-4 shadow-(--shadow-xs)", calloutToneClasses[tone], className)}>
            <div className="flex items-start gap-3">
                {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0" /> : null}
                <div className="space-y-1.5">
                    <p className="text-sm font-semibold">{title}</p>
                    <div className="text-sm leading-6">{description}</div>
                </div>
            </div>
        </div>
    );
}

interface CheckoutTrustPanelProps {
    title: string;
    description: ReactNode;
    badge?: string;
}

export function CheckoutTrustPanel({ title, description, badge }: CheckoutTrustPanelProps) {
    return (
        <div className="flex flex-col gap-4 rounded-[1.6rem] border border-[rgba(41,179,182,0.16)] bg-[linear-gradient(180deg,rgba(193,255,254,0.5),rgba(255,255,255,0.88))] px-5 py-5 shadow-(--shadow-sm) sm:flex-row sm:items-center sm:px-6">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-(--accent-primary) shadow-(--shadow-xs)">
                <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="space-y-1">
                <p className="font-semibold text-(--accent-primary)">{title}</p>
                <div className="text-sm leading-6 text-(--text-secondary)">{description}</div>
            </div>
            {badge ? (
                <span className="inline-flex rounded-full border border-[rgba(41,179,182,0.18)] bg-white px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-(--accent-primary) sm:ml-auto">
                    {badge}
                </span>
            ) : null}
        </div>
    );
}

interface CheckoutAssuranceChipProps {
    children: ReactNode;
}

export function CheckoutAssuranceChip({ children }: CheckoutAssuranceChipProps) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-full bg-[rgba(255,223,154,0.8)] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-on-tertiary-fixed,#251a00)]">
            <CheckCircle2 className="h-4 w-4" />
            <span>{children}</span>
        </div>
    );
}

interface CheckoutActionLink {
    href: string;
    label: string;
    icon?: LucideIcon;
}

interface CheckoutActionBarProps {
    primary?: CheckoutActionLink;
    secondary?: CheckoutActionLink;
    tertiary?: ReactNode;
}

function ActionButton({ href, label, icon: Icon, variant }: CheckoutActionLink & { variant: "primary" | "secondary" }) {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200",
                variant === "primary"
                    ? "bg-(--accent-secondary) text-white shadow-(--shadow-md) hover:bg-(--accent-secondary-hover)"
                    : "border border-(--border) bg-(--surface)/90 text-foreground shadow-(--shadow-xs) hover:border-(--border-strong) hover:bg-(--surface-hover)",
            )}
        >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {label}
            {variant === "primary" ? <ArrowRight className="h-4 w-4" /> : null}
        </Link>
    );
}

export function CheckoutActionBar({ primary, secondary, tertiary }: CheckoutActionBarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {primary ? <ActionButton {...primary} variant="primary" /> : null}
            {secondary ? <ActionButton {...secondary} variant="secondary" /> : null}
            {tertiary ? <div className="sm:ml-auto">{tertiary}</div> : null}
        </div>
    );
}

interface BookingCodePillProps {
    bookingCode?: string | null;
    label?: string;
}

export function BookingCodePill({ bookingCode, label = "Kode booking" }: BookingCodePillProps) {
    return (
        <div className="rounded-2xl border border-(--border-light) bg-(--surface-muted) px-4 py-3 shadow-(--shadow-xs)">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">{label}</p>
            <p className="mt-2 break-all font-mono text-base font-semibold text-foreground">{bookingCode || "Menunggu kode booking"}</p>
        </div>
    );
}
