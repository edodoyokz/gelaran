"use client";

import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

interface OrganizerHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    actions?: React.ReactNode;
    showCreateButton?: boolean;
}

export function OrganizerHeader({ 
    title, 
    subtitle, 
    backHref,
    actions,
    showCreateButton = true,
}: OrganizerHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)]">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {backHref && (
                            <Link 
                                href={backHref}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
                            {subtitle && (
                                <p className="text-[var(--text-muted)]">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {actions}
                        {showCreateButton && (
                            <Link
                                href="/organizer/events/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Plus className="h-5 w-5" />
                                <span className="hidden sm:inline">Buat Event</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
