import { cloneElement, isValidElement, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { publicAuthSurface, publicAuthToneMessages, publicAuthTonePanels } from "@/components/shared/public-auth-tokens";
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
        <header className={cn("mb-10 space-y-4 sm:mb-12", centered && "text-center", className)}>
            {eyebrow ? (
                <span className={cn(publicAuthSurface.eyebrow, "rounded-md bg-[var(--surface-highlight)] text-[var(--auth-shell-chip-text)] shadow-none")}>
                    {eyebrow}
                </span>
            ) : null}
            <h2 className="font-(--font-editorial) text-[2rem] font-bold leading-[1.08] tracking-(--tracking-display) text-(--accent-primary) sm:text-[2.45rem]">
                {title}
            </h2>
            {description ? (
                <p className={cn("max-w-[38rem] text-(--text-secondary) text-sm leading-7 sm:text-[0.95rem]", centered && "mx-auto")}>
                    {description}
                </p>
            ) : null}
            {footer ? <div className="mt-4 text-sm text-(--text-secondary)">{footer}</div> : null}
        </header>
    );
}

export function AuthKicker({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-sm bg-[var(--surface-highlight)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.26em] text-[var(--auth-shell-chip-text)]",
                className,
            )}
        >
            {children}
        </span>
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
        <div className={cn("space-y-8 sm:space-y-9", className)}>
            {children}
        </div>
    );
}

export function AuthEditorialPanel({
    kicker,
    title,
    description,
    badge,
    className,
}: {
    kicker?: ReactNode;
    title: ReactNode;
    description: ReactNode;
    badge?: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "rounded-[1.7rem] border border-[rgba(190,200,200,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,243,241,0.84))] p-6 shadow-(--shadow-sm) sm:p-7",
                className,
            )}
        >
            <div className="space-y-4">
                {kicker ? (
                    <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9d7400]">
                        {kicker}
                    </div>
                ) : null}
                <div className="space-y-3">
                    <h3 className="font-(--font-editorial) text-[1.75rem] leading-[1.1] tracking-(--tracking-display) text-(--accent-primary) sm:text-[2.15rem]">
                        {title}
                    </h3>
                    <div className="max-w-xl text-sm leading-7 text-(--text-secondary) sm:text-[0.95rem]">{description}</div>
                </div>
                {badge ? (
                    <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/70 bg-white/88 px-4 py-3 text-sm font-semibold text-(--text-secondary) shadow-(--shadow-xs)">
                        {badge}
                    </div>
                ) : null}
            </div>
        </section>
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
        default: publicAuthTonePanels.default,
        success: publicAuthTonePanels.success,
        warning: publicAuthTonePanels.warning,
        danger: publicAuthTonePanels.danger,
    }[tone];

    return (
        <div className={cn("rounded-[1.45rem] border p-5 shadow-(--shadow-md) sm:rounded-[1.6rem] sm:p-6", toneClassName, className)}>
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
        default: publicAuthToneMessages.default,
        success: publicAuthToneMessages.success,
        warning: publicAuthToneMessages.warning,
        danger: publicAuthToneMessages.danger,
    }[tone];
    const liveRegionRole = tone === "danger" ? "alert" : "status";
    const liveRegionMode = tone === "danger" ? "assertive" : "polite";

    return (
        <div
            role={liveRegionRole}
            aria-live={liveRegionMode}
            aria-atomic="true"
            className={cn("flex gap-3 rounded-[1.25rem] border px-4 py-3.5 text-sm leading-6 shadow-(--shadow-sm)", palette, className)}
        >
            {Icon ? (
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-(--shadow-xs)">
                    <Icon aria-hidden="true" className="h-4 w-4" />
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
    htmlFor,
    label,
    helper,
    error,
    children,
}: {
    htmlFor: string;
    label: string;
    helper?: ReactNode;
    error?: ReactNode;
    children: ReactNode;
}) {
    const helperId = helper ? `${htmlFor}-helper` : undefined;
    const errorId = error ? `${htmlFor}-error` : undefined;
    const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

    const enhancedChild = isValidElement(children)
        ? cloneElement(children, {
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
        } as Record<string, unknown>)
        : children;

    return (
        <div className="relative group min-w-0">
            <label htmlFor={htmlFor} className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.28em] text-(--text-secondary)">
                {label}
            </label>
            {enhancedChild}
            {helper ? <div id={helperId} className="mt-3 flex justify-end text-[11px] font-semibold text-(--text-link)">{helper}</div> : null}
            {error ? <p id={errorId} className="mt-1 text-xs font-medium text-(--error-text)">{error}</p> : null}
        </div>
    );
}

