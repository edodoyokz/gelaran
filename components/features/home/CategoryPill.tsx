"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
    icon?: ReactNode;
    name: string;
    isActive?: boolean;
    onClick?: () => void;
}

export function CategoryPill({ icon, name, isActive = false, onClick }: CategoryPillProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center space-x-2.5 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap min-h-[44px] select-none",
                isActive
                    ? "bg-[var(--accent-gradient)] text-white shadow-glow scale-105 border-transparent"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:shadow-md active:scale-95"
            )}
        >
            {icon && <span className={cn("shrink-0", isActive ? "text-white" : "text-[var(--text-muted)]")}>{icon}</span>}
            <span>{name}</span>
        </button>
    );
}
