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
                "flex min-h-[44px] items-center space-x-2.5 rounded-full border px-5 py-3 text-sm font-semibold whitespace-nowrap select-none transition-all duration-300",
                isActive
                    ? "border-transparent bg-(--accent-secondary) text-white shadow-[0_18px_35px_rgba(249,93,0,0.18)]"
                    : "border-(--border) bg-white text-(--text-secondary) hover:border-[rgba(249,93,0,0.25)] hover:bg-[rgba(249,93,0,0.04)] hover:text-foreground active:scale-95"
            )}
        >
            {icon && <span className={cn("shrink-0", isActive ? "text-white" : "text-(--accent-secondary)")}>{icon}</span>}
            <span>{name}</span>
        </button>
    );
}
