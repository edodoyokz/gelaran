import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function AuthPageIntro({
    eyebrow,
    title,
    description,
    footer,
    align = "left",
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: ReactNode;
    footer?: ReactNode;
    align?: "left" | "center";
    className?: string;
}) {
    const centered = align === "center";

    return (
        <header className={cn("mb-12", centered && "text-center", className)}>
            {eyebrow ? (
                <span className="inline-block px-3 py-1 bg-[#ffdf9a] text-[#654b00] text-xs font-bold tracking-widest uppercase mb-6 rounded-sm">
                    {eyebrow}
                </span>
            ) : null}
            <h2 className="font-headline text-4xl font-bold text-[#015959] mb-3 leading-tight">
                {title}
            </h2>
            {description ? (
                <p className="text-[#3f4948] text-sm leading-relaxed">
                    {description}
                </p>
            ) : null}
            {footer ? <div className="mt-4 text-sm text-[#3f4948]">{footer}</div> : null}
        </header>
    );
}

export function AuthFormShell({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("space-y-8", className)}>
            {children}
        </div>
    );
}

export function AuthSectionCard({
    children,
    className,
    tone = "default",
}: {
    children: ReactNode;
    className?: string;
    tone?: "default" | "success" | "warning" | "danger";
}) {
    const toneClassName = {
        default: "border-[#bec8c8]/20 bg-[#faf9f7]",
        success: "border-[#13876c]/20 bg-[#13876c]/10",
        warning: "border-[#d89d00]/20 bg-[#d89d00]/10",
        danger: "border-[#d94f3d]/20 bg-[#d94f3d]/10",
    }[tone];

    return (
        <div className={cn("rounded-xl border p-5 shadow-[0px_10px_30px_rgba(0,32,32,0.03)] sm:p-6", toneClassName, className)}>
            {children}
        </div>
    );
}

export function AuthMessage({
    tone = "default",
    icon: Icon,
    title,
    description,
    className,
}: {
    tone?: "default" | "success" | "warning" | "danger";
    icon?: LucideIcon;
    title?: string;
    description: ReactNode;
    className?: string;
}) {
    const palette = {
        default: "border-[#bec8c8]/20 bg-[#faf9f7] text-[#3f4948]",
        success: "border-[#13876c]/20 bg-[#13876c]/10 text-[#0e5d4a]",
        warning: "border-[#d89d00]/20 bg-[#d89d00]/10 text-[#7a5b00]",
        danger: "border-[#d94f3d]/20 bg-[#d94f3d]/10 text-[#8f2f22]",
    }[tone];

    return (
        <div className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm leading-6", palette, className)}>
            {Icon ? (
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-[0px_4px_12px_rgba(0,32,32,0.04)]">
                    <Icon className="h-4 w-4" />
                </span>
            ) : null}
            <div className="space-y-1">
                {title ? <p className="font-semibold text-foreground">{title}</p> : null}
                <div>{description}</div>
            </div>
        </div>
    );
}

export function AuthField({
    label,
    helper,
    error,
    children,
}: {
    label: string;
    helper?: ReactNode;
    error?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="relative group">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#3f4948] mb-2">
                {label}
            </label>
            {children}
            {helper ? <div className="mt-3 flex justify-end text-[11px] font-semibold text-[#29B3B6]">{helper}</div> : null}
            {error ? <p className="mt-1 text-xs font-medium text-[#ba1a1a]">{error}</p> : null}
        </div>
    );
}

export function AuthInputShell({
    className,
    inputClassName,
    ...props
}: ComponentProps<"input"> & {
    icon?: LucideIcon;
    className?: string;
    inputClassName?: string;
}) {
    return (
        <div className={cn("relative flex items-center", className)}>
            <input
                {...props}
                className={cn(
                    "w-full bg-[#f4f3f1] border-b-2 border-[#bec8c8] focus:border-[#1e6868] focus:ring-0 transition-all duration-300 py-3 px-0 placeholder:text-[#6f7978]/40 outline-none appearance-none rounded-none text-[#1a1c1b]",
                    inputClassName,
                )}
            />
        </div>
    );
}

export function AuthPasswordShell({
    endAdornment,
    className,
    inputClassName,
    ...props
}: ComponentProps<"input"> & {
    endAdornment?: ReactNode;
    className?: string;
    inputClassName?: string;
}) {
    return (
        <div className={cn("relative flex items-center", className)}>
            <input
                {...props}
                className={cn(
                    "w-full bg-[#f4f3f1] border-b-2 border-[#bec8c8] focus:border-[#1e6868] focus:ring-0 transition-all duration-300 py-3 px-0 outline-none appearance-none rounded-none text-[#1a1c1b]",
                    endAdornment ? "pr-10" : "",
                    inputClassName,
                )}
            />
            {endAdornment ? <div className="absolute right-0 top-1/2 -translate-y-1/2">{endAdornment}</div> : null}
        </div>
    );
}

export function AuthIconButton({
    className,
    children,
    ...props
}: ComponentProps<"button">) {
    return (
        <button
            type="button"
            {...props}
            className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6f7978] transition-colors duration-200 hover:bg-[#efeeec] hover:text-[#015959] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29B3B6]",
                className,
            )}
        >
            {children}
        </button>
    );
}

export function AuthPrimaryButton({
    children,
    className,
    ...props
}: ComponentProps<"button">) {
    return (
        <button
            {...props}
            className={cn(
                "bg-linear-to-t from-[#672200] to-[#8d3100] w-full py-5 rounded-lg text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#672200]/10 hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
                className,
            )}
        >
            {children}
        </button>
    );
}

export function AuthSecondaryLink({
    href,
    children,
    className,
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#bec8c8] bg-white px-5 py-3 text-sm font-semibold text-[#1a1c1b] shadow-[0px_4px_12px_rgba(0,32,32,0.02)] transition-colors duration-200 hover:border-[#6f908e] hover:bg-[#faf9f7]",
                className,
            )}
        >
            {children}
        </Link>
    );
}

export function AuthTextLink({
    href,
    children,
    className,
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "text-[#29B3B6] font-bold hover:underline underline-offset-4 transition-all ml-1",
                className,
            )}
        >
            {children}
        </Link>
    );
}

export function AuthMetaList({
    items,
    className,
}: {
    items: string[];
    className?: string;
}) {
    return (
        <ul className={cn("grid gap-2 text-sm text-[#3f4948]", className)}>
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-[#bec8c8] bg-white/88 px-4 py-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#015959]" />
                    <span className="leading-6">{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function AuthFinePrint({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p className={cn("text-center text-sm text-[#3f4948]", className)}>
            {children}
        </p>
    );
}
