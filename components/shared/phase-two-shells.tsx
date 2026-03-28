import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Inbox, type LucideIcon } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { MaterialSymbol } from "@/components/ui/material-symbol";
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
        <div className={cn("min-h-screen bg-background text-foreground", className)}>
            <Navbar transparent={navbarTransparent} />
            <main className={cn("pt-24", mainClassName)}>{children}</main>
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

export function AuthLayout({
    children,
    title = "Rediscover Solo's Heritage",
    aside,
    leftImageSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuCmsN8i1VFRYb23lkGJh1NyRupq1_s6H9YdW7UijQAiZ8qscXpnh9Y_BYHCqLL98eOu7-0OEIQKHges0gxr2eHTWrTjYJSVRyYzjgvkCZ1LYZ3VeTiJ9FvtBTll7WQEXqFYP9fmJFBDBsEe5_88KHe8xm_PIT9hD8qeHUGMO0NVcSbbfUN0JBJOySBKdV6vPCD0rAKr1IupHNa-zfwkAq7T0x9EzJRv-AiPLPU_Y0vVJROxrsncUCrPan4L9NKnn6uOcDu6YQWOqNw",
}: AuthLayoutProps) {
    return (
        <div className="bg-[#faf9f7] font-body text-[#1a1c1b] selection:bg-[#a7eceb]">
            {/* TopNavBar */}
            <header className="fixed w-full top-0 z-50 bg-[#faf9f7] border-none shadow-none">
                <nav className="flex justify-between items-center w-full px-12 py-6">
                    <Link href="/" className="text-2xl font-headline font-black text-[#015959]">
                        Gelaran
                    </Link>
                    <div className="hidden sm:flex items-center gap-6">
                        <button type="button" className="hover:bg-[#efeeec] transition-colors duration-300 p-2 rounded-full flex items-center justify-center text-[#015959]">
                            <MaterialSymbol className="shrink-0" name="light_mode" />
                        </button>
                    </div>
                </nav>
            </header>

            <main className="min-h-screen flex items-stretch">
                {/* Left/Brand Panel: Editorial Brand Image */}
                <section className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-[#efeeec]">
                    <div className="absolute inset-0 z-0">
                        <img 
                            className="w-full h-full object-cover opacity-90 mix-blend-multiply grayscale-[0.2]" 
                            alt="Gelaran visual" 
                            src={leftImageSrc}
                        />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-r from-[#efeeec]/80 to-transparent z-10"></div>
                    
                    <div className="relative z-20 flex flex-col justify-end p-24 max-w-3xl">
                        <h1 className="font-headline font-black text-6xl lg:text-7xl text-[#015959] leading-[1.1] tracking-tight mb-8">
                            {title}
                        </h1>

                        {aside ? (
                            aside
                        ) : (
                            <div className="flex items-center gap-4 py-4 px-6 bg-white/40 backdrop-blur-md rounded-lg w-fit border border-white/20">
                                <MaterialSymbol className="text-[#015959]" filled name="verified_user" />
                                <p className="text-[#002020] font-medium tracking-wide text-sm uppercase">Preserving culture for future generations.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right/Login Panel: Pure White Background */}
                <section className="w-full lg:w-2/5 bg-white flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative pt-24 lg:pt-12">
                    {/* Secure Accent Chip */}
                    <div className="absolute top-24 lg:top-32 right-8 lg:right-24 hidden sm:block">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#FBC117]/10 rounded-full">
                            <MaterialSymbol className="text-[#483500] text-sm" filled name="lock" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#483500]">Secure Access</span>
                        </div>
                    </div>

                    <div className="max-w-md w-full mx-auto p-10 bg-white rounded-xl border border-[#bec8c8]/10 shadow-[0px_20px_50px_rgba(0,32,32,0.04)]">
                        {children}
                    </div>

                    {/* Contextual Footer (Simplified for Login) */}
                    <div className="mt-auto pt-12 flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#015959]/40">
                        <Link href="/privacy" className="hover:text-[#015959] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[#015959] transition-colors">Terms of Service</Link>
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
                    <span className="inline-flex rounded-full border border-(--border) bg-(--surface-brand-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-primary)">
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
        <article className={cn("group rounded-2xl border p-5 shadow-(--shadow-sm) transition-transform duration-200 hover:-translate-y-0.5", statsToneClasses[tone], className)}>
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
        <section className={cn("rounded-3xl border border-dashed border-(--border-strong) bg-(--surface)/92 p-8 text-center shadow-(--shadow-sm) sm:p-10", className)}>
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
        <header className="rounded-3xl border border-(--border) bg-(--surface)/88 p-6 shadow-(--shadow-sm) backdrop-blur sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-3">
                    {eyebrow ? (
                        <span className="inline-flex rounded-full border border-(--border) bg-(--surface-brand-soft) px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-primary)">
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
        <section className={cn("rounded-3xl border border-(--border) bg-(--surface)/94 p-5 shadow-(--shadow-sm) sm:p-6", className)}>
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
