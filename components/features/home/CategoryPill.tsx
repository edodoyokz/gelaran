"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
    icon?: ReactNode;
    name: string;
    isActive?: boolean;
    onClick?: () => void;
    controlsId?: string;
}

export function CategoryPill({ icon, name, isActive = false, onClick, controlsId }: CategoryPillProps) {
    return (
        <button
            type="button"
            aria-pressed={isActive}
            aria-controls={controlsId}
            onClick={onClick}
            className={cn(
                "flex min-h-[44px] w-full items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold select-none transition-all duration-300 sm:w-auto sm:rounded-full sm:whitespace-nowrap sm:px-5",
                isActive
                    ? "border-transparent bg-(--accent-secondary) text-white shadow-[0_18px_35px_rgba(249,93,0,0.18)]"
                    : "border-(--border) bg-white text-(--text-secondary) hover:border-[rgba(249,93,0,0.25)] hover:bg-[rgba(249,93,0,0.04)] hover:text-foreground active:scale-95"
            )}
        >
            {icon && <span className={cn("shrink-0", isActive ? "text-white" : "text-(--accent-secondary)")}>{icon}</span>}
            <span className="truncate">{name}</span>
        </button>
    );
}
