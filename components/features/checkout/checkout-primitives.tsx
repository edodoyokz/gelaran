import type { ReactNode } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    type LucideIcon,
    Ticket,
    XCircle,
} from "lucide-react";
import { PublicLayout, SectionHeader } from "@/components/shared/phase-two-shells";
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
                <div className="pointer-events-none absolute inset-x-0 top-0 h-120 bg-[radial-gradient(circle_at_top_left,rgba(251,193,23,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(41,179,182,0.14),transparent_34%)]" />
                <section className="relative px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-12 lg:pt-12">
                    <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
                        <div className="space-y-5">
                            {backHref ? (
                                <Link
                                    href={backHref}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-(--border) bg-(--surface)/88 px-4 py-2 text-sm font-semibold text-foreground shadow-(--shadow-xs) backdrop-blur transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {backLabel}
                                </Link>
                            ) : null}

                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)] lg:items-end lg:gap-10">
                                <SectionHeader
                                    eyebrow={eyebrow}
                                    title={title}
                                    description={description}
                                    className="gap-3"
                                />
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
        <EditorialPanel className={cn("rounded-[calc(var(--radius-2xl)+0.5rem)] p-5 sm:p-6", className)}>
            <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            {Icon ? (
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                                    <Icon className="h-5 w-5" />
                                </span>
                            ) : null}
                            <div>
                                <h2 className="text-lg font-semibold tracking-(--tracking-heading) text-foreground sm:text-xl">
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
        <EditorialPanel className="overflow-hidden rounded-[calc(var(--radius-3xl)+0.25rem)] p-0">
            <div className="grid gap-0 sm:grid-cols-[11rem_minmax(0,1fr)]">
                <div className="relative min-h-56 bg-(--surface-muted) sm:min-h-full">
                    <img
                        src={posterImage || "/placeholder.jpg"}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />
                </div>
                <div className="space-y-5 p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2">
                        {(badge || eventType) ? (
                            <span className="inline-flex rounded-full border border-(--border) bg-(--surface-brand-soft) px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-(--accent-primary)">
                                {badge || eventType}
                            </span>
                        ) : null}
                        <span className="inline-flex rounded-full border border-[rgba(249,93,0,0.18)] bg-(--surface-accent) px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-(--accent-secondary)">
                            Checkout session
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h2 className="font-(--font-editorial) text-3xl leading-[0.98] tracking-(--tracking-display) text-foreground sm:text-4xl">
                            {title}
                        </h2>
                        <div className="grid gap-3 text-sm text-(--text-secondary) sm:grid-cols-2">
                            {scheduleDate ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-(--border-light) bg-(--surface) px-4 py-3 shadow-(--shadow-xs)">
                                    <CalendarDays className="mt-0.5 h-4 w-4 text-(--accent-primary)" />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Jadwal</p>
                                        <p className="mt-1 font-medium text-foreground">{formatDate(scheduleDate)}</p>
                                    </div>
                                </div>
                            ) : null}
                            {(venueName || venueCity) ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-(--border-light) bg-(--surface) px-4 py-3 shadow-(--shadow-xs)">
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

interface CheckoutStatusHeroProps {
    tone: "success" | "pending" | "failed";
    title: string;
    description: string;
    bookingCode?: string | null;
    highlight?: ReactNode;
    children?: ReactNode;
}

const statusConfig = {
    success: {
        icon: CheckCircle2,
        badge: "Pembayaran sukses",
        iconClassName: "bg-(--success-bg) text-(--success)",
        badgeClassName: "border-[rgba(19,135,108,0.22)] bg-(--success-bg) text-(--success-text)",
    },
    pending: {
        icon: Clock3,
        badge: "Menunggu konfirmasi",
        iconClassName: "bg-(--warning-bg) text-(--warning)",
        badgeClassName: "border-[rgba(251,193,23,0.3)] bg-(--warning-bg) text-(--warning-text)",
    },
    failed: {
        icon: XCircle,
        badge: "Pembayaran gagal",
        iconClassName: "bg-(--error-bg) text-(--error)",
        badgeClassName: "border-[rgba(217,79,61,0.22)] bg-(--error-bg) text-(--error-text)",
    },
} as const;

export function CheckoutStatusHero({
    tone,
    title,
    description,
    bookingCode,
    highlight,
    children,
}: CheckoutStatusHeroProps) {
    const config = statusConfig[tone];
    const Icon = config.icon;

    return (
        <EditorialPanel className="rounded-[calc(var(--radius-3xl)+0.25rem)] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-start">
                <div className="space-y-5">
                    <span className={cn("inline-flex rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em]", config.badgeClassName)}>
                        {config.badge}
                    </span>
                    <div className="space-y-4">
                        <span className={cn("inline-flex h-18 w-18 items-center justify-center rounded-[1.75rem] shadow-(--shadow-sm)", config.iconClassName)}>
                            <Icon className="h-9 w-9" />
                        </span>
                        <div className="space-y-3">
                            <h1 className="font-(--font-editorial) text-4xl leading-[0.95] tracking-(--tracking-display) text-foreground sm:text-5xl">
                                {title}
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-(--text-secondary) sm:text-lg">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children ? <div className="space-y-4">{children}</div> : null}
                </div>

                <div className="space-y-4">
                    <div className="rounded-[1.75rem] border border-(--border) bg-(--surface)/92 p-5 shadow-(--shadow-sm)">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Referensi transaksi</p>
                        <div className="mt-4 space-y-4">
                            <div className="rounded-2xl border border-(--border-light) bg-(--surface-muted) px-4 py-4 shadow-(--shadow-xs)">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-muted)">Kode booking</p>
                                <p className="mt-2 break-all font-mono text-lg font-semibold text-foreground sm:text-xl">{bookingCode || "Akan muncul setelah booking dibuat"}</p>
                            </div>
                            {highlight ? highlight : null}
                        </div>
                    </div>
                </div>
            </div>
        </EditorialPanel>
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

export function CheckoutStatusNotes() {
    return (
        <CheckoutCard title="Yang terjadi setelah ini" description="Gunakan halaman ini sebagai titik referensi setelah transaksi diproses." icon={Ticket}>
            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    {
                        title: "Email & notifikasi",
                        copy: "Gelaran mengirim pembaruan status dan instruksi lanjutan ke email yang kamu pakai saat checkout.",
                    },
                    {
                        title: "Riwayat booking",
                        copy: "Semua perubahan status juga bisa dipantau dari area booking customer ketika akun dan email cocok.",
                    },
                    {
                        title: "Dukungan lanjutan",
                        copy: "Gunakan kode booking saat menghubungi penyelenggara atau tim bantuan agar penanganan lebih cepat.",
                    },
                ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-(--border-light) bg-(--surface) px-4 py-4 shadow-(--shadow-xs)">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-(--text-secondary)">{item.copy}</p>
                    </div>
                ))}
            </div>
        </CheckoutCard>
    );
}