export function AuthInputShell({
    icon: Icon,
    className,
    inputClassName,
    ...props
}: ComponentProps<"input"> & {
    icon?: LucideIcon;
    className?: string;
    inputClassName?: string;
}) {
    return (
        <div className={cn(publicAuthSurface.fieldShell, className)}>
            {Icon ? (
                <span aria-hidden="true" className="mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center text-(--text-secondary)">
                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
            ) : null}
            <input
                {...props}
                className={cn(
                    publicAuthSurface.fieldInput,
                    "placeholder:text-(--text-muted)/60",
                    inputClassName,
                )}
            />
        </div>
    );
}

export function AuthPasswordShell({
    icon: Icon,
    endAdornment,
    className,
    inputClassName,
    ...props
}: ComponentProps<"input"> & {
    icon?: LucideIcon;
    endAdornment?: ReactNode;
    className?: string;
    inputClassName?: string;
}) {
    return (
        <div className={cn(publicAuthSurface.fieldShell, className)}>
            {Icon ? (
                <span aria-hidden="true" className="mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center text-(--text-secondary)">
                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
            ) : null}
            <input
                {...props}
                className={cn(
                    publicAuthSurface.fieldInput,
                    endAdornment ? "pr-10" : "",
                    inputClassName,
                )}
            />
            {endAdornment ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{endAdornment}</div> : null}
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
                publicAuthSurface.iconButton,
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
                publicAuthSurface.primaryButton,
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
                publicAuthSurface.secondaryButton,
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
                publicAuthSurface.textLink,
                "ml-1",
                className,
            )}
        >
            {children}
        </Link>
    );
}

export function AuthMetaList({
    items,
    renderBullet,
    className,
}: {
    items: string[];
    renderBullet?: (item: string, index: number) => ReactNode;
    className?: string;
}) {
    return (
        <ul className={cn("grid gap-2 text-sm text-(--text-secondary)", className)}>
            {items.map((item, index) => (
                <li key={item} className={cn("flex items-start gap-3 px-4 py-3", publicAuthSurface.panelSoft)}>
                    {renderBullet ? renderBullet(item, index) : <span aria-hidden="true" className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-(--accent-primary)" />}
                    <span className="leading-6">{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function AuthFeatureGrid({
    items,
    columns = 1,
    className,
}: {
    items: Array<{
        title: string;
        description: string;
        icon?: LucideIcon;
    }>;
    columns?: 1 | 2 | 3;
    className?: string;
}) {
    const columnClassName = columns === 3
        ? "md:grid-cols-3"
        : columns === 2
            ? "md:grid-cols-2"
            : "grid-cols-1";

    return (
        <div className={cn("grid gap-3", columnClassName, className)}>
            {items.map(({ title, description, icon: Icon }) => (
                <article key={title} className="rounded-[1.2rem] border border-(--border-light) bg-white/72 px-4 py-4 shadow-(--shadow-xs)">
                    {Icon ? (
                        <span aria-hidden="true" className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-highlight)] text-[var(--accent-primary)]">
                            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                        </span>
                    ) : null}
                    <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="text-sm leading-6 text-(--text-secondary)">{description}</p>
                    </div>
                </article>
            ))}
        </div>
    );
}

export function AuthLegalNote({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p className={cn("text-sm leading-6 text-(--text-secondary)", className)}>
            {children}
        </p>
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
        <p className={cn("text-center text-sm text-(--text-secondary)", className)}>
            {children}
        </p>
    );
}
