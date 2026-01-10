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
                "flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            )}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            <span>{name}</span>
        </button>
    );
}
