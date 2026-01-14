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
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border-transparent"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md active:scale-95"
            )}
        >
            {icon && <span className={cn("shrink-0", isActive ? "text-white" : "text-gray-400")}>{icon}</span>}
            <span>{name}</span>
        </button>
    );
}
