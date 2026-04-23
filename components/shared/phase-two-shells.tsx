import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, Inbox, Lock, MoonStar, ShieldCheck, type LucideIcon } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { publicAuthSurface } from "@/components/shared/public-auth-tokens";
import { cn } from "@/lib/utils";

interface PublicLayoutProps {
    children: ReactNode;
    navbarTransparent?: boolean;
    withFooter?: boolean;
    className?: string;
    mainClassName?: string;
}

export function PublicLayout({
    children,
    navbarTransparent = false,
    withFooter = true,
    className,
    mainClassName,
}: PublicLayoutProps) {
    return (
        <div className={cn("public-shell min-h-screen w-full bg-background text-foreground overflow-x-hidden", className)}>
            <Navbar transparent={navbarTransparent} className="public-shell-navbar" />
            <main className={cn("relative pt-24", mainClassName)}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(251,193,23,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(41,179,182,0.08),transparent_32%)]" />
                <div className="relative">{children}</div>
            </main>
            {withFooter ? <Footer /> : null}
        </div>
    );
}

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    aside?: ReactNode;
    leftImageSrc?: string;
}

const DEFAULT_AUTH_ASIDE_IMAGE = "https://images.unsplash.com/photo-1555400038-63f5ba517a47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80";

const authLayoutClasses = {
    root: "relative overflow-hidden bg-[var(--bg-auth-shell)] text-[var(--text-primary)] selection:bg-[var(--surface-chip)]",
    rootDecor: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(41,179,182,0.1),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(251,193,23,0.12),transparent_30%)] lg:hidden",
    header: "fixed inset-x-0 top-0 z-50 border-none bg-[color-mix(in_srgb,var(--bg-auth-shell)_90%,white_10%)]/95 shadow-none backdrop-blur-sm",
    headerNav: "mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5 md:px-10 md:py-6 lg:px-12",
    brand: "font-[var(--font-editorial)] text-2xl font-black tracking-[-0.05em] text-[var(--accent-primary)]",
    actions: "flex items-center gap-3 sm:gap-5",
    helpLink: "inline-flex items-center gap-2 text-sm font-medium text-(--text-secondary) transition-colors duration-200 hover:text-(--accent-primary)",
    iconButton: "inline-flex items-center justify-center rounded-full p-2 text-[var(--accent-primary)] transition-colors duration-300 hover:bg-[var(--bg-public-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:opacity-100",
    main: "relative min-h-screen pt-20 lg:flex lg:items-stretch lg:pt-0",
    asidePanel: "relative hidden overflow-hidden bg-[var(--bg-auth-aside)] lg:flex lg:min-h-screen lg:w-[56%] xl:w-[58%]",
    asideImage: "h-full w-full object-cover opacity-90 mix-blend-multiply grayscale-[0.2]",
    asideOverlay: "absolute inset-0 bg-[var(--auth-shell-overlay)]",
    asideContent: "relative z-20 flex max-w-3xl flex-col justify-end px-12 pb-[4.5rem] pt-24 xl:px-20 xl:pb-24",
    asideTitle: "mb-8 max-w-[12ch] font-[var(--font-editorial)] text-5xl font-black leading-[1.04] tracking-[var(--tracking-display)] text-[var(--accent-primary)] xl:text-7xl",
    asideCallout: "flex w-fit items-center gap-4 rounded-[var(--radius-lg)] border border-white/20 bg-[var(--surface-auth-aside)] px-6 py-4 backdrop-blur-md",
    asideCalloutText: "text-sm font-medium uppercase tracking-[0.14em] text-[var(--auth-shell-strong)]",
    formPanel: "relative flex min-h-screen w-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(250,249,247,0.98))] px-6 py-10 pt-28 sm:px-8 md:px-12 md:py-12 md:pt-[7.5rem] lg:min-h-screen lg:w-[44%] lg:bg-[var(--bg-auth-panel)] lg:px-12 lg:py-12 xl:w-[42%] xl:px-20",
    formPanelDecor: "pointer-events-none absolute right-0 top-0 hidden h-full w-40 bg-[linear-gradient(180deg,rgba(239,238,236,0.7),rgba(239,238,236,0))] lg:block",
    secureChipWrap: "mb-4 sm:mb-6 flex w-full justify-start lg:justify-end",
    secureChip: "inline-flex items-center gap-2 rounded-full bg-[var(--surface-auth-chip)] px-3 py-1.5",
    secureChipText: "text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--auth-shell-chip-text)]",
    card: "relative w-full rounded-[var(--radius-xl)] border border-[var(--auth-shell-border)] bg-[var(--surface)] p-6 shadow-[var(--auth-shell-shadow)] sm:p-8 lg:p-10",
    footer: "mt-8 flex flex-wrap justify-center gap-5 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--auth-shell-muted)] sm:mt-auto sm:pt-12",
    footerLink: "transition-colors hover:text-[var(--accent-primary)]",
};

export function AuthLayout({
    children,
    title = "Rediscover Solo's Heritage",
    aside,
    leftImageSrc = DEFAULT_AUTH_ASIDE_IMAGE,
}: AuthLayoutProps) {
    return (
        <div className={authLayoutClasses.root}>
            <div className={authLayoutClasses.rootDecor} />
            <header className={authLayoutClasses.header}>
                <nav className={authLayoutClasses.headerNav}>
                    <Link href="/" className={authLayoutClasses.brand}>
                        Gelaran
                    </Link>
                    <div className={authLayoutClasses.actions}>
                        <Link href="/contact" className={authLayoutClasses.helpLink}>
                            <HelpCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Need help?</span>
                        </Link>
                        <button type="button" aria-label="Theme toggle unavailable" disabled className={authLayoutClasses.iconButton}>
                            <MoonStar className="h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </header>

            <main className={authLayoutClasses.main}>
                <section className={authLayoutClasses.asidePanel}>
                    <div className="absolute inset-0 z-0">
                        <img
                            className={authLayoutClasses.asideImage}
                            alt="Gelaran visual"
                            src={leftImageSrc}
                        />
                    </div>
                    <div className={cn("absolute inset-0 z-10", authLayoutClasses.asideOverlay)}></div>

                    <div className={authLayoutClasses.asideContent}>
                        <h1 className={authLayoutClasses.asideTitle}>
                            {title}
                        </h1>

                        {aside ? (
                            aside
                        ) : (
                            <div className={authLayoutClasses.asideCallout}>
                                <ShieldCheck className="h-5 w-5 text-[var(--accent-primary)]" />
                                <p className={authLayoutClasses.asideCalloutText}>Preserving culture for future generations.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className={authLayoutClasses.formPanel}>
                    <div className={authLayoutClasses.formPanelDecor} />
                    
                    <div className="flex w-full flex-col my-auto mx-auto max-w-[34rem]">
                        <div className={authLayoutClasses.secureChipWrap}>
                            <div className={authLayoutClasses.secureChip}>
                                <Lock className="h-4 w-4 text-[var(--auth-shell-chip-text)]" />
                                <span className={authLayoutClasses.secureChipText}>Secure Access</span>
                            </div>
                        </div>

                        <div className={authLayoutClasses.card}>
                            {children}
                        </div>
                    </div>

                    <div className={authLayoutClasses.footer}>
                        <Link href="/privacy" className={authLayoutClasses.footerLink}>Privacy Policy</Link>
                        <Link href="/terms" className={authLayoutClasses.footerLink}>Terms of Service</Link>
                        <span className="cursor-default">© {new Date().getFullYear()} Gelaran</span>
                    </div>
                </section>
            </main>
        </div>
    );
}

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: "left" | "center";
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({
    eyebrow,
    title,
    description,
    align = "left",
    action,
    className,
}: SectionHeaderProps) {
    const centered = align === "center";

    return (
        <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", centered && "items-center text-center md:flex-col md:items-center", className)}>
            <div className={cn("max-w-3xl space-y-3", centered && "mx-auto")}>
                {eyebrow ? (
                    <span className={cn(publicAuthSurface.eyebrow, "bg-(--surface-brand-soft) px-3 py-1 text-xs")}>
                        {eyebrow}
                    </span>
                ) : null}
                <div className="space-y-2">
                    <h2 className="font-(--font-editorial) text-3xl leading-none tracking-(--tracking-display) text-foreground sm:text-4xl">
                        {title}
                    </h2>
                    {description ? (
                        <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

interface StatsCardProps {
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
    trend?: string;
    tone?: "default" | "accent" | "success" | "warning";
    meta?: ReactNode;
    className?: string;
}

const statsToneClasses: Record<NonNullable<StatsCardProps["tone"]>, string> = {
    default: "border-(--border) bg-(--surface)",
    accent: "border-[rgba(41,179,182,0.24)] bg-(--surface-brand-soft)",
    success: "border-[rgba(19,135,108,0.22)] bg-(--success-bg)",
    warning: "border-[rgba(251,193,23,0.28)] bg-(--warning-bg)",
};

export function StatsCard({
    label,
    value,
    icon: Icon,
    trend,
    tone = "default",
    meta,
    className,
}: StatsCardProps) {
    return (
        <article className={cn("group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-(--shadow-sm) transition-transform duration-200 hover:-translate-y-0.5", statsToneClasses[tone], className)}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]" />
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-(--text-secondary)">{label}</p>
                    <div className="space-y-1">
                        <p className="text-2xl font-semibold tracking-(--tracking-heading) text-foreground sm:text-3xl">{value}</p>
                        {meta ? <div className="text-sm text-(--text-secondary)">{meta}</div> : null}
                    </div>
                </div>
                {Icon ? (
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--border) bg-(--surface-elevated) text-(--accent-primary) shadow-(--shadow-xs)">
                        <Icon className="h-5 w-5" />
                    </span>
                ) : null}
            </div>
            {trend ? (
                <p className="mt-5 text-sm font-medium text-(--text-secondary)">{trend}</p>
            ) : null}
        </article>
    );
}

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
    className,
}: EmptyStateProps) {
    return (
        <section className={cn("rounded-[2rem] border border-dashed border-(--border-strong) bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,250,249,0.88))] p-8 text-center shadow-(--shadow-sm) sm:p-10", className)}>
            <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                    <Icon className="h-7 w-7" />
                </span>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-(--tracking-heading) text-foreground">{title}</h3>
                    <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">{description}</p>
                </div>
                {action ? <div className="pt-2">{action}</div> : null}
            </div>
        </section>
    );
}

interface DashboardContentProps {
    children: ReactNode;
    className?: string;
    width?: "default" | "wide" | "full";
}

export function DashboardContent({
    children,
    className,
    width = "wide",
}: DashboardContentProps) {
    const widthClassName = width === "full"
        ? "max-w-none"
        : width === "default"
            ? "max-w-6xl"
            : "max-w-7xl";

    return (
        <div className={cn("mx-auto w-full px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-14", widthClassName, className)}>
            {children}
        </div>
    );
}

interface DashboardPageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    actions?: ReactNode;
}

export function DashboardPageHeader({
    eyebrow,
    title,
    description,
    action,
    actions,
}: DashboardPageHeaderProps) {
    return (
        <header className="relative overflow-hidden rounded-[2rem] border border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,249,248,0.9))] p-6 shadow-(--shadow-sm) backdrop-blur sm:p-8">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_center,rgba(41,179,182,0.16),transparent_60%)]" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-3">
                    {eyebrow ? (
                        <span className={cn(publicAuthSurface.eyebrow, "bg-(--surface-brand-soft) px-3 py-1 text-xs")}>
                            {eyebrow}
                        </span>
                    ) : null}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-(--tracking-heading) text-foreground sm:text-4xl">
                            {title}
                        </h1>
                        {description ? (
                            <p className="max-w-2xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                    {action}
                </div>
            </div>
        </header>
    );
}

interface DashboardSectionProps {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
    children: ReactNode;
    className?: string;
}

export function DashboardSection({
    title,
    description,
    actionHref,
    actionLabel,
    children,
    className,
}: DashboardSectionProps) {
    return (
        <section className={cn("rounded-[1.85rem] border border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.9))] p-5 shadow-(--shadow-sm) sm:p-6", className)}>
            {title || description || actionHref ? (
                <div className="mb-5 flex flex-col gap-3 border-b border-(--border-light) pb-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
                        {description ? <p className="text-sm leading-6 text-(--text-secondary)">{description}</p> : null}
                    </div>
                    {actionHref && actionLabel ? (
                        <Link href={actionHref} className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary) transition-opacity hover:opacity-80">
                            {actionLabel}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : null}
                </div>
            ) : null}
            {children}
        </section>
    );
}
